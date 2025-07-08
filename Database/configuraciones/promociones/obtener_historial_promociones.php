<?php
header('Content-Type: application/json');
require_once('../../../Config/conexion.php');

$response = ['success' => false, 'data' => [], 'message' => ''];

try {
    // Verificar conexión
    if (!$conn || $conn->connect_error) {
        throw new Exception('Error de conexión a la base de datos');
    }

    $query = "SELECT p.*, 
              COUNT(DISTINCT pc.categoria_id) as categorias_count,
              COUNT(DISTINCT pm.menu_id) as productos_count
              FROM promociones p
              LEFT JOIN promociones_categorias pc ON p.id = pc.promocion_id
              LEFT JOIN promociones_menu pm ON p.id = pm.promocion_id
              WHERE p.fecha_fin < NOW()
              GROUP BY p.id
              ORDER BY p.fecha_fin DESC";

    $result = $conn->query($query);

    if (!$result) {
        throw new Exception('Error en la consulta: ' . $conn->error);
    }

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            // Determinar tipo de aplicación y conteo
            $aplicacion = '';
            $count = 0;
            
            if ($row['categorias_count'] > 0) {
                $aplicacion = 'categorias';
                $count = $row['categorias_count'];
            } else {
                $aplicacion = 'productos';
                $count = $row['productos_count'];
            }

            $response['data'][] = [
                'id' => $row['id'],
                'nombre' => $row['nombre'],
                'tipo' => $row['tipo'],
                'valor_descuento' => $row['valor_descuento'],
                'fecha_inicio' => date('d/m/Y H:i', strtotime($row['fecha_inicio'])),
                'fecha_fin' => date('d/m/Y H:i', strtotime($row['fecha_fin'])),
                'aplicacion' => $count . ' ' . ($aplicacion === 'categorias' ? 'categoría(s)' : 'producto(s)')
            ];
        }
        $response['success'] = true;
    } else {
        $response['message'] = 'No hay historial de promociones';
    }
} catch (Exception $e) {
    $response['message'] = 'Error: ' . $e->getMessage();
    error_log('Error en obtener_historial_promociones: ' . $e->getMessage());
}

if (isset($conn) && $conn instanceof mysqli) {
    $conn->close();
}

echo json_encode($response);
?>