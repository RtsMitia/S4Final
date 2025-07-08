<?php
require_once __DIR__ . '/../models/Pret.php';
require_once __DIR__ . '/../models/Client.php';
require_once __DIR__ . '/../models/TypePret.php';



class PretController {
    public static function insertionPret($id){
        $data = Flight::request()->data;
        $solde = Pret::getSoldeEf($data->id_ef, $data->date_pret);
        $montantPret = $data->montant;
        #error_log($solde);
        if($solde>$montantPret){
            $id = Pret::insertPret($data);
            //Pret::insertMouvementFond($data->montant, $data->id_ef, $data->date_pret);
            Pret::insertStatutPret($id, $data->date_pret, 1);
            Flight::json(['message' => 'Pret insere, en attente de validation', 'id' => $id]);
        }
        else{
            Flight::json(['error' => 'Solde insufisant']);
        }
    }

    public static function exportPretPDF($id_pret) {
        try {
            require_once __DIR__ . '/../../lib/fpdf.php';
            
            $pret = Pret::getPretDetails($id_pret);
            if (!$pret) {
                Flight::json(['error' => 'Prêt non trouvé'], 404);
                return;
            }
            
            $remboursements = Pret::getRemboursementsPret($id_pret);
            $pdf = new FPDF();
            $pdf->AddPage();
            $pdf->SetFont('Arial', 'B', 16);
            
            $etablissement = $pret['etablissement_nom'] ?: 'Établissement Financier';
            $pdf->Cell(0, 10, utf8_decode($etablissement), 0, 1, 'C');
            $pdf->Ln(5);
            
            $pdf->SetFont('Arial', 'B', 18);
            $pdf->Cell(0, 10, utf8_decode('CONTRAT DE PRÊT'), 0, 1, 'C');
            $pdf->Ln(5);
            
            $pdf->SetFont('Arial', '', 10);
            $pdf->Cell(0, 10, utf8_decode('Document généré le : ' . date('d/m/Y à H:i')), 0, 1, 'R');
            $pdf->Ln(10);
            
            $pdf->SetFont('Arial', 'B', 14);
            $pdf->Cell(0, 10, utf8_decode('INFORMATIONS CLIENT'), 0, 1, 'L');
            $pdf->SetFont('Arial', '', 12);
            $pdf->Cell(0, 6, utf8_decode('Nom : ' . $pret['client_nom']), 0, 1, 'L');
            $pdf->Cell(0, 6, utf8_decode('Prénom : ' . $pret['client_prenom']), 0, 1, 'L');
            $pdf->Cell(0, 6, utf8_decode('Email : ' . $pret['client_mail']), 0, 1, 'L');
            $pdf->Ln(4);
            
            $pdf->SetFont('Arial', 'B', 14);
            $pdf->Cell(0, 10, utf8_decode('DÉTAILS DU PRÊT'), 0, 1, 'L');
            $pdf->SetFont('Arial', '', 12);
            $pdf->Cell(0, 6, utf8_decode('Capital prêté : ' . number_format($pret['montant'], 2, ',', ' ') . ' €'), 0, 1, 'L');
            $pdf->Cell(0, 6, utf8_decode('Durée : ' . $pret['duree'] . ' mois'), 0, 1, 'L');
            $pdf->Cell(0, 6, utf8_decode('Date du prêt : ' . date('d/m/Y', strtotime($pret['date_pret']))), 0, 1, 'L');
            $pdf->Cell(0, 6, utf8_decode('Type de prêt : ' . $pret['type_nom']), 0, 1, 'L');
            $pdf->Cell(0, 6, utf8_decode('Taux d\'intérêt : ' . $pret['taux'] . '%'), 0, 1, 'L');
            $pdf->Ln(4);
            
            // $pdf->SetX(20);
            if (!empty($remboursements)) {
                $pdf->SetFont('Arial', 'B', 14);
                $pdf->Cell(0, 10, utf8_decode('ÉCHÉANCIER DE REMBOURSEMENT'), 0, 1, 'L');
                $pdf->Ln(5);
                
                $pdf->SetFont('Arial', 'B', 10);
                $pdf->Cell(25, 6, utf8_decode('Mois'), 1, 0, 'C');
                $pdf->Cell(35, 6, utf8_decode('Annuité'), 1, 0, 'C');
                $pdf->Cell(35, 6, utf8_decode('Intérêts'), 1, 0, 'C');
                $pdf->Cell(35, 6, utf8_decode('Capital'), 1, 0, 'C');
                $pdf->Cell(35, 6, utf8_decode('Assurance'), 1, 0, 'C');
                $pdf->Cell(35, 6, utf8_decode('Total'), 1, 1, 'C');
                
                $assurance_mensuelle = ($pret['montant'] * $pret['assurance'] / 100) / 12;
                
                $pdf->SetFont('Arial', '', 9);
                foreach ($remboursements as $remb) {
                    $total_mensuel = $remb['annuite'] + $assurance_mensuelle;
                    
                    $pdf->Cell(25, 6, $remb['mois'] . '/' . $remb['annee'], 1, 0, 'C');
                    $pdf->Cell(35, 6, number_format($remb['annuite'], 2, ',', ' '), 1, 0, 'R');
                    $pdf->Cell(35, 6, number_format($remb['interet'], 2, ',', ' '), 1, 0, 'R');
                    $pdf->Cell(35, 6, number_format($remb['capital_rembourse'], 2, ',', ' '), 1, 0, 'R');
                    $pdf->Cell(35, 6, number_format($assurance_mensuelle, 2, ',', ' '), 1, 0, 'R');
                    $pdf->Cell(35, 6, number_format($total_mensuel, 2, ',', ' '), 1, 1, 'R');
                }
                $pdf->Ln(5);
            }
            
            $pdf->SetFont('Arial', 'B', 12);
            $pdf->Cell(0, 10, utf8_decode('ENGAGEMENT'), 0, 1, 'L');
            $pdf->SetFont('Arial', '', 11);
            $pdf->MultiCell(0, 4, utf8_decode('Le client s\'engage à rembourser selon les échéances prévues dans ce contrat. Tout retard de paiement pourra entraîner des pénalités selon les conditions générales.'), 0, 'J');
            $pdf->Ln(15);
            
            $pdf->SetFont('Arial', 'B', 12);
            $pdf->Cell(0, 10, utf8_decode('Signature du client :'), 0, 1, 'L');
            $pdf->Ln(2);
            $pdf->SetFont('Arial', 'I', 12);
            $pdf->Cell(0, 10, utf8_decode($pret['client_nom'] . ' ' . $pret['client_prenom']), 0, 1, 'L');
            
            $filename = 'Contrat_Pret_n' . $id_pret . '_' . date('Ymd') . '.pdf';
            
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="' . $filename . '"');
            header('Cache-Control: private, max-age=0, must-revalidate');
            
            $pdf->Output('D', $filename);
            
        } catch (Exception $e) {
            error_log('Erreur export PDF: ' . $e->getMessage());
            Flight::json(['error' => 'Erreur lors de la génération du PDF: ' . $e->getMessage()], 500);
        }
    }

    public static function getStatutsPret($pretId) {
        try {
            $statuts = Client::getStatutsPret($pretId);
            Flight::json($statuts);
        } catch (Exception $e) {
            error_log('Erreur getStatutsPret: ' . $e->getMessage());
            Flight::json(['error' => 'Erreur lors de la récupération des statuts du prêt'], 500);
        }
    }
}
