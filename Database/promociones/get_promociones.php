<?php
header('Content-Type: application/json');
require_once('../../Config/conexion.php');

$response = ['success' => false, 'message' => '', 'promociones' => []];

try {
    // 1. Buscar promociones por categoría que estén activas
    $queryCategorias = "SELECT p.*, c.nombre as nombre_categoria, pc.categoria_id
                       FROM promociones p
                       JOIN promociones_categorias pc ON p.id = pc.promocion_id
                       JOIN categorias c ON pc.categoria_id = c.id
                       WHERE p.fecha_inicio <= NOW() 
                       AND p.fecha_fin >= NOW()";
    
    $resultCategorias = $conn->query($queryCategorias);
    
    if ($resultCategorias->num_rows > 0) {
        while ($promocion = $resultCategorias->fetch_assoc()) {
            // Buscar productos de esta categoría con sus imágenes
            $queryProductos = "SELECT id, titulo, precio, imagen 
                              FROM menu 
                              WHERE categoria_id = {$promocion['categoria_id']} 
                              AND disponible = 1";
            
            $resultProductos = $conn->query($queryProductos);
            $productos = [];
            
            if ($resultProductos->num_rows > 0) {
                while ($producto = $resultProductos->fetch_assoc()) {
                    // Convertir precio a número flotante y procesar imagen
                    $producto['precio'] = floatval($producto['precio']);
                    $producto['imagen'] = !empty($producto['imagen']) ? 
                        'data:image/jpeg;base64,' . base64_encode($producto['imagen']) : 
                        null;
                    $productos[] = $producto;
                }
            }
            
            $promocion['tipo_promocion'] = 'categoria';
            $promocion['productos'] = $productos;
            $promocion['valor_descuento'] = floatval($promocion['valor_descuento']);
            
            $response['promociones'][] = $promocion;
        }
    }
    
    // 2. Buscar promociones por producto específico que estén activas
    $queryProductos = "SELECT p.*, m.titulo as nombre_producto, m.precio as precio_producto, 
                              m.imagen as imagen_producto, pm.menu_id
                      FROM promociones p
                      JOIN promociones_menu pm ON p.id = pm.promocion_id
                      JOIN menu m ON pm.menu_id = m.id
                      WHERE p.fecha_inicio <= NOW() 
                      AND p.fecha_fin >= NOW()";
    
    $resultProductos = $conn->query($queryProductos);
    
    if ($resultProductos->num_rows > 0) {
        while ($promocion = $resultProductos->fetch_assoc()) {
            $promocion['tipo_promocion'] = 'producto';
            $promocion['valor_descuento'] = floatval($promocion['valor_descuento']);
            $promocion['precio_producto'] = floatval($promocion['precio_producto']);
            $promocion['imagen_producto'] = !empty($promocion['imagen_producto']) ? 
                'data:image/jpeg;base64,' . base64_encode($promocion['imagen_producto']) : 
                null;
            
            $response['promociones'][] = $promocion;
        }
    }
    
    if (!empty($response['promociones'])) {
        $response['success'] = true;
        $response['message'] = 'Promociones activas encontradas';
    } else {
        $response['message'] = 'No hay promociones activas en este momento';
    }

} catch (Exception $e) {
    $response['message'] = 'Error: ' . $e->getMessage();
    http_response_code(500);
}

$conn->close();

// Limpiar buffer y enviar respuesta
ob_clean();
echo json_encode($response);
exit();
?>