<?php
include '../../../Config/conexion.php';

header('Content-Type: application/json');

try {
    $sql = "SELECT id, nombre FROM categorias WHERE activa = 1 ORDER BY nombre ASC";
    $result = $conn->query($sql);
    
    $categorias = [];
    while ($row = $result->fetch_assoc()) {
        $categorias[] = $row;
    }

    echo json_encode([
        'success' => true,
        'data' => $categorias
    ]);

} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
?>