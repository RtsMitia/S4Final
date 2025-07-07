<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
require 'db.php';

try {
    $searchTerm = isset($_GET['q']) ? trim($_GET['q']) : '';
    
    if (empty($searchTerm)) {
        echo json_encode(['error' => 'Terme de recherche requis']);
        exit;
    }
    $db = getDB();
    $sql = "SELECT id, nom, prenom, mail FROM s4_final_client 
            WHERE nom LIKE :search 
            OR prenom LIKE :search 
            ORDER BY nom, prenom";
    
    $stmt = $db->prepare($sql);
    $likeTerm = '%' . $searchTerm . '%';
    $stmt->bindParam(':search', $likeTerm, PDO::PARAM_STR);
    $stmt->execute();
    
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($results);
    
} catch (Exception $e) {
    echo json_encode(['error' => 'Erreur serveur: ' . $e->getMessage()]);
}
?>
