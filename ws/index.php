<?php
require 'vendor/autoload.php';
require 'db.php';
require 'routes/type_pret_routes.php';
require 'routes/Ef_routes.php';
require 'routes/gestionPretRoute.php';
require 'routes/client_routes.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

Flight::start();
