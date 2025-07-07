<?php
require_once __DIR__ . '/../models/Client.php';
require_once __DIR__ . '/../helpers/Utils.php';

class ClientController {

    public static function getAll() {
        $types = Client::getAllClients();
        Flight::json($types);
        error_log(print_r($types, true));
    }
}