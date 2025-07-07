<?php
require_once __DIR__ . '/../db.php';

class MouvementFond {

    public static function create($data) {
        $db = getDB();
        $stmt = $db->prepare("INSERT INTO s4_final_mouvement_fond (id_ef, montant, type, date_mouvement) VALUES (?, ?, ?, ?)");
        $stmt->execute([$data->id_ef, $data->montant, $data->type, $data->date_mouvement]);
        return $db->lastInsertId();
    }

}
