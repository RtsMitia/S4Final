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

    public static function updateFondDepart($idEf, $nouveauFondDepart) {
        $db = getDB();
        try {
            $db->beginTransaction();
            
            // First check if the current fond_depart is 0
            $stmt = $db->prepare("SELECT fond_depart FROM s4_final_etablissement_financier WHERE id = ?");
            $stmt->execute([$idEf]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$result) {
                throw new Exception("Établissement non trouvé.");
            }
            
            if ($result['fond_depart'] != 0) {
                throw new Exception("L'établissement a déjà un fond de départ. Seuls les établissements avec un fond de 0 peuvent être mis à jour.");
            }
            
            // Update the fond_depart
            $stmt = $db->prepare("UPDATE s4_final_etablissement_financier SET fond_depart = ? WHERE id = ?");
            $updateResult = $stmt->execute([$nouveauFondDepart, $idEf]);
            
            // Check if any rows were affected
            if ($stmt->rowCount() === 0) {
                throw new Exception("Aucune modification effectuée.");
            }
            
            // Insert into movement table
            try {
                $stmt = $db->prepare("INSERT INTO s4_final_mouvement_fond (id_ef, montant, type, date_mouvement) VALUES (?, ?, ?, ?)");
                $stmt->execute([
                    $idEf,
                    $nouveauFondDepart,
                    'entree',
                    date('Y-m-d H:i:s')
                ]);
            } catch (Exception $e) {
                // If movement table doesn't exist or has issues, just continue
                error_log("Warning: Could not insert into movement table: " . $e->getMessage());
            }
            
            $db->commit();
            return true;
        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }
    }
}
