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

    public static function getTauxAssurance($idPret) {
        $db = getDB();

        $sql = "
            SELECT tp.assurance
            FROM s4_final_pret p
            JOIN s4_final_type_pret tp ON p.id_type_pret = tp.id
            WHERE p.id = :idPret
            LIMIT 1
        ";

        $stmt = $db->prepare($sql);
        $stmt->bindParam(':idPret', $idPret, PDO::PARAM_INT);
        $stmt->execute();

        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result && isset($result['assurance'])) {
            return $result['assurance'];
        } else {
            return 0; 
        }
    }


    public static function createInsert($c, $i, $n, $idPret, $mois, $annee) {
        $db = getDB();
        
        try {
            $db->beginTransaction();
            
            // Calculate constant annuity (monthly payment)
            $annuiteConstante = Utils::anuiteConstante($c, $i, $n);
            
            $capitalRestant = $c; // Initial loan amount
            $currentMois = $mois;
            $currentAnnee = $annee;
            
            // Insert repayment schedule for each month
            $values = [];
            $params = [];
            $i = $i/12;
            $tauxAssurance = Remboursement::getTauxAssurance($idPret);
            $assurance = $capitalRestant * ($tauxAssurance/12/100);
            for ($periode = 1; $periode <= $n; $periode++) {
                // Calculate interest for this period
                $interetPeriode = $capitalRestant * ($i / 100);
                
                // Calculate capital repayment for this period
                $capitalRembourse = $annuiteConstante - $interetPeriode;
                
                // Add values to batch insert
                $values[] = "(?, ?, ?, ?, ?, ?, ?)";
                $params = array_merge($params, [
                    $idPret,
                    $annuiteConstante,
                    $interetPeriode,
                    $assurance,
                    $capitalRembourse,
                    $currentMois,
                    $currentAnnee
                ]);
                
                // Update remaining capital for next iteration
                $capitalRestant -= $capitalRembourse;
                
                // Move to next month
                $currentMois++;
                if ($currentMois > 12) {
                    $currentMois = 1;
                    $currentAnnee++;
                }
            }
            
            // Single batch insert
            $sql = "INSERT INTO s4_final_remboursement (id_pret, annuite, interet, assurance, capital_rembourse, mois, annee) VALUES " . implode(", ", $values);
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            
            $db->commit();
            return true;
            
        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }
    }

    public static function getAllInteret() {
        $db = getDB();
        
        try {
            // Get interest per month within the date range
            $sql = "SELECT r.mois, r.annee, SUM(r.interet) as interet_mensuel 
                FROM s4_final_remboursement r
                INNER JOIN s4_final_pret p ON r.id_pret = p.id
                INNER JOIN (
                    SELECT sp1.id_pret, sp1.id_statut
                    FROM s4_final_statut_pret sp1
                    INNER JOIN (
                        SELECT id_pret, MAX(date_statut) as latest_date
                        FROM s4_final_statut_pret
                        GROUP BY id_pret
                    ) sp2 ON sp1.id_pret = sp2.id_pret AND sp1.date_statut = sp2.latest_date
                ) latest_status ON p.id = latest_status.id_pret
                INNER JOIN s4_final_statut s ON latest_status.id_statut = s.id
                WHERE s.libelle = 'valide'
                GROUP BY r.annee, r.mois
                ORDER BY r.annee, r.mois";
            
            $stmt = $db->prepare($sql);
            $stmt->execute();
            
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Format results for easier consumption
            $interetParMois = [];
            foreach ($results as $row) {
                $interetParMois[] = [
                    'mois' => $row['mois'],
                    'annee' => $row['annee'],
                    'interet' => floatval($row['interet_mensuel']),
                    'periode' => $row['annee'] . '-' . str_pad($row['mois'], 2, '0', STR_PAD_LEFT)
                ];
            }
            
            return $interetParMois;
            
        } catch (Exception $e) {
            throw $e;
        }
    }
    public static function getInteret($moisDebut, $anneeDebut, $moisFin, $anneeFin) {
        $db = getDB();
        
        try {
            // Get interest per month within the date range
            $sql = "SELECT r.mois, r.annee, SUM(r.interet) as interet_mensuel 
                FROM s4_final_remboursement r
                INNER JOIN s4_final_pret p ON r.id_pret = p.id
                INNER JOIN (
                    SELECT sp1.id_pret, sp1.id_statut
                    FROM s4_final_statut_pret sp1
                    INNER JOIN (
                        SELECT id_pret, MAX(date_statut) as latest_date
                        FROM s4_final_statut_pret
                        GROUP BY id_pret
                    ) sp2 ON sp1.id_pret = sp2.id_pret AND sp1.date_statut = sp2.latest_date
                ) latest_status ON p.id = latest_status.id_pret
                INNER JOIN s4_final_statut s ON latest_status.id_statut = s.id
                WHERE s.libelle = 'valide'
                AND (r.annee > ? OR (r.annee = ? AND r.mois >= ?))
                AND (r.annee < ? OR (r.annee = ? AND r.mois <= ?))
                GROUP BY r.annee, r.mois
                ORDER BY r.annee, r.mois";
            
            $stmt = $db->prepare($sql);
            $stmt->execute([
                $anneeDebut, $anneeDebut, $moisDebut,  // Start date conditions
                $anneeFin, $anneeFin, $moisFin         // End date conditions
            ]);
            
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Format results for easier consumption
            $interetParMois = [];
            foreach ($results as $row) {
                $interetParMois[] = [
                    'mois' => $row['mois'],
                    'annee' => $row['annee'],
                    'interet' => floatval($row['interet_mensuel']),
                    'periode' => $row['annee'] . '-' . str_pad($row['mois'], 2, '0', STR_PAD_LEFT)
                ];
            }
            
            return $interetParMois;
            
        } catch (Exception $e) {
            throw $e;
        }
    }

    public static function calculateRepaymentSchedule($c, $i, $n, $mois, $annee, $tauxAssurance) {
        try {
            #error_log("calculateRepaymentSchedule called with: c=$c, i=$i, n=$n, mois=$mois, annee=$annee");
            // Calculate constant annuity (monthly payment)
            $annuiteConstante = Utils::anuiteConstante($c, $i, $n);
            #error_log("Annuite constante calculated: $annuiteConstante");
            
            $capitalRestant = $c; // Initial loan amount
            $currentMois = $mois;
            $currentAnnee = $annee;
            
            $schedule = [];
            $i = $i/12;
            $assurance = $capitalRestant * ($tauxAssurance/12/100);
            for ($periode = 1; $periode <= $n; $periode++) {
                // Calculate interest for this period
                $interetPeriode = $capitalRestant * ($i / 100);
                
                // Calculate capital repayment for this period
                $capitalRembourse = $annuiteConstante - $interetPeriode;
                
                // Add to schedule array
                $schedule[] = [
                    'periode' => $periode,
                    'annuite' => round($annuiteConstante, 2),
                    'interet' => round($interetPeriode, 2),
                    'assurance' => round($assurance, 2),
                    'capital_rembourse' => round($capitalRembourse, 2),
                    'capital_restant' => round($capitalRestant - $capitalRembourse, 2),
                    'mois' => $currentMois,
                    'annee' => $currentAnnee,
                    'date_periode' => $currentAnnee . '-' . str_pad($currentMois, 2, '0', STR_PAD_LEFT)
                ];
                
                #error_log("Periode $periode: interet=$interetPeriode, capital_rembourse=$capitalRembourse, capital_restant=" . ($capitalRestant - $capitalRembourse) . ", mois=$currentMois, annee=$currentAnnee");
                
                // Update remaining capital for next iteration
                $capitalRestant -= $capitalRembourse;
                
                // Move to next month
                $currentMois++;
                if ($currentMois > 12) {
                    $currentMois = 1;
                    $currentAnnee++;
                }
            }
            
            // Calculate totals
            $totalAnnuite = array_sum(array_column($schedule, 'annuite'));
            $totalInteret = array_sum(array_column($schedule, 'interet'));
            $totalCapital = array_sum(array_column($schedule, 'capital_rembourse'));
            
            #error_log("Totals: total_annuite=$totalAnnuite, total_interet=$totalInteret, total_capital=$totalCapital");
            
            return [
                'success' => true,
                'schedule' => $schedule,
                'summary' => [
                    'loan_amount' => $c,
                    'interest_rate' => $i,
                    'assurance' => $tauxAssurance,
                    'montant_assurance' => round($assurance, 2),
                    'a_payer_par_mois' => round($assurance, 2) + round($annuiteConstante, 2),
                    'duration_months' => $n,
                    'monthly_payment' => round($annuiteConstante, 2),
                    'total_payments' => round($totalAnnuite, 2),
                    'total_interest' => round($totalInteret, 2),
                    'total_capital' => round($totalCapital, 2),
                    'start_month' => $mois,
                    'start_year' => $annee
                ]
            ];
            
        } catch (Exception $e) {
            error_log("Error in calculateRepaymentSchedule: " . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    // maka anle info anle pret
    public static function getPretsAvecRemboursements() {
        $db = getDB();
        $sql = "SELECT DISTINCT p.id, p.montant, p.date_pret, p.duree,
                c.nom as client_nom, c.prenom as client_prenom, c.mail as client_mail,
                tp.nom as type_nom, tp.taux, tp.assurance
                FROM s4_final_pret p
                JOIN s4_final_client c ON p.id_client = c.id
                JOIN s4_final_type_pret tp ON p.id_type_pret = tp.id
                WHERE EXISTS (
                    SELECT 1 FROM s4_final_remboursement r WHERE r.id_pret = p.id
                )
                ORDER BY p.date_pret DESC";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function getRemboursementsPret($pretId) {
        $db = getDB();
        $sql = "SELECT r.*, p.montant as montant_pret, tp.assurance, r.assurance as assurance
                FROM s4_final_remboursement r
                JOIN s4_final_pret p ON r.id_pret = p.id
                JOIN s4_final_type_pret tp ON p.id_type_pret = tp.id
                WHERE r.id_pret = ?
                ORDER BY r.annee, r.mois";
        $stmt = $db->prepare($sql);
        $stmt->execute([$pretId]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $results;
    }
}
