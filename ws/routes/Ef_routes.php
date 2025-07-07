<?php
require_once __DIR__ . '/../controllers/EfController.php';

Flight::route('GET /ef', ['EfController', 'getAll']);
/*Flight::route('GET /etudiants/@id', ['EtudiantController', 'getById']);
Flight::route('POST /etudiants', ['EtudiantController', 'create']);
Flight::route('PUT /etudiants/@id', ['EtudiantController', 'update']);
Flight::route('DELETE /etudiants/@id', ['EtudiantController', 'delete']);*/