<?php
require_once __DIR__ . '/../models/TypePret.php';

class TypePretController {

    public static function getAll() {
        try {
            $types = TypePret::getAll();
            Flight::json($types);
        } catch (Exception $e) {
            error_log('Erreur getAll: ' . $e->getMessage());
            Flight::json(['error' => 'Erreur lors de la récupération des types'], 500);
        }
    }

    public static function getById($id) {
        $type = TypePret::getById($id);
        Flight::json($type);
    }

    public static function create() {
        try {
            $data = Flight::request()->data;
            if (!$data || (!isset($data->nom) && !isset($data->taux))) {
                $data = (object) $_POST;
            }
            
            if (!isset($data->nom) || !isset($data->taux)) {
                Flight::json(['error' => 'Nom et taux sont requis'], 400);
                return;
            }
            
            $id = TypePret::create($data);
            Flight::json(['message' => 'Type de prêt ajouté', 'id' => $id]);
        } catch (Exception $e) {
            error_log('Erreur create: ' . $e->getMessage());
            Flight::json(['error' => 'Erreur lors de la création: ' . $e->getMessage()], 500);
        }
    }

    public static function update($id) {
        try {
            $input = file_get_contents('php://input');
            parse_str($input, $parsedData);
            $data = (object) $parsedData;
            
            if (!isset($data->nom) || !isset($data->taux)) {
                Flight::json(['error' => 'Nom et taux sont requis'], 400);
                return;
            }
            
            TypePret::update($id, $data);
            Flight::json(['message' => 'Type de prêt modifié']);
        } catch (Exception $e) {
            error_log('Erreur update: ' . $e->getMessage());
            Flight::json(['error' => 'Erreur lors de la modification: ' . $e->getMessage()], 500);
        }
    }

    public static function delete($id) {
        TypePret::delete($id);
        Flight::json(['message' => 'Type de prêt supprimé']);
    }

}