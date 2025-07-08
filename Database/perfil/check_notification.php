<?php
session_start();
require_once '../../Config/conexion.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user'])) {
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

$userId = $_SESSION['user']['id'];

// Obtener pedidos con cambios recientes
$stmt = $conn->prepare("
    SELECT id, estado, fecha_pedido 
    FROM pedidos 
    WHERE id_cliente = ? 
    AND estado IN ('confirmado', 'cancelado')
    AND fecha_pedido > DATE_SUB(NOW(), INTERVAL 2 DAY)
    ORDER BY fecha_pedido DESC
    LIMIT 10
");
$stmt->bind_param('i', $userId);
$stmt->execute();
$result = $stmt->get_result();

$notificaciones = [];
while ($pedido = $result->fetch_assoc()) {
    $mensaje = match($pedido['estado']) {
        'confirmado' => "✅ Tu pedido #{$pedido['id']} ha sido confirmado",
        'cancelado' => "❌ Pedido #{$pedido['id']} cancelado",
        default => ''
    };
    
    if ($mensaje) {
        $notificaciones[] = [
            'id' => $pedido['id'],
            'mensaje' => $mensaje,
            'fecha' => $pedido['fecha_pedido'],
            'estado' => $pedido['estado']
        ];
    }
}

echo json_encode([
    'success' => true,
    'notificaciones' => $notificaciones,
    'count' => count($notificaciones) // El cliente ajustará este número
]);