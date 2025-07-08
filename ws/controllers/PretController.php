<?php
require_once __DIR__ . '/../models/Pret.php';
require_once __DIR__ . '/../models/Client.php';
require_once __DIR__ . '/../models/TypePret.php';



class PretController {
    public static function insertionPret($id){
        $data = Flight::request()->data;
        $solde = Pret::getSoldeEf($data->id_ef, $data->date_pret);
        $montantPret = $data->montant;
        error_log($solde);
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
}
