<?php
require_once __DIR__ . '/../db.php';

class Pret {
    public static function insertPret($montant, $date_pret, $id_client, $id_type_pret) {
        $db = getDB();
        $stmt = $db->prepare("INSERT INTO s4_final_pret (montant, date_pret, id_client, id_type_pret) VALUES (?, ?, ?, ?)");
        $stmt->execute([$montant, $date_pret, $id_client, $id_type_pret]);
        return $db->lastInsertId();
    }

    public static function insertMouvementFond($montant, $id_ef, $date) {
        $db = getDB();
        $stmt = $db->prepare("INSERT INTO s4_final_mouvement_fond (montant, type, date_mouvement, id_ef) VALUES (?, 'sortie', ?, ?)");
        return $stmt->execute([$montant, $date, $id_ef]);
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

    public function insertStatutPret($id_pret, $date, $idStatut) {
        $db = getDB();
        $stmt = $db->prepare("INSERT INTO s4_final_statut_pret (id_pret, id_statut, date_statut) VALUES (?, ?, ?)");
        return $stmt->execute([$id_pret, $idStatut, $date]);
    }

    public function getSoldeEf($id_ef){
        $db = getDB();
        $sql= "SELECT SUM(CASE WHEN f.type = 'entree' THEN t.quantite * t.prix_unitaire ELSE 0 END) AS total_entree,
                        SUM(CASE WHEN f.type = 'sortie' THEN t.quantite * t.prix_unitaire ELSE 0 END) AS total_sortie
                        FROM s4_final_mouvement_fond f WHERE id_ef=?";
        $stmt = $db->prepare($sql);
        $stmt->execute([$id_ef]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC); 
        $solde = $result['total_entree'] - $result['total_sortie'];
        return $solde;
    }
}
?>