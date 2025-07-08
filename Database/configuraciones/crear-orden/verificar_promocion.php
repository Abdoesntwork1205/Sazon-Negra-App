<?php
header('Content-Type: application/json');
require_once('../../../Config/conexion.php');

$response = ['success' => false, 'message' => '', 'data' => []];

try {
    // Obtener parámetros de entrada
    $input = json_decode(file_get_contents('php://input'), true);
    $producto_id = isset($input['producto_id']) ? intval($input['producto_id']) : null;
    $categoria_id = isset($input['categoria_id']) ? intval($input['categoria_id']) : null;

    if (!$producto_id && !$categoria_id) {
        throw new Exception('Se requiere al menos un ID de producto o categoría');
    }

    // Obtener categoría del producto si solo se envía producto_id
    if ($producto_id && !$categoria_id) {
        $categoria_query = $conn->query("SELECT categoria_id FROM menu WHERE id = $producto_id");
        if ($categoria_query->num_rows > 0) {
            $categoria_id = $categoria_query->fetch_assoc()['categoria_id'];
        }
    }

    // Buscar promoción por producto
    if ($producto_id) {
        $query = "SELECT p.* FROM promociones p
                 JOIN promociones_menu pm ON p.id = pm.promocion_id
                 WHERE pm.menu_id = $producto_id
                 AND p.fecha_inicio <= NOW() 
                 AND p.fecha_fin >= NOW()
                 LIMIT 1";
        
        $result = $conn->query($query);
        
        if ($result->num_rows > 0) {
            $response['success'] = true;
            $response['data'] = $result->fetch_assoc();
            $response['message'] = 'Promoción por producto encontrada';
            echo json_encode($response);
            exit;
        }
    }

    // Buscar promoción por categoría
    if ($categoria_id) {
        $query = "SELECT p.* FROM promociones p
                 JOIN promociones_categorias pc ON p.id = pc.promocion_id
                 WHERE pc.categoria_id = $categoria_id
                 AND p.fecha_inicio <= NOW() 
                 AND p.fecha_fin >= NOW()
                 LIMIT 1";
        
        $result = $conn->query($query);
        
        if ($result->num_rows > 0) {
            $response['success'] = true;
            $response['data'] = $result->fetch_assoc();
            $response['message'] = 'Promoción por categoría encontrada';
            echo json_encode($response);
            exit;
        }
    }

    // Si no encontró promoción, mostrar datos de depuración
    $response['message'] = 'No hay promociones activas para este producto/categoría';
    
    // Datos para depuración
    $response['debug'] = [
        'producto_id' => $producto_id,
        'categoria_id' => $categoria_id,
        'fecha_actual' => date('Y-m-d H:i:s')
    ];

} catch (Exception $e) {
    $response['message'] = 'Error: ' . $e->getMessage();
}

$conn->close();

echo json_encode($response);
?>