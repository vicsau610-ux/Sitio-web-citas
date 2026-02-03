<?php
require "conexion.php";

$result = $conn->query("SELECT * FROM denuncias ORDER BY fecha DESC");

$denuncias = [];

while ($row = $result->fetch_assoc()) {
    $denuncias[] = $row;
}

echo json_encode([
    "success" => true,
    "denuncias" => $denuncias
]);
