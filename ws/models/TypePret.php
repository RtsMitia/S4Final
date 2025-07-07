<?php
require_once __DIR__ . '/../db.php';

class TypePret {

    public static function getTypePret($id) {
        $db = getDB();
        $stmt = $db->prepare("SELECT * FROM s4_final_type_pret WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public static function getAllTypesPret() {
        $db = getDB();
        $stmt = $db->query("SELECT id, nom, taux FROM s4_final_type_pret");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>