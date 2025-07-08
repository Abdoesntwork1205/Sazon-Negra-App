<?php
header('Content-Type: application/json');
include_once('../../../Config/conexion.php');

try {
    if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
        throw new Exception("ID de tasa no válido");
    }
    
    $id = (int)$_GET['id'];
    $query = "SELECT * FROM tasas WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        throw new Exception("Tasa no encontrada");
    }
    
    $rate = $result->fetch_assoc();
    
    echo json_encode([
        'success' => true,
        'data' => $rate
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>