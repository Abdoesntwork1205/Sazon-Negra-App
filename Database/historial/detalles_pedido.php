<?php
header('Content-Type: application/json');
require_once('../../Config/conexion.php');

$response = [
    'success' => false,
    'message' => '',
    'data' => []
];

try {
    if (!isset($_GET['action']) || !isset($_GET['pedido_id'])) {
        throw new Exception('Parámetros incompletos');
    }

    $action = $_GET['action'];
    $pedidoId = intval($_GET['pedido_id']);

    if ($action === 'pedido') {
        // Consulta modificada para excluir el campo voucher binario
        $query = "SELECT 
                    id, id_cliente, fecha_pedido, direccion, estado, tipo, 
                    precio_total, precio_subtotal, precio_bs, id_tasa, costo_envio, 
                    delivery, metodo_pago, referencia_pago, 
                    CASE WHEN voucher IS NOT NULL THEN 1 ELSE 0 END as tiene_voucher,
                    id_repartidor, id_cajero, notas, latitud, longitud
                  FROM pedidos 
                  WHERE id = ?";
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param('i', $pedidoId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            throw new Exception('Pedido no encontrado');
        }

        $pedido = $result->fetch_assoc();
        
        // Formatear datos numéricos
        $pedido['precio_total'] = number_format(floatval($pedido['precio_total']), 2);
        $pedido['precio_subtotal'] = number_format(floatval($pedido['precio_subtotal']), 2);
        $pedido['costo_envio'] = number_format(floatval($pedido['costo_envio']), 2);

        $response['success'] = true;
        $response['data'] = $pedido;

    }
    else if ($action === 'pedidoConCliente') {
        // Consulta modificada para excluir el campo voucher binario
        $query = "SELECT 
            p.id, 
            p.id_cliente, 
            c.cedula,
            c.nombre,
            c.telefono,
            c.direccion,
            p.fecha_pedido, 
            p.estado, 
            p.tipo, 
            p.precio_total, 
            p.precio_subtotal, 
            p.precio_bs, 
            p.id_tasa, 
            p.costo_envio, 
            p.delivery, 
            p.metodo_pago, 
            p.referencia_pago, 
            CASE 
                WHEN p.voucher IS NOT NULL THEN 1 
                ELSE 0 
            END as tiene_voucher,
            p.id_repartidor, 
            p.id_cajero, 
            p.notas, 
            p.latitud, 
            p.longitud
            FROM pedidos p
            LEFT JOIN usuarios_clientes c ON p.id_cliente = c.id
            WHERE p.id = ?";

        $stmt = $conn->prepare($query);
        $stmt->bind_param('i', $pedidoId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            throw new Exception('Pedido no encontrado');
        }

        $pedido = $result->fetch_assoc();
        
        // Formatear datos numéricos
        $pedido['precio_total'] = number_format(floatval($pedido['precio_total']), 2);
        $pedido['precio_subtotal'] = number_format(floatval($pedido['precio_subtotal']), 2);
        $pedido['costo_envio'] = number_format(floatval($pedido['costo_envio']), 2);

        $response['success'] = true;
        $response['data'] = $pedido;

    }
    elseif ($action === 'productos') {
        // Obtener productos del pedido (sin cambios)
        $query = "SELECT pm.*, m.titulo, m.descripcion 
                  FROM pedidos_menu pm
                  JOIN menu m ON pm.menu_id = m.id
                  WHERE pm.pedido_id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param('i', $pedidoId);
        $stmt->execute();
        $result = $stmt->get_result();

        $productos = [];
        while ($row = $result->fetch_assoc()) {
            $row['precio_unitario'] = floatval($row['precio_unitario']);
            $productos[] = $row;
        }

        $response['success'] = true;
        $response['data'] = $productos;
    } else {
        throw new Exception('Acción no válida');
    }

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
    http_response_code(500);
}

// Limpiar buffer de salida
while (ob_get_level()) ob_end_clean();

echo json_encode($response);
exit();
?>