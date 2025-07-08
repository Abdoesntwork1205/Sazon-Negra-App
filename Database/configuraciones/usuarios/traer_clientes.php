<?php
header('Content-Type: application/json');
require_once '../../../Config/conexion.php';

$response = ['success' => false, 'data' => [], 'pagination' => []];

try {
    // Pagination parameters
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $perPage = isset($_GET['per_page']) ? max(1, intval($_GET['per_page'])) : 10;
    $offset = ($page - 1) * $perPage;

    // Filters
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $status = isset($_GET['status']) ? $_GET['status'] : '';

    // Base query
    $sql = "SELECT SQL_CALC_FOUND_ROWS 
                id, nombre, apellido, cedula, nacionalidad, telefono, 
                fecha_nacimiento, correo, fecha_registro, direccion, 
                puntos_acumulados
            FROM usuarios_clientes 
            WHERE 1=1";

    $params = [];
    $types = '';

    // Apply filters
    if (!empty($search)) {
        $sql .= " AND (nombre LIKE ? OR apellido LIKE ? OR cedula LIKE ? OR correo LIKE ? OR telefono LIKE ?)";
        $searchTerm = "%$search%";
        $params = array_merge($params, [$searchTerm, $searchTerm, $searchTerm, $searchTerm, $searchTerm]);
        $types .= 'sssss';
    }

    // Order and pagination
    $sql .= " ORDER BY fecha_registro DESC LIMIT ? OFFSET ?";
    $params = array_merge($params, [$perPage, $offset]);
    $types .= 'ii';

    // Prepare and execute query
    $stmt = $conn->prepare($sql);
    if ($types) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();

    // Get data
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = [
            'id' => $row['id'],
            'nombre' => $row['nombre'],
            'apellido' => $row['apellido'],
            'cedula' => $row['cedula'],
            'nacionalidad' => $row['nacionalidad'],
            'telefono' => $row['telefono'],
            'fecha_nacimiento' => $row['fecha_nacimiento'],
            'correo' => $row['correo'],
            'fecha_registro' => $row['fecha_registro'],
            'direccion' => $row['direccion'],
            'puntos_acumulados' => $row['puntos_acumulados']
        ];
    }

    // Get total records
    $totalResult = $conn->query("SELECT FOUND_ROWS()");
    $totalRows = $totalResult->fetch_row()[0];
    $totalPages = ceil($totalRows / $perPage);

    $response['success'] = true;
    $response['data'] = $data;
    $response['pagination'] = [
        'total' => $totalRows,
        'per_page' => $perPage,
        'current_page' => $page,
        'last_page' => $totalPages,
        'from' => $offset + 1,
        'to' => min($offset + $perPage, $totalRows)
    ];

} catch (Exception $e) {
    $response['error'] = $e->getMessage();
} finally {
    if (isset($conn)) $conn->close();
    echo json_encode($response);
}
?>