<?php
require_once __DIR__ . '/../models/Client.php';
require_once __DIR__ . '/../helpers/Utils.php';


class ClientController {

    public static function getAll() {
        try {
            $clients = Client::getAll();
            Flight::json($clients);
        } catch (Exception $e) {
            error_log('Erreur getAll clients: ' . $e->getMessage());
            Flight::json(['error' => 'Erreur lors de la récupération des clients'], 500);
        }
    }

    public static function getById($id) {
        try {
            $client = Client::getById($id);
            Flight::json($client);
        } catch (Exception $e) {
            error_log('Erreur getById client: ' . $e->getMessage());
            Flight::json(['error' => 'Erreur lors de la récupération du client'], 500);
        }
    }

    public static function search() {
        try {
            $searchTerm = isset($_GET['q']) ? $_GET['q'] : '';
            
            $debug = [
                'message' => 'DEBUT SEARCH',
                'searchTerm' => $searchTerm,
                'GET' => $_GET,
                'REQUEST_METHOD' => $_SERVER['REQUEST_METHOD'],
                'REQUEST_URI' => $_SERVER['REQUEST_URI']
            ];
            
           if (!$searchTerm) {
                error_log('Terme de recherche vide');
                Flight::json(['error' => 'Terme de recherche requis', 'debug' => $debug], 400);
                return;
            }
            
            $clients = Client::search($searchTerm);
            Flight::json(['clients' => $clients, 'debug' => $debug]);
        } catch (Exception $e) {
            error_log('Erreur search clients: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            Flight::json(['error' => 'Erreur lors de la recherche', 'exception' => $e->getMessage()], 500);
        }
    }

    public static function create() {
        try {
            $data = Flight::request()->data;
            
            if (!$data || (!isset($data->nom))) {
                $data = (object) $_POST;
            }
            
            if (!isset($data->nom)) {
                Flight::json(['error' => 'Nom requis'], 400);
                return;
            }
            
            $id = Client::create($data);
            Flight::json(['message' => 'Client ajouté', 'id' => $id]);
        } catch (Exception $e) {
            error_log('Erreur create client: ' . $e->getMessage());
            Flight::json(['error' => 'Erreur lors de la création: ' . $e->getMessage()], 500);
        }
    }

    public static function update($id) {
        try {
            $input = file_get_contents('php://input');
            parse_str($input, $parsedData);
            $data = (object) $parsedData;
            
            if (!isset($data->nom)) {
                Flight::json(['error' => 'Nom requis'], 400);
                return;
            }
            
            Client::update($id, $data);
            Flight::json(['message' => 'Client modifié']);
        } catch (Exception $e) {
            error_log('Erreur update client: ' . $e->getMessage());
            Flight::json(['error' => 'Erreur lors de la modification: ' . $e->getMessage()], 500);
        }
    }

    public static function delete($id) {
        try {
            Client::delete($id);
            Flight::json(['message' => 'Client supprimé']);
        } catch (Exception $e) {
            error_log('Erreur delete client: ' . $e->getMessage());
            Flight::json(['error' => 'Erreur lors de la suppression: ' . $e->getMessage()], 500);
        }
    }
}
