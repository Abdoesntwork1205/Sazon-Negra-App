<?php
header('Content-Type: application/json');
include_once('../../../Config/conexion.php');

try {
    // Consulta modificada para incluir el nombre del usuario desde usuarios_personal
    $query = "SELECT t.*, up.nombre AS usuario_nombre 
              FROM tasas t
              LEFT JOIN usuarios_personal up ON t.usuario_id = up.id
              ORDER BY t.fecha_actualizacion DESC";
    
    $result = $conn->query($query);
    
    if (!$result) {
        throw new Exception("Error en la consulta: " . $conn->error);
    }
    
    $rates = [];
    while ($row = $result->fetch_assoc()) {
        // Si no hay usuario asociado, mostrar "Sistema" como valor por defecto
        if (empty($row['usuario_nombre'])) {
            $row['usuario_nombre'] = 'Sistema';
        }
        $rates[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $rates
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener las tasas: ' . $e->getMessage()
    ]);
}

$conn->close();
?>