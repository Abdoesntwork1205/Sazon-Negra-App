<?php
header('Content-Type: application/json');
require_once '../../../Config/conexion.php';

$response = ['success' => false, 'data' => [], 'pagination' => []];

try {
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $perPage = isset($_GET['per_page']) ? max(1, intval($_GET['per_page'])) : 10;
    $offset = ($page - 1) * $perPage;

    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $status = isset($_GET['status']) ? $_GET['status'] : '';
    $rol = isset($_GET['rol']) ? $_GET['rol'] : '';

    $sql = "SELECT SQL_CALC_FOUND_ROWS 
                id, nombre, apellido, cedula, nacionalidad, correo, 
                telefono, rol, fecha_contratacion, activo
            FROM usuarios_personal 
            WHERE 1=1";
    
    $params = [];
    $types = '';

    if (!empty($search)) {
        $sql .= " AND (nombre LIKE ? OR apellido LIKE ? OR cedula LIKE ? OR correo LIKE ? OR telefono LIKE ?)";
        $searchTerm = "%$search%";
        $params = array_merge($params, [$searchTerm, $searchTerm, $searchTerm, $searchTerm, $searchTerm]);
        $types .= 'sssss';
    }

    if ($status === 'active' || $status === 'activo') {
        $sql .= " AND (activo = 'activo' OR activo = 1)";
    } elseif ($status === 'inactive' || $status === 'inactivo') {
        $sql .= " AND (activo = 'inactivo' OR activo = 0)";
    }

    if (!empty($rol)) {
        $sql .= " AND rol = ?";
        $params[] = $rol;
        $types .= 's';
    }

    $sql .= " ORDER BY fecha_contratacion DESC LIMIT ? OFFSET ?";
    $params = array_merge($params, [$perPage, $offset]);
    $types .= 'ii';

    $stmt = $conn->prepare($sql);
    if ($types) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $activo = $row['activo'];
        if (is_numeric($activo)) {
            $activo = (int)$activo === 1 ? 'activo' : 'inactivo';
        }
        
        $data[] = [
            'id' => $row['id'],
            'nombre' => $row['nombre'],
            'apellido' => $row['apellido'],
            'cedula' => $row['cedula'],
            'nacionalidad' => $row['nacionalidad'],
            'correo' => $row['correo'],
            'telefono' => $row['telefono'],
            'rol' => $row['rol'],
            'fecha_contratacion' => $row['fecha_contratacion'],
            'activo' => $activo === 'activo'
        ];
    }

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