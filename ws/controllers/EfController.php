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
    
    public static function showAddFondDepartPage() {
        Flight::view()->path = __DIR__ . '/../..';
        
        Flight::render('add_fond_depart', [
            'title' => 'Ajouter Fond de Départ',
            'message' => 'Ajoutez un nouvel établissement financier'
        ]);
    }
    
    public static function createAndShowSuccess() {
        $data = Flight::request()->data;
        
        try {
            $efId = Ef::create($data);
            
            // Set the view path to root folder (same level as index.html)
            Flight::view()->path = __DIR__ . '/../..';
            
            // Render success page with data
            Flight::render('success', [
                'title' => 'Succès',
                'message' => 'Établissement financier ajouté avec succès!',
                'ef_id' => $efId,
                'fond_depart' => $data->fondDepart,
                'redirect_url' => '/ProjetFinalS4/index.html'
            ]);
            
        } catch (Exception $e) {
            // Render error page
            Flight::view()->path = __DIR__ . '/../..';
            Flight::render('error', [
                'title' => 'Erreur',
                'message' => 'Erreur lors de la création: ' . $e->getMessage(),
                'back_url' => '/ProjetFinalS4/index.html'
            ]);
        }
    }

}