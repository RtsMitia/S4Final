<?php
require_once __DIR__ . '/../db.php';

class Client {
    public static function getClient($id) {
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
}
?>