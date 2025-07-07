<?php
require_once __DIR__ . '/../controllers/ClientController.php';

Flight::route('GET /clients', ['ClientController', 'getAll']);

Flight::route('GET /clients/@id', ['ClientController', 'getById']);
Flight::route('GET /clients/search', ['ClientController', 'search']);
Flight::route('POST /clients', ['ClientController', 'create']);
Flight::route('PUT /clients/@id', ['ClientController', 'update']);
Flight::route('DELETE /clients/@id', ['ClientController', 'delete']);
?>
