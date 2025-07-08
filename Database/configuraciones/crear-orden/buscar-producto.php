<?php
include '../../../Config/conexion.php';

header('Content-Type: application/json');

// Obtener el término de búsqueda
$searchTerm = isset($_GET['q']) ? $conn->real_escape_string($_GET['q']) : '';
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = 10; // Límite de resultados por página
$offset = ($page - 1) * $limit;

try {
    // Consulta para obtener productos que coincidan con el término de búsqueda
    $sql = "SELECT m.id, m.titulo, m.precio, m.descripcion, 
                    c.nombre AS categoria_nombre 
            FROM menu m
            JOIN categorias c ON m.categoria_id = c.id
            WHERE (m.titulo LIKE '%$searchTerm%' OR c.nombre LIKE '%$searchTerm%') 
            AND m.disponible = 1 
            ORDER BY m.titulo ASC 
            LIMIT $limit OFFSET $offset";
    
    $result = $conn->query($sql);
    
    // Consulta para el conteo total (para la paginación)
    $countSql = "SELECT COUNT(*) as total 
                 FROM menu m
                 JOIN categorias c ON m.categoria_id = c.id
                 WHERE (m.titulo LIKE '%$searchTerm%' OR c.nombre LIKE '%$searchTerm%') 
                 AND m.disponible = 1";
    $countResult = $conn->query($countSql);
    $totalCount = $countResult->fetch_assoc()['total'];
    
    $products = array();
    
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $products[] = array(
                'id' => $row['id'],
                'titulo' => $row['titulo'],
                'precio' => (float)$row['precio'],
                'descripcion' => $row['descripcion'],
                'categoria_nombre' => $row['categoria_nombre'],
                'text' => $row['titulo'] // Necesario para Select2
            );
        }
    }
    
    echo json_encode(array(
        'items' => $products,
        'total_count' => $totalCount
    ));
    
} catch(Exception $e) {
    echo json_encode(array(
        'error' => $e->getMessage()
    ));
}

$conn->close();
?>