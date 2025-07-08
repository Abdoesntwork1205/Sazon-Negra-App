<?php
include '../../../config/conexion.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $nombre = $conn->real_escape_string($_POST['nombre']);
    $descripcion = $conn->real_escape_string($_POST['descripcion']);
    $activa = isset($_POST['activa']) ? (int)$_POST['activa'] : 0;

    try {
        $stmt = $conn->prepare("INSERT INTO categorias (nombre, descripcion, activa) VALUES (?, ?, ?)");
        $stmt->bind_param("ssi", $nombre, $descripcion, $activa);
        $stmt->execute();

        echo json_encode(['success' => true]);

    } catch(Exception $e) {
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Método no permitido'
    ]);
}

$conn->close();
?>