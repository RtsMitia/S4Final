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
            
            for ($periode = 1; $periode <= $n; $periode++) {
                // Calculate interest for this period
                $interetPeriode = $capitalRestant * ($i / 100);
                
                // Calculate capital repayment for this period
                $capitalRembourse = $annuiteConstante - $interetPeriode;
                
                // Add values to batch insert
                $values[] = "(?, ?, ?, ?, ?, ?)";
                $params = array_merge($params, [
                    $idPret,
                    $annuiteConstante,
                    $interetPeriode,
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
            $sql = "INSERT INTO s4_final_remboursement (id_pret, annuite, interet, capital_rembourse, mois, annee) VALUES " . implode(", ", $values);
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
            $sql = "SELECT mois, annee, SUM(interet) as interet_mensuel 
                    FROM s4_final_remboursement 
                    GROUP BY annee, mois
                    ORDER BY annee, mois";
            
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
            $sql = "SELECT mois, annee, SUM(interet) as interet_mensuel 
                    FROM s4_final_remboursement 
                    WHERE (annee > ? OR (annee = ? AND mois >= ?))
                    AND (annee < ? OR (annee = ? AND mois <= ?))
                    GROUP BY annee, mois
                    ORDER BY annee, mois";
            
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
}
