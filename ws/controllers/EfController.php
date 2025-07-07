<?php
require_once __DIR__ . '/../models/Ef.php';

class EfController {
    
    public static function create() {
        $data = Flight::request()->data;
        
        try {
            $efId = Ef::create($data);
            
            Flight::json([
                'message' => 'Etablissement financier ajouté avec fond de départ', 
                'id' => $efId,
                'fond_depart' => $data->fondDepart
            ]);
            
        } catch (Exception $e) {
            Flight::json(['error' => 'Erreur lors de la création: ' . $e->getMessage()], 500);
        }
    }
    public static function getAll() {
        try {
            $efs = Ef::getAll();
            Flight::json($efs);
        } catch(Exception $e) {
            Flight::json(['error' => 'Erreur lors du getAll: ' . $e->getMessage()], 500);
        }
    }
    
    public static function updateFondDepart ($id) {
        $data = Flight::request()->data;

        if (!isset($data->fondDepart)) {
            Flight::json(['error' => 'fondDepart manquant'], 400);
            return;
        }

        try {
            $updated = Ef::updateFondDepart($id, $data->fondDepart);
            if ($updated) {
                Flight::json(['message' => 'Fond de départ mis à jour', 'id' => $id, 'fond_depart' => $data->fondDepart]);
            } else {
                Flight::json(['error' => 'Aucun établissement trouvé ou aucune modification effectuée'], 404);
            }
        } catch (Exception $e) {
            // Check if it's a business logic error (fund already exists)
            if (strpos($e->getMessage(), "déjà un fond de départ") !== false) {
                Flight::json(['error' => $e->getMessage()], 400);
            } else {
                Flight::json(['error' => 'Erreur lors de la mise à jour: ' . $e->getMessage()], 500);
            }
        }
    }
}