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
}
