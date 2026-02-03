<?php
require "conexion.php";

$nombre     = $_POST['nombre'] ?? '';
$email      = $_POST['email'] ?? '';
$telefono   = $_POST['telefono'] ?? '';
$contrasena = $_POST['contrasena'] ?? '';

$sql = "INSERT INTO usuarios (nombre, email, telefono, contrasena)
        VALUES ('$nombre', '$email', '$telefono', '$contrasena')";

echo json_encode([
    "success" => $conn->query($sql)
]);
