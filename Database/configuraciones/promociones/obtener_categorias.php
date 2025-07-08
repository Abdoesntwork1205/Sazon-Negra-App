<?php
include '../../../Config/conexion.php';

header('Content-Type: application/json');

// Verificar conexión
if ($conn->connect_error) {
    echo json_encode(['error' => 'Error de conexión a la base de datos']);
    exit;
}

$searchTerm = isset($_GET['search']) ? $conn->real_escape_string(trim($_GET['search'])) : '';

try {
    $sql = "SELECT id, nombre FROM categorias WHERE activa = 1";
    
    if (!empty($searchTerm)) {
        $sql .= " AND nombre LIKE CONCAT('%', ?, '%')";
    }
    
    $sql .= " ORDER BY nombre ASC";
    
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Error en la preparación de la consulta: " . $conn->error);
    }
    
    if (!empty($searchTerm)) {
        $stmt->bind_param("s", $searchTerm);
    }
    
    if (!$stmt->execute()) {
        throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    $categories = [];
    
    while ($row = $result->fetch_assoc()) {
        $categories[] = [
            'id' => $row['id'],
            'nombre' => $row['nombre']
        ];
    }
    
    // Depuración: Ver datos que se enviarán
    error_log("Datos de categorías a enviar: " . print_r($categories, true));
    
    echo json_encode($categories);
    
} catch (Exception $e) {
    error_log("Error en obtener_categorias.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
} finally {
    if (isset($stmt)) $stmt->close();
    $conn->close();
}
?>