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
            return $idef;
            
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

    public static function getMontantRestantNonEmprunteParMois($idEf) {
        $db = getDB();

        $sql = "
            SELECT 
                YEAR(date_mouvement) AS annee,
                MONTH(date_mouvement) AS mois,
                SUM(CASE WHEN type = 'entree' THEN montant ELSE 0 END) AS total_entree,
                SUM(CASE WHEN type = 'sortie' THEN montant ELSE 0 END) AS total_sortie
            FROM s4_final_mouvement_fond
            WHERE id_ef = ?
            GROUP BY annee, mois
            ORDER BY annee, mois
        ";
        $stmt = $db->prepare($sql);
        $stmt->execute([$idEf]);
        $rows = $stmt->fetchAll();

        $resultats = [];
        $cumul = 0;

        foreach ($rows as $row) {
            $entree = floatval($row['total_entree']);
            $sortie = floatval($row['total_sortie']);
            $cumul = $entree - $sortie;
            error_log("cumul : " .$cumul);
            error_log("annee : " .$row['annee']);
            error_log("mois : " .$row['mois']);

            $resultats[] = [
                'mois' => $row['mois'],
                'annee' => $row['annee'],
                'reste_non_emprunte' => $cumul
            ];
        }

        return $resultats;
    }

    public static function getPretsGroupesParMois() {
        $db = getDB();

        $sql = "
            SELECT 
                YEAR(p.date_pret) AS annee,
                MONTH(p.date_pret) AS mois,
                COUNT(*) AS nombre_prets,
                SUM(p.montant) AS montant_total
            FROM s4_final_pret p
            JOIN statut ON statut.id_pret = p.id
            WHERE statut.id_statut = 2  
            GROUP BY YEAR(p.date_pret), MONTH(p.date_pret)
            ORDER BY annee, mois;
        ";

        $stmt = $db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }



    public static function getRemboursementsParMois($idEf = null) {
        $db = getDB();

        $sql = "
            SELECT 
                annee,
                mois,
                SUM(annuite + interet) AS total_rembourse
            FROM s4_final_remboursement
            GROUP BY annee, mois
            ORDER BY annee, mois
        ";

        $stmt = $db->prepare($sql);
        // if ($idEf) {
        //     $stmt->bindParam(':idEf', $idEf, PDO::PARAM_INT);
        // }
        $stmt->execute();
        
        $resultats = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $resultats[$row['annee']][$row['mois']] = (float)$row['total_rembourse'];
        }

        return $resultats;
    }
    
public static function getMontantTotalParMois($idEf) {
    $mouvements = self::getMontantRestantNonEmprunteParMois($idEf);
    error_log(print_r($mouvements, true));
    
    $remboursements = self::getRemboursementsParMois($idEf); // Ajout du filtre par idEf
    error_log(print_r($remboursements, true));
    // $prets = self::getPretsGroupesParMois(); 

    $montantsPretsParMois = [];
    // foreach ($prets as $pret) {
    //     $montantsPretsParMois[$pret['annee']][$pret['mois']] = $pret['montant_total'];
    // }

    $resultats = [];

    foreach ($mouvements as $item) {
        $annee = $item['annee'];
        $mois = $item['mois'];
        $reste = $item['reste_non_emprunte'];

        // Accès sécurisé aux tableaux multidimensionnels
        $remboursement = $remboursements[$annee][$mois] ?? 0;
        // $montantPret = $montantsPretsParMois[$annee][$mois] ?? 0;

        $resultats[] = [
            'annee' => $annee,
            'mois' => $mois,
            'remboursements' => $remboursement,
            'reste_non_emprunte' => $reste ,
            'montant_total' => $reste + $remboursement 
        ];
    }

    return $resultats;
}

public static function getMontantTotalEntreDeuxDates($idEf, $moisDebut, $anneeDebut, $moisFin, $anneeFin) {
    $totaux = self::getMontantTotalParMois($idEf);
    $result = [];

    foreach ($totaux as $item) {
        $annee = $item['annee'];
        $mois = $item['mois'];
        
        if (
            ($annee > $anneeDebut || ($annee == $anneeDebut && $mois >= $moisDebut)) &&
            ($annee < $anneeFin || ($annee == $anneeFin && $mois <= $moisFin))
        ) {
            $result[] = $item;
        }
    }

    return $result;
}

}
