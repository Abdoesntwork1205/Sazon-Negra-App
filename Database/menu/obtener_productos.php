<?php
header('Content-Type: application/json');
require_once '../../config/conexion.php';

$response = [
    'success' => false,
    'data' => [],
    'message' => ''
];

try {
    $sql = "SELECT 
                m.id, 
                m.titulo AS nombre, 
                m.descripcion, 
                m.precio, 
                m.imagen,
                c.nombre AS categoria,
                m.disponible
            FROM menu m
            JOIN categorias c ON m.categoria_id = c.id
            WHERE m.disponible = 1
            ORDER BY c.nombre, m.titulo";

    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conn->error);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $productos = [];
    while ($row = $result->fetch_assoc()) {
        // Convertir BLOB a Base64 solo si existe imagen
        $imagenBase64 = null;
        if (!empty($row['imagen'])) {
            $imagenBase64 = 'data:image/jpeg;base64,' . base64_encode($row['imagen']);
        }
        
        $productos[] = [
            'id' => $row['id'],
            'nombre' => htmlspecialchars($row['nombre'], ENT_QUOTES, 'UTF-8'),
            'descripcion' => htmlspecialchars($row['descripcion'], ENT_QUOTES, 'UTF-8'),
            'precio' => (float)$row['precio'],
            'categoria' => htmlspecialchars($row['categoria'], ENT_QUOTES, 'UTF-8'),
            'imagen' => $imagenBase64 ?: 'img/default-food.jpg',
            'disponible' => (bool)$row['disponible']
        ];
    }

    $response['success'] = true;
    $response['data'] = $productos;
    $response['message'] = 'Productos obtenidos correctamente';

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