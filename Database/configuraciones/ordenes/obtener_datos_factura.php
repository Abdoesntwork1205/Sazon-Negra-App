<?php
header('Content-Type: application/json');
require_once '../../../Config/conexion.php';

$response = ['success' => false, 'data' => [], 'error' => ''];

try {
    if (!isset($_GET['order_id']) || empty($_GET['order_id'])) {
        throw new Exception('ID de pedido no proporcionado');
    }

    $orderId = intval($_GET['order_id']);

    // Consulta principal del pedido con precio_bs
    $orderSql = "SELECT 
                    p.id, 
                    p.fecha_pedido, 
                    p.direccion, 
                    p.estado, 
                    p.precio_total as total, 
                    p.precio_subtotal as subtotal, 
                    p.precio_bs,
                    p.costo_envio as delivery_cost,
                    p.delivery,
                    p.metodo_pago,
                    p.referencia_pago,
                    p.notas,
                    IFNULL(uc.nombre, 'Cliente no registrado') as cliente_nombre,
                    IFNULL(uc.cedula, 'N/A') as cliente_cedula,
                    IFNULL(uc.telefono, '') as cliente_telefono,
                    IFNULL(uc.correo, '') as cliente_email,
                    IFNULL(uc.direccion, '') as cliente_direccion
                FROM pedidos p
                LEFT JOIN usuarios_clientes uc ON p.id_cliente = uc.id
                WHERE p.id = ?";
    
    $orderStmt = $conn->prepare($orderSql);
    $orderStmt->bind_param('i', $orderId);
    $orderStmt->execute();
    $orderResult = $orderStmt->get_result();

    if ($orderResult->num_rows === 0) {
        throw new Exception('Pedido no encontrado');
    }

    $orderData = $orderResult->fetch_assoc();

    // Consulta de productos
    $productsSql = "SELECT 
                        m.titulo, 
                        pm.cantidad, 
                        pm.precio_unitario as precio,
                        pm.notas
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
            'titulo' => $product['titulo'],
            'cantidad' => $product['cantidad'],
            'precio' => floatval($product['precio']),
            'notas' => $product['notas']
        ];
    }

    // Estructurar respuesta
    $response['data'] = [
        'client' => [
            'id' => $orderData['cliente_cedula'],
            'name' => $orderData['cliente_nombre'],
            'phone' => $orderData['cliente_telefono'],
            'email' => $orderData['cliente_email'],
            'address' => $orderData['cliente_direccion']
        ],
        'products' => $products,
        'subtotal' => floatval($orderData['subtotal']),
        'delivery_cost' => floatval($orderData['delivery_cost']),
        'total' => floatval($orderData['total']),
        'total_bs' => floatval($orderData['precio_bs']), // Añadido el monto en Bs
        'payment' => [
            'method' => $orderData['metodo_pago'],
            'reference' => $orderData['referencia_pago'],
            'status' => $orderData['estado']
        ],
        'delivery' => $orderData['delivery'] === 'si' ? true : false,
        'order_id' => $orderData['id']
    ];

    $response['success'] = true;
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
} finally {
    if (isset($conn)) $conn->close();
    echo json_encode($response);
}
?>