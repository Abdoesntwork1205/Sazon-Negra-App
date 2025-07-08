<?php
// get_categorias.php
header('Content-Type: application/json');
require_once '../../config/conexion.php';

$response = [
    'success' => false,
    'data' => [],
    'message' => ''
];

try {
    $sql = "SELECT id, nombre, descripcion, activa FROM categorias WHERE activa = 1";
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conn->error);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $categorias = [];
    while ($row = $result->fetch_assoc()) {
        $categorias[] = [
            'id' => $row['id'],
            'nombre' => htmlspecialchars($row['nombre'], ENT_QUOTES, 'UTF-8'),
            'descripcion' => htmlspecialchars($row['descripcion'], ENT_QUOTES, 'UTF-8'),
            'activa' => (bool)$row['activa']
        ];
    }

    $response['success'] = true;
    $response['data'] = $categorias;
    $response['message'] = 'Categorías obtenidas correctamente';

    $stmt->close();
} catch (Exception $e) {
    $response['message'] = 'Error: ' . $e->getMessage();
    http_response_code(500);
} finally {
    if (isset($conn)) {
        $conn->close();
    }
}

ob_clean();
echo json_encode($response);
exit();
?>