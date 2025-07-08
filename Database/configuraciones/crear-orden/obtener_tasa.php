<?php
header('Content-Type: application/json');
require_once '../../../Config/conexion.php';

$response = ['success' => false, 'error' => '', 'rate' => 0];

try {
    // Consulta para obtener la última tasa de cambio USD->VES
    $query = "SELECT tasa FROM tasas 
              WHERE moneda_origen = 'USD' AND moneda_destino = 'VES'
              ORDER BY fecha_actualizacion DESC LIMIT 1";
    
    $result = $conn->query($query);
    
    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $response['success'] = true;
        $response['rate'] = (float)$row['tasa'];
    } else {
        // Si no hay tasas en la base de datos, usar un valor por defecto
        $response['success'] = true;
        $response['rate'] = 36.50; // Valor por defecto
        $response['warning'] = 'Se está usando tasa por defecto';
    }
    
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
    // En caso de error, también devolver un valor por defecto
    $response['rate'] = 36.50;
} finally {
    if ($conn) $conn->close();
}

echo json_encode($response);
?>