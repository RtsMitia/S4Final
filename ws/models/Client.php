<?php
require_once __DIR__ . '/../db.php';

class Client {
    public static function getAll() {
        $db = getDB();
        $stmt = $db->query("SELECT * FROM s4_final_client");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function getById($id) {
        $db = getDB();
        $stmt = $db->prepare("SELECT * FROM s4_final_client WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public static function getAllClients() {
        $db = getDB();
        $stmt = $db->query("SELECT id, nom, prenom FROM s4_final_client");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function getCompteClient($id_client) {
        $db = getDB();
        $stmt = $db->prepare("SELECT id, solde FROM s4_final_compte WHERE id_client = ?");
        $stmt->execute([$id_client]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    public static function search($searchTerm) {
        $db = getDB(); 
        $sql = "SELECT * FROM s4_final_client 
                WHERE nom LIKE :search 
                OR prenom LIKE :search 
                OR mail LIKE :search";
        $stmt = $db->prepare($sql);
        $likeTerm = '%' . $searchTerm . '%';
        $stmt->bindParam(':search', $likeTerm, PDO::PARAM_STR);
        
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return $results;
    }

    public static function create($data) {
        $db = getDB();
        $stmt = $db->prepare("INSERT INTO s4_final_client (nom, prenom, mail, telephone) VALUES (?, ?, ?, ?)");
        $stmt->execute([$data->nom, $data->prenom, $data->mail, $data->telephone]);
        return $db->lastInsertId();
    }

    public static function update($id, $data) {
        $db = getDB();
        $stmt = $db->prepare("UPDATE s4_final_client SET nom = ?, prenom = ?, mail = ?, telephone = ? WHERE id = ?");
        $stmt->execute([$data->nom, $data->prenom, $data->mail, $data->telephone, $id]);
    }

    public static function delete($id) {
        $db = getDB();
        $stmt = $db->prepare("DELETE FROM s4_final_client WHERE id = ?");
        $stmt->execute([$id]);
    }

    public static function getPretsByClientId($id) {
        $db = getDB();
        $sql = "SELECT sp.id as pret_id, sp.montant, sp.date_pret, sp.duree,
                stp.nom as nom_type_pret, stp.taux, stp.assurance, 
                sc.nom as nom_client, sc.prenom as prenom_client, sc.mail as mail_client,
                COALESCE(s.libelle, 'En attente') as statut_libelle,
                ssp.date_statut
                FROM s4_final_pret sp 
                JOIN s4_final_type_pret stp ON sp.id_type_pret = stp.id
                JOIN s4_final_client sc ON sp.id_client = sc.id
                LEFT JOIN (
                    SELECT id_pret, id_statut, date_statut,
                           ROW_NUMBER() OVER (PARTITION BY id_pret ORDER BY date_statut DESC) as rn
                    FROM s4_final_statut_pret
                ) ssp ON sp.id = ssp.id_pret AND ssp.rn = 1
                LEFT JOIN s4_final_statut s ON ssp.id_statut = s.id
                WHERE sp.id_client = ?
                ORDER BY sp.date_pret DESC
        ";
        $stmt = $db->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function getStatutsPret($pretId) {
        $db = getDB();
        $sql = "SELECT ssp.*, s.libelle as statut_libelle 
                FROM s4_final_statut_pret ssp
                JOIN s4_final_statut s ON ssp.id_statut = s.id
                WHERE ssp.id_pret = ?
                ORDER BY ssp.date_statut DESC";
        $stmt = $db->prepare($sql);
        $stmt->execute([$pretId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>
