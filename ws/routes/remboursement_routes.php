<?php
require_once __DIR__ . '/../controllers/RemboursementController.php';

Flight::route('GET /remboursement', ['RemboursementController', 'getInteret']);