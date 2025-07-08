<?php
require_once __DIR__ . '/../controllers/EfController.php';

Flight::route('GET /ef', ['EfController', 'getAll']);
Flight::route('PUT /ef/@id', ['EfController', 'updateFondDepart']);
Flight::route('GET /ef/@idEf/montant_total', ['EfController', 'getMontantTotalEntreDeuxDates']);


