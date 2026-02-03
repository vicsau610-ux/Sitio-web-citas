<?php
$conn = new mysqli("localhost", "root", "", "amonsafe");

if ($conn->connect_error) {
    die(json_encode(["success" => false, "error" => "Error de conexión"]));
}
?>
