<?php
include '../../../config/conexion.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $id = (int)$_POST['id'];
    $nombre = $conn->real_escape_string($_POST['nombre']);
    $descripcion = $conn->real_escape_string($_POST['descripcion']);
    $activa = isset($_POST['activa']) ? 1 : 0;

    try {
        $stmt = $conn->prepare("UPDATE categorias SET nombre = ?, descripcion = ?, activa = ? WHERE id = ?");
        $stmt->bind_param("ssii", $nombre, $descripcion, $activa, $id);
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