<?php
header('Content-Type: application/json');
require_once '../../../Config/conexion.php';

$response = ['success' => false, 'data' => [], 'error' => ''];

try {
    // Consulta para obtener pedidos por confirmar con monto total
    $sql = "SELECT 
                p.id, 
                DATE_FORMAT(p.fecha_pedido, '%d/%m/%Y %H:%i') as fecha_pedido, 
                p.estado, 
                p.precio_total as monto_total,
                IFNULL(uc.nombre, 'Cliente no registrado') as cliente_nombre,
                IFNULL(uc.cedula, 'N/A') as cliente_cedula
            FROM pedidos p
            LEFT JOIN usuarios_clientes uc ON p.id_cliente = uc.id
            WHERE p.estado = 'por_confirmar'
            ORDER BY p.fecha_pedido DESC
            LIMIT 10";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }
    
    $response['success'] = true;
    $response['data'] = $orders;
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
} finally {
    if (isset($conn)) $conn->close();
    echo json_encode($response);
}
?>