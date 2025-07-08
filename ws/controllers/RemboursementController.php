<?php
require_once __DIR__ . '/../models/Remboursement.php';
require_once __DIR__ . '/../models/Pret.php';

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

    public static function calculateSchedule() {
            try {
                // Get parameters from request
                $montant = Flight::request()->query->montant ?? Flight::request()->data->montant ?? null;
                $taux = Flight::request()->query->taux ?? Flight::request()->data->taux ?? null;
                $assurance = Flight::request()->query->assurance ?? Flight::request()->data->assurance ?? null;
                $duree = Flight::request()->query->duree ?? Flight::request()->data->duree ?? null;
                $mois = Flight::request()->query->mois ?? Flight::request()->data->mois ?? date('n');
                $annee = Flight::request()->query->annee ?? Flight::request()->data->annee ?? date('Y');
                
                // Validate required parameters
                if (!$montant || !$taux || !$duree) {
                    Flight::json([
                        'success' => false,
                        'error' => 'Paramètres manquants. Requis: montant, taux, duree',
                        'required_params' => [
                            'montant' => 'Montant du prêt',
                            'taux' => 'Taux d\'intérêt annuel (%)',
                            'duree' => 'Durée en mois'
                        ],
                        'optional_params' => [
                            'mois' => 'Mois de début (1-12, défaut: mois actuel)',
                            'annee' => 'Année de début (défaut: année actuelle)'
                        ]
                    ], 400);
                    return;
                }
                
                // Convert and validate parameters
                $montant = floatval($montant);
                $taux = floatval($taux);
                $assurance = floatval($assurance);
                $duree = intval($duree);
                $mois = intval($mois);
                $annee = intval($annee);
                
                // Validate parameter ranges
                if ($montant <= 0) {
                    Flight::json(['success' => false, 'error' => 'Le montant doit être supérieur à 0'], 400);
                    return;
                }
                
                if ($taux <= 0 || $taux > 100) {
                    Flight::json(['success' => false, 'error' => 'Le taux doit être entre 0 et 100'], 400);
                    return;
                }
                if ($assurance <= 0 || $assurance > 100) {
                    Flight::json(['success' => false, 'error' => 'L assurance doit être entre 0 et 100'], 400);
                    return;
                }
                
                if ($duree <= 0 || $duree > 600) { // Max 50 years
                    Flight::json(['success' => false, 'error' => 'La durée doit être entre 1 et 600 mois'], 400);
                    return;
                }
                
                if ($mois < 1 || $mois > 12) {
                    Flight::json(['success' => false, 'error' => 'Le mois doit être entre 1 et 12'], 400);
                    return;
                }
                
                if ($annee < 2020 || $annee > 2050) {
                    Flight::json(['success' => false, 'error' => 'L\'année doit être entre 2020 et 2050'], 400);
                    return;
                }
                
                // Calculate repayment schedule
                $schedule = Remboursement::calculateRepaymentSchedule($montant, $taux, $duree, $mois, $annee, $assurance);
                
                Flight::json($schedule);
                
            } catch (Exception $e) {
                Flight::json([
                    'success' => false,
                    'error' => 'Erreur lors du calcul: ' . $e->getMessage()
                ], 500);
            }
        }

    public static function createRepaymentSchedule() {
            try {
                // Get parameters from request
                $montant = Flight::request()->query->montant ?? Flight::request()->data->montant ?? null;
                $taux = Flight::request()->query->taux ?? Flight::request()->data->taux ?? null;
                $duree = Flight::request()->query->duree ?? Flight::request()->data->duree ?? null;
                $idPret = Flight::request()->query->id_pret ?? Flight::request()->data->id_pret ?? null;
                $mois = Flight::request()->query->mois ?? Flight::request()->data->mois ?? date('n');
                $annee = Flight::request()->query->annee ?? Flight::request()->data->annee ?? date('Y');
                // Validate required parameters
                if (!$montant || !$taux || !$duree || !$idPret) {
                    Flight::json([
                        'success' => false,
                        'error' => 'Paramètres manquants. Requis: montant, taux, duree, id_pret',
                        'required_params' => [
                            'montant' => 'Montant du prêt (c)',
                            'taux' => 'Taux d\'intérêt annuel (i)',
                            'duree' => 'Durée en mois (n)',
                            'id_pret' => 'ID du prêt'
                        ],
                        'optional_params' => [
                            'mois' => 'Mois de début (1-12, défaut: mois actuel)',
                            'annee' => 'Année de début (défaut: année actuelle)'
                        ],
                        'example_url' => '/remboursement/create?montant=50000&taux=12&duree=24&id_pret=1&mois=1&annee=2024'
                    ], 400);
                    return;
                }
                
                // Convert and validate parameters
                $montant = floatval($montant);
                $taux = floatval($taux);
                $duree = intval($duree);
                $idPret = intval($idPret);
                $mois = intval($mois);
                $annee = intval($annee);
                
                // Validate parameter ranges
                if ($montant <= 0) {
                    Flight::json(['success' => false, 'error' => 'Le montant doit être supérieur à 0'], 400);
                    return;
                }
                
                if ($taux <= 0 || $taux > 100) {
                    Flight::json(['success' => false, 'error' => 'Le taux doit être entre 0 et 100'], 400);
                    return;
                }
                
                if ($duree <= 0 || $duree > 600) {
                    Flight::json(['success' => false, 'error' => 'La durée doit être entre 1 et 600 mois'], 400);
                    return;
                }
                
                if ($idPret <= 0) {
                    Flight::json(['success' => false, 'error' => 'L\'ID du prêt doit être valide'], 400);
                    return;
                }
                
                if ($mois < 1 || $mois > 12) {
                    Flight::json(['success' => false, 'error' => 'Le mois doit être entre 1 et 12'], 400);
                    return;
                }
                
                if ($annee < 2020 || $annee > 2050) {
                    Flight::json(['success' => false, 'error' => 'L\'année doit être entre 2020 et 2050'], 400);
                    return;
                }
                
                // Call createInsert to insert repayment schedule
                $result = Remboursement::createInsert($montant, $taux, $duree, $idPret, $mois, $annee);
                Pret::insertStatutPret($idPret, Flight::request()->data->date, 2);
             
                
                if ($result === true) {
                    Flight::json([
                        'success' => true,
                        'message' => 'Échéancier de remboursement créé avec succès',
                        'data' => [
                            'id_pret' => $idPret,
                            'montant' => $montant,
                            'taux' => $taux,
                            'duree' => $duree,
                            'mois_debut' => $mois,
                            'annee_debut' => $annee,
                            'periodes_creees' => $duree
                        ]
                    ], 201);
                } else {
                    Flight::json([
                        'success' => false,
                        'error' => 'Erreur lors de la création de l\'échéancier'
                    ], 500);
                }
                
            } catch (Exception $e) {
                Flight::json([
                    'success' => false,
                    'error' => 'Erreur lors de la création: ' . $e->getMessage(),
                    'details' => [
                        'file' => $e->getFile(),
                        'line' => $e->getLine()
                    ]
                ], 500);
            }
        }

    public static function getPretsAvecRemboursements() {
        try {
            $prets = Remboursement::getPretsAvecRemboursements();
            Flight::json($prets);
        } catch (Exception $e) {
            error_log('Erreur getPretsAvecRemboursements: ' . $e->getMessage());
            Flight::json(['error' => 'Erreur lors de la récupération des prêts'], 500);
        }
    }

    public static function getRemboursementsPret($pretId) {
        try {
            $remboursements = Remboursement::getRemboursementsPret($pretId);
            Flight::json($remboursements);
        } catch (Exception $e) {
            error_log('Erreur getRemboursementsPret: ' . $e->getMessage());
            Flight::json(['error' => 'Erreur lors de la récupération des remboursements'], 500);
        }
    }
}
