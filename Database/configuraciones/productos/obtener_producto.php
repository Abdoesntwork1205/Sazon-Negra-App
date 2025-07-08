<?php
include '../../../Config/conexion.php';

header('Content-Type: application/json');

try {
    // Configuración de paginación
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $perPage = 10;
    $offset = ($page - 1) * $perPage;

    // Consulta para contar total de ítems en el menú
    $countSql = "SELECT COUNT(*) as total FROM menu";
    $countResult = $conn->query($countSql);
    
    if (!$countResult) {
        throw new Exception("Error al contar registros del menú: " . $conn->error);
    }
    
    $totalItems = $countResult->fetch_assoc()['total'];
    $totalPages = ceil($totalItems / $perPage);

    // Consulta principal con paginación
    $sql = "SELECT m.id, m.titulo, m.categoria_id, m.descripcion, 
                   m.precio, m.disponible, m.destacado, 
                   m.tiempo_preparacion, m.imagen,
                   c.nombre as categoria_nombre 
            FROM menu m 
            LEFT JOIN categorias c ON m.categoria_id = c.id 
            ORDER BY m.id DESC 
            LIMIT ?, ?";
    
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error al preparar consulta del menú: " . $conn->error);
    }
    
    $stmt->bind_param("ii", $offset, $perPage);
    
    if (!$stmt->execute()) {
        throw new Exception("Error al ejecutar consulta del menú: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    $itemsMenu = [];

    while ($row = $result->fetch_assoc()) {
        // Procesar imagen si existe
        if (!empty($row['imagen'])) {
            $row['imagen'] = base64_encode($row['imagen']);
        }
        
        // Formatear datos para consistencia
        $row['precio'] = number_format((float)$row['precio'], 2, '.', '');
        $row['disponible'] = (int)$row['disponible'];
        $row['destacado'] = (int)$row['destacado'];
        $row['tiempo_preparacion'] = isset($row['tiempo_preparacion']) ? (int)$row['tiempo_preparacion'] : null;
        
        $itemsMenu[] = $row;
    }

    echo json_encode([
        'success' => true,
        'data' => $itemsMenu,
        'pagination' => [
            'current_page' => $page,
            'total_pages' => $totalPages,
            'items_per_page' => $perPage,
            'total_items' => $totalItems
        ]
    ]);

} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

// Cerrar conexiones
if (isset($stmt)) $stmt->close();
if (isset($countResult)) $countResult->free();
$conn->close();
?>