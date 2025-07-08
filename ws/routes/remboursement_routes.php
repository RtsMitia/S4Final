<?php
require_once __DIR__ . '/../controllers/RemboursementController.php';

Flight::route('GET /remboursement', ['RemboursementController', 'getInteret']);
Flight::route('GET /remboursement/calculate', ['RemboursementController', 'calculateSchedule']);
Flight::route('POST /remboursement/create', ['RemboursementController', 'createRepaymentSchedule']);