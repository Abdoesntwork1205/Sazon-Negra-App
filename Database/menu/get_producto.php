<?php
include '../../Config/conexion.php';

if (isset($_GET['id'])) {
    $productId = intval($_GET['id']);
    
    $query = "SELECT * FROM menu WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $productId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $product = $result->fetch_assoc();
        echo json_encode([
            'success' => true,
            'data' => $product
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Producto no encontrado'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'ID de producto no proporcionado'
    ]);
}

$conn->close();
?>