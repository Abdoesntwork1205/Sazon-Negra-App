<?php
header('Content-Type: application/json');
require_once('../../../Config/conexion.php');

$response = ['success' => false, 'data' => [], 'message' => ''];

try {
    // Verificar conexión a la base de datos
    if (!$conn || $conn->connect_error) {
        throw new Exception('Error de conexión a la base de datos: ' . ($conn->connect_error ?? 'Desconocido'));
    }

    // Consulta unificada para obtener promociones con conteo de categorías y productos
    $query = "SELECT 
                p.id,
                p.nombre,
                p.tipo,
                p.valor_descuento,
                p.fecha_inicio,
                p.fecha_fin,
                COUNT(DISTINCT pc.categoria_id) as categorias_count,
                COUNT(DISTINCT pm.menu_id) as productos_count
              FROM promociones p
              LEFT JOIN promociones_categorias pc ON p.id = pc.promocion_id
              LEFT JOIN promociones_menu pm ON p.id = pm.promocion_id
              WHERE p.fecha_fin >= NOW()
              GROUP BY p.id, p.nombre, p.tipo, p.valor_descuento, p.fecha_inicio, p.fecha_fin
              ORDER BY p.fecha_inicio DESC";

    $result = $conn->query($query);

    if (!$result) {
        throw new Exception('Error en la consulta: ' . $conn->error);
    }

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            // Determinar el texto de aplicación
            $aplicacion = [];
            if ($row['categorias_count'] > 0) {
                $aplicacion[] = $row['categorias_count'] . ' categoría(s)';
            }
            if ($row['productos_count'] > 0) {
                $aplicacion[] = $row['productos_count'] . ' producto(s)';
            }
            
            $response['data'][] = [
                'id' => $row['id'],
                'nombre' => $row['nombre'],
                'tipo' => $row['tipo'],
                'valor_descuento' => $row['valor_descuento'],
                'fecha_inicio' => date('d/m/Y H:i', strtotime($row['fecha_inicio'])),
                'fecha_fin' => date('d/m/Y H:i', strtotime($row['fecha_fin'])),
                'aplicacion' => implode(' + ', $aplicacion),
                'detalle' => [
                    'categorias' => $row['categorias_count'],
                    'productos' => $row['productos_count']
                ]
            ];
        }
        $response['success'] = true;
    } else {
        $response['message'] = 'No hay promociones activas actualmente';
    }
} catch (Exception $e) {
    $response['message'] = 'Error: ' . $e->getMessage();
    error_log('Error en obtener_promociones_activas: ' . $e->getMessage());
}

// Cerrar conexión
if (isset($conn) && $conn instanceof mysqli) {
    $conn->close();
}

echo json_encode($response);
?>