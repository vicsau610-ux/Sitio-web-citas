<?php
require "conexion.php";

$categoria   = $_POST['tipo'] ?? '';
$descripcion = $_POST['descripcion'] ?? '';
$id_usuario  = $_POST['id_usuario'] ?? 1;

$sql = "INSERT INTO denuncias (categoria, fecha, descripcion, id_usuario)
        VALUES ('$categoria', NOW(), '$descripcion', $id_usuario)";

$conn->query($sql);

echo json_encode([
    "success" => true,
    "id_denuncia" => $conn->insert_id
]);
