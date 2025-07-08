<?php
require_once __DIR__ . '/../db.php';

class Pret {
    public static function insertPret($data) {
        $db = getDB();
        $stmt = $db->prepare("INSERT INTO s4_final_pret (montant, date_pret, id_client, id_type_pret, duree) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$data->montant, $data->date_pret, $data->id_client, $data->id_type_pret, $data->duree]);
        return $db->lastInsertId();
    }

    public static function insertMouvementFond($type, $montant, $id_ef, $date) {
        $db = getDB();
        $stmt = $db->prepare("INSERT INTO s4_final_mouvement_fond (montant, type, date_mouvement, id_ef) VALUES (?, ?, ?, ?)");
        return $stmt->execute([$montant, $type, $date, $id_ef]);
    }

    public static function updateCompteClient($id_compte, $montant) {
        $db = getDB();
        $stmt = $db->prepare("UPDATE s4_final_compte SET solde = solde + ? WHERE id = ?");
        return $stmt->execute([$montant, $id_compte]);
    }

    public static function insertMouvementCompte($montant, $motif, $id_compte, $date) {
        $db = getDB();
        $stmt = $db->prepare("INSERT INTO s4_final_mouvement_compte (type, motif, date_transaction, montant, id_compte) VALUES ('entree', ?, ?, ?, ?)");
        return $stmt->execute([$motif, $date, $montant, $id_compte]);
    }

    public static function insertStatutPret($id_pret, $date, $idStatut) {
        $db = getDB();
        $stmt = $db->prepare("INSERT INTO s4_final_statut_pret (id_pret, id_statut, date_statut) VALUES (?, ?, ?)");
        return $stmt->execute([$id_pret, $idStatut, $date]);
    }

    public static function interetInfDate($date) {
        $db = getDB();
        $stmt = $db->prepare("
            SELECT SUM(interet) AS total_interet 
            FROM s4_final_remboursement 
            WHERE CONCAT(annee, '-', LPAD(mois, 2, '0'), '-01') < ?
        ");
        $stmt->execute([$date]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['total_interet'] ?? 0;
    }

    public static function getSoldeEf($id_ef, $date) {
        $db = getDB();
        
        $sql = "
            SELECT 
                SUM(CASE WHEN type = 'entree' THEN montant ELSE 0 END) AS total_entree,
                SUM(CASE WHEN type = 'sortie' THEN montant ELSE 0 END) AS total_sortie
            FROM s4_final_mouvement_fond
            WHERE id_ef = ? AND DATE(date_mouvement) <= ?
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([$id_ef, $date]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$result) {
            return 0; 
        }
        $interet = Pret::interetInfDate($date);
        $total_entree = $result['total_entree'] ?? 0;
        $total_sortie = $result['total_sortie'] ?? 0;
        $total_entree += $interet; 
        return $total_entree - $total_sortie;
    }

    public static function getPretDetails($id_pret) {
        $db = getDB();
        $sql = "SELECT 
                    p.id, p.montant, p.date_pret, p.duree,
                    c.nom as client_nom, c.prenom as client_prenom, c.mail as client_mail,
                    tp.nom as type_nom, tp.taux, tp.assurance,
                    ef.nom as etablissement_nom
                FROM s4_final_pret p
                JOIN s4_final_client c ON p.id_client = c.id
                JOIN s4_final_type_pret tp ON p.id_type_pret = tp.id
                LEFT JOIN s4_final_ef_utilisateurs efu ON 1=1
                LEFT JOIN s4_final_etablissement_financier ef ON efu.id_ef = ef.id
                WHERE p.id = ?
                LIMIT 1";
        $stmt = $db->prepare($sql);
        $stmt->execute([$id_pret]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public static function getRemboursementsPret($id_pret) {
        $db = getDB();
        $sql = "SELECT annuite, interet, capital_rembourse, mois, annee 
                FROM s4_final_remboursement 
                WHERE id_pret = ? 
                ORDER BY annee, mois";
        $stmt = $db->prepare($sql);
        $stmt->execute([$id_pret]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

}
?>