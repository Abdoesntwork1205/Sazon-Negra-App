<?php
header('Content-Type: application/json');
require_once('../../Config/conexion.php');

$response = [
    'success' => false,
    'message' => '',
    'voucher' => null
];

try {
    if (!isset($_GET['pedido_id'])) {
        throw new Exception('ID de pedido no especificado');
    }

    $pedidoId = intval($_GET['pedido_id']);
    
    // Obtener solo el voucher
    $query = "SELECT voucher FROM pedidos WHERE id = ? AND voucher IS NOT NULL";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('i', $pedidoId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception('No se encontró comprobante para este pedido');
    }

    $row = $result->fetch_assoc();
    $response['success'] = true;
    $response['voucher'] = base64_encode($row['voucher']);

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
    http_response_code(500);
}

$conn->close();

// Limpiar buffer de salida
while (ob_get_level()) ob_end_clean();

echo json_encode($response);
exit();
?>