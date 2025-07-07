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
    

}