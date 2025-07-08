<?php
header('Content-Type: application/json');

try {
    include_once('../../../Config/conexion.php');
    
    // Consulta para obtener la última tasa USD->VES con su ID
    $query = "SELECT id, tasa, fecha_actualizacion 
              FROM tasas
              WHERE moneda_origen = 'USD' AND moneda_destino = 'VES'
              ORDER BY fecha_actualizacion DESC 
              LIMIT 1";
    
    $result = $conn->query($query);
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $tasaUsd = (float)$row['tasa'];
        $tasaId = (int)$row['id'];
        $lastUpdated = $row['fecha_actualizacion'];
    } else {
        // Valores por defecto si no hay registros
        $tasaUsd = 36.0;
        $tasaId = 0; // O algún valor que indique "tasa por defecto"
        $lastUpdated = date('Y-m-d H:i:s');
    }
    
    echo json_encode([
        'success' => true,
        'USD' => 1.0,
        'VES' => $tasaUsd,
        'tasa_id' => $tasaId, // Incluimos el ID de la tasa
        'last_updated' => $lastUpdated
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'message' => 'Error al obtener tasas de cambio'
    ]);
}
?>