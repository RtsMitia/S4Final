<?php
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../helpers/Utils.php';

class Remboursement {

    public static function create($data) {
        $db = getDB();
        $stmt = $db->prepare("INSERT INTO s4_final_mouvement_fond (id_ef, montant, type, date_mouvement) VALUES (?, ?, ?, ?)");
        $stmt->execute([$data->id_ef, $data->montant, $data->type, $data->date_mouvement]);
        return $db->lastInsertId();
    }

    public static function createInsert($c, $i, $n) {
        $annuiteConstante = Utils::anuiteConstante($c,$i,$n);
        
    }
}
