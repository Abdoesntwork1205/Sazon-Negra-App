<?php
header('Content-Type: application/json');
require_once '../../../Config/conexion.php';

$response = ['success' => false, 'error' => ''];

try {
    if (!isset($_POST['order_id']) || empty($_POST['order_id'])) {
        throw new Exception('ID de pedido no proporcionado');
    }

    $orderId = intval($_POST['order_id']);

    // Verificar que el pedido existe y está en estado "por_confirmar"
    $checkSql = "SELECT estado FROM pedidos WHERE id = ?";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param('i', $orderId);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();

    if ($checkResult->num_rows === 0) {
        throw new Exception('El pedido no existe');
    }

    $order = $checkResult->fetch_assoc();
    if ($order['estado'] !== 'por_confirmar') {
        throw new Exception('Solo se pueden confirmar pedidos por confirmar');
    }

    // Actualizar estado del pedido a "confirmado"
    $updateSql = "UPDATE pedidos SET estado = 'confirmado' WHERE id = ?";
    $updateStmt = $conn->prepare($updateSql);
    $updateStmt->bind_param('i', $orderId);

    if (!$updateStmt->execute()) {
        throw new Exception('Error al actualizar el pedido: ' . $conn->error);
    }

    $response['success'] = true;
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
} finally {
    if (isset($conn)) $conn->close();
    echo json_encode($response);
}
?>