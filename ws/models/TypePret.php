<?php
require_once __DIR__ . '/../db.php';

class TypePret {

    public static function getAll() {
        $db = getDB();
        $stmt = $db->query("SELECT * FROM s4_final_type_pret");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function getById($id) {
        $db = getDB();
        $stmt = $db->prepare("SELECT * FROM s4_final_type_pret WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public static function create($data) {
        $db = getDB();
        $stmt = $db->prepare("INSERT INTO s4_final_type_pret (nom, taux) VALUES (?, ?)"); // taux annuel
        $stmt->execute([$data->nom, $data->taux]);
        return $db->lastInsertId();
    }

    public static function update($id, $data) {
        $db = getDB();
        $stmt = $db->prepare("UPDATE s4_final_type_pret SET nom = ?, taux = ? WHERE id = ?");
        $stmt->execute([$data->nom, $data->taux, $id]);
    }

    public static function delete($id) {
        $db = getDB();
        $stmt = $db->prepare("DELETE FROM s4_final_type_pret WHERE id = ?");
        $stmt->execute([$id]);
    }

}