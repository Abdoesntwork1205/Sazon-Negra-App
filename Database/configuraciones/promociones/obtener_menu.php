<?php
include '../../../Config/conexion.php';

header('Content-Type: application/json');

$searchTerm = isset($_GET['search']) ? trim($_GET['search']) : '';

try {
    $sql = "SELECT id, titulo, precio FROM menu WHERE disponible = 1";
    
    // Si hay término de búsqueda, agregamos filtro
    if (!empty($searchTerm)) {
        $sql .= " AND titulo LIKE ?";
        $searchParam = "%$searchTerm%";
    }
    
    $sql .= " ORDER BY titulo ASC";
    
    $stmt = $conn->prepare($sql);
    
    if (!empty($searchTerm)) {
        $stmt->bind_param("s", $searchParam);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $products = array();
    
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $products[] = array(
                'id' => $row['id'],
                'titulo' => $row['titulo'],
                'precio' => $row['precio']
            );
        }
    }
    
    echo json_encode($products);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        'error' => 'Error al obtener los productos: ' . $e->getMessage()
    ));
}

$conn->close();
?>