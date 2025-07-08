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

    public static function getMontantTotalParMois($idEf) {
        try {
            $data = Ef::getMontantTotalParMois($idEf);
            if (empty($data)) {
                Flight::json(['error' => "Aucun montant trouvé pour l'établissement financier id=$idEf"], 404);
                return;
            }
            Flight::json($data);
        } catch (Exception $e) {
            error_log("Erreur EfController::getMontantTotalParMois - " . $e->getMessage());
            Flight::json(['error' => 'Erreur lors de la récupération des montants totaux'], 500);
        }
    }

public static function getMontantTotalEntreDeuxDates($idEf) {
    $moisdebut = Flight::request()->query->moisdebut;
    $anneedebut = Flight::request()->query->anneedebut;
    $moisfin = Flight::request()->query->moisfin;
    $anneefin = Flight::request()->query->anneefin;

    if (!$moisdebut || !$anneedebut || !$moisfin || !$anneefin) {
        Flight::json(["error" => "Période invalide"], 400);
        return;
    }

    $resultatsParMois = Ef::getMontantTotalParMois($idEf);
    error_log("Données complètes: " . print_r($resultatsParMois, true));

    $resultatsFiltres = [];
    foreach ($resultatsParMois as $item) {
        $annee = (int)$item['annee'];
        $mois = (int)$item['mois'];
        $anneeDebut = (int)$anneedebut;
        $moisDebut = (int)$moisdebut;
        $anneeFin = (int)$anneefin;
        $moisFin = (int)$moisfin;

        if (
            ($annee > $anneeDebut || ($annee == $anneeDebut && $mois >= $moisDebut)) &&
            ($annee < $anneeFin || ($annee == $anneeFin && $mois <= $moisFin))
        ) {
            $item['reste_non_emprunte'] = $item['montant_total'] - ($item['remboursements'] ?? 0);
            $item['remboursements'] = $item['remboursements'] ?? 0;

            $resultatsFiltres[] = $item;
        }
    }

    Flight::json($resultatsFiltres);
}


}