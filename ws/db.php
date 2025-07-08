<?php
function getDB() {
    $host = 'localhost';
    $dbname = 'db_s2_ETU003363';
    $username = 'ETU003363';
    $password = '6rs0CXKK';

    try {
        return new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);
    } catch (PDOException $e) {
        die(json_encode(['error' => $e->getMessage()]));
    }
}
