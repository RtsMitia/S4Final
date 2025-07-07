<?php
require_once __DIR__ . '/../controllers/PretController.php';

Flight::route('GET /prets/@id/statuts', ['PretController', 'getStatutsPret']);
Flight::route('GET /prets/@id/export-pdf', ['PretController', 'exportPretPDF']);

?>
