<?php
require 'vendor/autoload.php';
require 'db.php';

// Headers CORS pour permettre les requêtes depuis le navigateur
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Gérer les requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Inclure automatiquement tous les fichiers de routes
foreach (glob('routes/*.php') as $routeFile) {
    require $routeFile;
}

Flight::start();