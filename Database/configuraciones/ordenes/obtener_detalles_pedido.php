<?php
header('Content-Type: application/json');
require_once '../../../Config/conexion.php';

$response = ['success' => false, 'data' => [], 'error' => ''];

try {
    if (!isset($_GET['order_id']) || empty($_GET['order_id'])) {
        throw new Exception('ID de pedido no proporcionado');
    }

    $orderId = intval($_GET['order_id']);

    // Obtener información principal del pedido con la tasa de cambio
    $orderSql = "SELECT 
                    p.id, 
                    p.fecha_pedido, 
                    p.direccion, 
                    p.estado, 
                    p.precio_total, 
                    p.precio_subtotal, 
                    p.precio_bs,
                    p.id_tasa,
                    t.tasa as tasa_cambio,
                    p.costo_envio,
                    p.delivery,
                    p.metodo_pago,
                    p.referencia_pago,
                    p.notas,
                    IFNULL(CONCAT(uc.nombre, ' ', uc.apellido), 'Cliente no registrado') as cliente_nombre,
                    IFNULL(uc.cedula, 'N/A') as cliente_cedula,
                    IFNULL(uc.telefono, '') as cliente_telefono,
                    IFNULL(uc.correo, '') as cliente_email
                FROM pedidos p
                LEFT JOIN usuarios_clientes uc ON p.id_cliente = uc.id
                LEFT JOIN tasas t ON p.id_tasa = t.id
                WHERE p.id = ?";
    
    $orderStmt = $conn->prepare($orderSql);
    $orderStmt->bind_param('i', $orderId);
    $orderStmt->execute();
    $orderResult = $orderStmt->get_result();

    if ($orderResult->num_rows === 0) {
        throw new Exception('Pedido no encontrado');
    }

    $orderData = $orderResult->fetch_assoc();

    // Obtener productos del pedido usando menu_id para obtener el título del menú
    $productsSql = "SELECT 
                        m.titulo as nombre_producto,
                        pm.cantidad, 
                        pm.precio_unitario,
                        pm.notas as notas_producto
                    FROM pedidos_menu pm
                    JOIN menu m ON pm.menu_id = m.id
                    WHERE pm.pedido_id = ?";
    
    $productsStmt = $conn->prepare($productsSql);
    $productsStmt->bind_param('i', $orderId);
    $productsStmt->execute();
    $productsResult = $productsStmt->get_result();
    $products = [];

    while ($product = $productsResult->fetch_assoc()) {
        $products[] = [
            'nombre' => $product['nombre_producto'],
            'cantidad' => $product['cantidad'],
            'precio_unitario' => floatval($product['precio_unitario']),
            'notas' => $product['notas_producto']
        ];
    }

    // Estructurar respuesta
    $response['data'] = [
        'id' => $orderData['id'],
        'fecha_pedido' => $orderData['fecha_pedido'],
        'direccion' => $orderData['direccion'],
        'estado' => $orderData['estado'],
        'precio_total' => floatval($orderData['precio_total']),
        'subtotal' => floatval($orderData['precio_subtotal']),
        'precio_bs' => floatval($orderData['precio_bs']),
        'id_tasa' => $orderData['id_tasa'],
        'tasa_cambio' => $orderData['tasa_cambio'] ? floatval($orderData['tasa_cambio']) : null,
        'costo_envio' => floatval($orderData['costo_envio']),
        'delivery' => $orderData['delivery'] === 'si' ? true : false,
        'metodo_pago' => $orderData['metodo_pago'],
        'referencia_pago' => $orderData['referencia_pago'],
        'notas' => $orderData['notas'],
        'cliente_nombre' => $orderData['cliente_nombre'],
        'cliente_cedula' => $orderData['cliente_cedula'],
        'cliente_telefono' => $orderData['cliente_telefono'],
        'cliente_email' => $orderData['cliente_email'],
        'productos' => $products
    ];

    $response['success'] = true;
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
} finally {
    if (isset($conn)) $conn->close();
    echo json_encode($response);
}
?>