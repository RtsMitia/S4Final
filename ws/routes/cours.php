<?php
// Routes pour la gestion des cours

Flight::route('GET /cours', function() {
    $db = getDB();
    $stmt = $db->query("SELECT * FROM cours");
    Flight::json($stmt->fetchAll(PDO::FETCH_ASSOC));
});

Flight::route('POST /cours', function() {
    $data = Flight::request()->data;
    $db = getDB();
    $stmt = $db->prepare("INSERT INTO cours (nom, description, credits) VALUES (?, ?, ?)");
    $stmt->execute([$data->nom, $data->description, $data->credits]);
    Flight::json(['message' => 'Cours ajouté', 'id' => $db->lastInsertId()]);
});

// ... autres routes pour les cours
?>
