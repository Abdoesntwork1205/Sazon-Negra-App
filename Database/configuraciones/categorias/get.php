<?php
include '../../../config/conexion.php';

header('Content-Type: application/json');

$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$perPage = 10;
$offset = ($page - 1) * $perPage;

try {
    // Obtener total de categorías
    $totalQuery = $conn->query("SELECT COUNT(*) as total FROM categorias");
    $total = $totalQuery->fetch_assoc()['total'];
    $totalPages = ceil($total / $perPage);

    // Obtener categorías paginadas
    $query = $conn->query("SELECT * FROM categorias ORDER BY id DESC LIMIT $offset, $perPage");
    $categories = [];

    while($row = $query->fetch_assoc()) {
        $categories[] = $row;
    }

    echo json_encode([
        'success' => true,
        'data' => $categories,
        'pagination' => [
            'current_page' => $page,
            'per_page' => $perPage,
            'total' => $total,
            'total_pages' => $totalPages
        ]
    ]);

} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
?>