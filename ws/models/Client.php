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
        
        // Debug logs
        error_log('SQL: ' . $sql);
        error_log('Search term: ' . $searchTerm);
        error_log('Like term: ' . $likeTerm);
        
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        error_log('Results count: ' . count($results));
        error_log('Results: ' . json_encode($results));
        
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
}
?>
