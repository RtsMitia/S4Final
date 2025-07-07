<?php
require_once __DIR__ . '/../controllers/PretController.php';

Flight::route('PUT /prets/@id', ['PretController', 'insertionPret']);
