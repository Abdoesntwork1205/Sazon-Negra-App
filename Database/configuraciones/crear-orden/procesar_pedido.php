<?php
header('Content-Type: application/json');
require_once '../../../Config/conexion.php';

$response = ['success' => false, 'error' => ''];

try {
    if (!isset($_POST['order'])) {
        throw new Exception('No se recibieron datos del pedido');
    }

    $order = json_decode($_POST['order'], true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Error al decodificar JSON: ' . json_last_error_msg());
    }

    // Validación de datos esenciales
    if (empty($order['client']['id']) || empty($order['products']) || !is_array($order['products'])) {
        throw new Exception('Datos del pedido incompletos o inválidos');
    }

    $conn->begin_transaction();

    // 1. Gestión del cliente
    $cliente_id = gestionarCliente($conn, $order['client']);

    // 2. Procesar comprobante de pago si existe
    $voucherData = procesarVoucher($conn);

    // 3. Insertar pedido principal con todos los nuevos campos
    $pedido_id = insertarPedido($conn, $order, $cliente_id, $voucherData);

    // 4. Insertar productos del pedido
    insertarProductos($conn, $pedido_id, $order['products']);

    // 5. Si se solicita factura, generarla
    if ($order['generate_invoice'] ?? false) {
        generarFactura($pedido_id, $order);
    }

    $conn->commit();

    $response = [
        'success' => true,
        'order_id' => $pedido_id,
        'payment_method' => $order['payment']['method'] ?? 'efectivo',
        'total_bs' => $order['total_bs'] ?? null // Incluir el monto en Bs en la respuesta
    ];

} catch (Exception $e) {
    $conn->rollback();
    $response['error'] = $e->getMessage();
} finally {
    if ($conn) $conn->close();
}

echo json_encode($response);

// Funciones auxiliares
function gestionarCliente($conn, $clientData) {
    $cedula_cliente = $conn->real_escape_string($clientData['id']);
    
    // Buscar cliente existente
    $sql = "SELECT id FROM usuarios_clientes WHERE cedula = '$cedula_cliente'";
    $result = $conn->query($sql);
    
    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $result->free();
        return $row['id'];
    }
    
    // Registrar nuevo cliente
    $nombreCompleto = explode(' ', $clientData['name'], 2);
    $nombre = $conn->real_escape_string($nombreCompleto[0]);
    $apellido = $conn->real_escape_string($nombreCompleto[1] ?? '');
    $telefono = $conn->real_escape_string($clientData['phone']);
    $correo = $conn->real_escape_string($clientData['email'] ?? '');
    $direccion = $conn->real_escape_string($clientData['address'] ?? '');

    $sql = "INSERT INTO usuarios_clientes (nombre, apellido, cedula, telefono, correo, direccion, fecha_registro)
            VALUES ('$nombre', '$apellido', '$cedula_cliente', '$telefono', '$correo', '$direccion', NOW())";

    if (!$conn->query($sql)) {
        throw new Exception('Error al registrar cliente: ' . $conn->error);
    }
    
    return $conn->insert_id;
}

function procesarVoucher($conn) {
    if (!isset($_FILES['voucher']) || $_FILES['voucher']['error'] !== UPLOAD_ERR_OK) {
        return '';
    }
    
    $voucherData = file_get_contents($_FILES['voucher']['tmp_name']);
    return $conn->real_escape_string($voucherData);
}

function insertarPedido($conn, $order, $cliente_id, $voucherData) {
    $payment = $order['payment'] ?? [];
    $deliveryValue = $order['delivery_method'] === '1' ? 'si' : 'no';
    
    // Obtener la última tasa USD->VES
    $queryTasa = "SELECT id, tasa FROM tasas 
                 WHERE moneda_origen = 'USD' AND moneda_destino = 'VES'
                 ORDER BY fecha_actualizacion DESC LIMIT 1";
    $resultTasa = $conn->query($queryTasa);
    
    $id_tasa = 0;
    $tasa_cambio = 0;
    if ($resultTasa && $resultTasa->num_rows > 0) {
        $tasa = $resultTasa->fetch_assoc();
        $id_tasa = (int)$tasa['id'];
        $tasa_cambio = (float)$tasa['tasa'];
    }
    
    // Procesar el monto en bolívares
    $total_bs = 0;
    if (isset($order['total_bs'])) {
        if (is_string($order['total_bs'])) {
            // Limpiar formato (2.338,00 → 2338.00)
            $cleaned = preg_replace('/[^0-9,]/', '', $order['total_bs']);
            $total_bs = (float)str_replace(',', '.', str_replace('.', '', $cleaned));
        } else {
            $total_bs = (float)$order['total_bs'];
        }
        
        if ($total_bs <= 0) {
            $total_bs = floatval($order['total']) * $tasa_cambio;
        }
    } else {
        $total_bs = floatval($order['total']) * $tasa_cambio;
    }

    // Redondear a 2 decimales
    $total_bs = round($total_bs, 2);

    $sql = "INSERT INTO pedidos (
        id_cliente, fecha_pedido, direccion, estado, tipo,
        precio_total, precio_subtotal, precio_bs, id_tasa, costo_envio, delivery,
        metodo_pago, referencia_pago, voucher, notas,
        latitud, longitud
    ) VALUES (
        $cliente_id, NOW(),
        '".$conn->real_escape_string($order['client']['address'] ?? '')."',
        '".$conn->real_escape_string($payment['status'] ?? 'pendiente')."',
        'normal',
        ".floatval($order['total']).",
        ".floatval($order['subtotal']).",
        ".$total_bs.",
        ".$id_tasa.",
        ".floatval($order['delivery_cost']).",
        '$deliveryValue',
        '".$conn->real_escape_string($payment['method'] ?? 'efectivo')."',
        '".$conn->real_escape_string($payment['reference'] ?? '')."',
        '$voucherData',
        '".$conn->real_escape_string($order['notes'] ?? '')."',
        ".floatval($order['client']['lat'] ?? 0).",
        ".floatval($order['client']['lng'] ?? 0)."
    )";

    if (!$conn->query($sql)) {
        throw new Exception('Error al guardar pedido: ' . $conn->error);
    }
    
    return $conn->insert_id;
}

function insertarProductos($conn, $pedido_id, $productos) {
    $sql = "INSERT INTO pedidos_menu (
        pedido_id, menu_id, cantidad, precio_unitario, precio_promocional, notas
    ) VALUES (?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception('Error al preparar consulta de productos: ' . $conn->error);
    }

    foreach ($productos as $product) {
        $precio_promocional = null;
        $notas_producto = '';
        
        $stmt->bind_param(
            'iiidss',
            $pedido_id,
            $product['id'],
            $product['quantity'],
            $product['precio'],
            $precio_promocional,
            $notas_producto
        );
        
        if (!$stmt->execute()) {
            throw new Exception('Error al guardar productos: ' . $stmt->error);
        }
    }
    $stmt->close();
}

function generarFactura($pedido_id, $orderData) {
    // Implementación básica - puedes expandir esto según tus necesidades
    // Esta función podría generar el PDF directamente o preparar los datos para el frontend
    
    // Ejemplo: Guardar información de factura en la base de datos
    // $sql = "INSERT INTO facturas (pedido_id, datos) VALUES (?, ?)";
    // $stmt = $conn->prepare($sql);
    // $stmt->bind_param("is", $pedido_id, json_encode($orderData));
    // $stmt->execute();
    // $stmt->close();
    
    // O simplemente registrar que se generó la factura
    // $sql = "UPDATE pedidos SET factura_generada = 1 WHERE id = $pedido_id";
    // $conn->query($sql);
}