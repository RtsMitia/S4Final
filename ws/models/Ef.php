<?php
require_once __DIR__ . '/../db.php';

class Ef {

    public static function create($data) {
        $db = getDB();
        try {
            $db->beginTransaction();
            
            $stmt = $db->prepare("INSERT INTO s4_final_etablissement_financier (nom, fond_depart) VALUES (?, ?)");
            $stmt->execute([$data->nom, $data->fondDepart]);
            $idef = $db->lastInsertId();
            
            $stmt = $db->prepare("INSERT INTO s4_final_mouvement_fond (id_ef, montant, type, date_mouvement) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $idef,
                $data->fondDepart,
                'entree',
                date('Y-m-d H:i:s')
            ]);
            $db->commit();
            return $efId;
            
        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }
    }

    public static function getAll() {
        $db = getDB();
        try{
            $stmt = $db->prepare("SELECT * FROM s4_final_etablissement_financier");
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            throw $e;
        }
    }

}
