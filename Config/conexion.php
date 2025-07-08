<?php
// Datos de conexión
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "sazon_negra";

// Crear la conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar la conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

// Establecer el charset
$conn->set_charset("utf8");

// No cierres la conexión aquí
?>