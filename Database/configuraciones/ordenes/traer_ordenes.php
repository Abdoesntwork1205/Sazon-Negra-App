<?php
header('Content-Type: application/json');
require_once '../../../Config/conexion.php';

$response = ['success' => false, 'data' => [], 'pagination' => []];

try {
    // Obtener parámetros de filtrado
    $searchId = isset($_GET['searchId']) ? trim($_GET['searchId']) : '';
    $deliveryFilter = isset($_GET['deliveryFilter']) ? $_GET['deliveryFilter'] : '';
    $statusFilter = isset($_GET['statusFilter']) ? $_GET['statusFilter'] : '';
    $startDate = isset($_GET['startDate']) ? $_GET['startDate'] : '';
    $endDate = isset($_GET['endDate']) ? $_GET['endDate'] : '';
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $perPage = 10;

    // Construir consulta base
    $sql = "SELECT 
                p.id,
                p.id_cliente,
                DATE_FORMAT(p.fecha_pedido, '%Y-%m-%d %H:%i:%s') as fecha_pedido,
                p.direccion,
                p.estado,
                p.precio_total,
                p.precio_bs,
                p.metodo_pago,
                p.delivery,
                p.notas,
                IFNULL(CONCAT(uc.nombre, ' ', uc.apellido), 'Cliente no registrado') as cliente_nombre,
                IFNULL(uc.cedula, 'N/A') as cliente_cedula
            FROM pedidos p
            LEFT JOIN usuarios_clientes uc ON p.id_cliente = uc.id
            WHERE 1=1";

    $params = [];
    $types = '';

    // Aplicar filtros
    if (!empty($searchId)) {
        $sql .= " AND (uc.cedula LIKE ? OR p.id = ?)";
        $searchTerm = "%$searchId%";
        $params[] = $searchTerm;
        $params[] = intval($searchId);
        $types .= 'si';
    }

    // Filtro de delivery
    if (!empty($deliveryFilter) && in_array($deliveryFilter, ['si', 'no'])) {
        $sql .= " AND p.delivery = ?";
        $params[] = $deliveryFilter;
        $types .= 's';
    }

    if (!empty($statusFilter) && in_array($statusFilter, ['confirmado', 'por_confirmar', 'cancelado'])) {
        $sql .= " AND p.estado = ?";
        $params[] = $statusFilter;
        $types .= 's';
    }

    if (!empty($startDate) && !empty($endDate)) {
        $sql .= " AND p.fecha_pedido BETWEEN ? AND ?";
        $params[] = $startDate;
        $params[] = $endDate . ' 23:59:59';
        $types .= 'ss';
    }

    // Consulta para conteo total
    $countSql = "SELECT COUNT(*) as total FROM ($sql) as count_table";
    $stmtCount = $conn->prepare($countSql);
    
    if (!empty($params)) {
        $stmtCount->bind_param($types, ...$params);
    }

    $stmtCount->execute();
    $totalResult = $stmtCount->get_result();
    $totalRow = $totalResult->fetch_assoc();
    $totalRows = $totalRow['total'];
    $stmtCount->close();

    // Consulta principal con paginación
    $sql .= " ORDER BY p.fecha_pedido DESC LIMIT ? OFFSET ?";
    $offset = ($page - 1) * $perPage;
    $params[] = $perPage;
    $params[] = $offset;
    $types .= 'ii';

    $stmt = $conn->prepare($sql);
    
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orders[] = [
            'id' => $row['id'],
            'client_id' => $row['id_cliente'],
            'client_cedula' => $row['cliente_cedula'],
            'client_name' => $row['cliente_nombre'],
            'date' => $row['fecha_pedido'],
            'address' => $row['direccion'],
            'status' => $row['estado'],
            'total' => number_format($row['precio_total'], 2),
            'total_bs' => number_format($row['precio_bs'], 2),
            'payment_type' => $row['metodo_pago'],
            'delivery' => $row['delivery'],
            'notes' => $row['notas']
        ];
    }

    $stmt->close();

    $response = [
        'success' => true,
        'data' => $orders,
        'pagination' => [
            'total' => $totalRows,
            'per_page' => $perPage,
            'current_page' => $page,
            'last_page' => ceil($totalRows / $perPage),
            'from' => $offset + 1,
            'to' => min($offset + $perPage, $totalRows)
        ]
    ];

} catch (Exception $e) {
    $response['error'] = $e->getMessage();
} finally {
    if ($conn) $conn->close();
    echo json_encode($response);
}
?>