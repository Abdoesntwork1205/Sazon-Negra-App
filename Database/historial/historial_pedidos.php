<?php
header('Content-Type: application/json');
include '../../Config/conexion.php';

session_start();
$response = [
    'success' => false,
    'data' => [],
    'message' => ''
];

// Verificar sesión
if (!isset($_SESSION['userData'])) {
    ob_end_clean(); // Limpiar buffer antes de salir
    $response['message'] = 'Usuario no autenticado';
    http_response_code(401);
    echo json_encode($response);
    exit;
}

$userId = $_SESSION['userData']['id'];

$estado = $_GET['estado'];
$orden = $_GET['orden'];

// Dirección del orden
$orderDirection = ($orden === "recientes") ? "DESC" : "ASC";

try {
    // Construcción base de la consulta
    $sql = "SELECT 
                p.id,
                p.fecha_pedido,
                p.estado,
                p.delivery,
                p.precio_total,
                p.metodo_pago
            FROM pedidos p
            WHERE p.id_cliente = ?";

    // Condición opcional por estado
    if ($estado !== "all") {
        $sql .= " AND p.estado = ?";
    }

    // Añadir orden y límite
    $sql .= " ORDER BY p.fecha_pedido $orderDirection LIMIT 10";

    $stmt = $conn->prepare($sql);
    if (!$stmt) throw new Exception("Error al preparar la consulta: " . $conn->error);
    
    if ($estado !== "all") {
        $stmt->bind_param("is", $userId, $estado);
    } else {
        $stmt->bind_param("i", $userId);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $pedidos = [];
    while ($row = $result->fetch_assoc()) {
        $pedidos[] = [
            'id' => $row['id'],
            'fecha' => date('d/m/Y - H:i', strtotime($row['fecha_pedido'])),
            'estado' => $row['estado'],
            'delivery' => $row['delivery'],
            'total' => number_format($row['precio_total'], 2, ',', '.'),
            'metodo_pago' => ucfirst(str_replace('_', ' ', $row['metodo_pago']))
        ];
    }

    $response = [
        'success' => true,
        'data' => $pedidos,
        'message' => count($pedidos) . ' pedidos encontrados'
    ];

}  finally {
    if (isset($stmt)) $stmt->close();
    if (isset($conn)) $conn->close();
    
    echo json_encode($response);
    exit();
}
?>
?>