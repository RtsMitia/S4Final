<?php
require_once __DIR__ . '/../models/Remboursement.php';

class RemboursementController {

    public static function getInteret() {
        $moisDebut = Flight::request()->query->moisDebut ?? null;
        $anneeDebut = Flight::request()->query->anneeDebut ?? null;
        $moisFin = Flight::request()->query->moisFin ?? null;
        $anneeFin = Flight::request()->query->anneeFin ?? null;
        $interet = Remboursement::getInteret($moisDebut, $anneeDebut, $moisFin, $anneeFin);
        try {
        if ($moisDebut && $anneeDebut && $moisFin && $anneeFin) {
            // Call filtered method
            $interets = Remboursement::getInteret($moisDebut, $anneeDebut, $moisFin, $anneeFin);
        } else {
            // Call method to get all interests (you'll need to create this)
            $interets = Remboursement::getAllInteret();
        }
        
        Flight::json($interets);
    } catch (Exception $e) {
        Flight::json(['error' => 'Erreur lors de la récupération: ' . $e->getMessage()], 500);
    }
    }
    
}
