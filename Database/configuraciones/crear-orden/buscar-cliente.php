<?php
include '../../../Config/conexion.php';

header('Content-Type: application/json');

if (!isset($_GET['cedula'])) {
    echo json_encode([
        'success' => false,
        'error' => 'No se proporcionó cédula'
    ]);
    exit;
}

$cedula = $conn->real_escape_string($_GET['cedula']);

try {
    $sql = "SELECT nombre, apellido, telefono, correo, direccion 
            FROM usuarios_clientes 
            WHERE cedula = '$cedula' 
            LIMIT 1";
    
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        $client = $result->fetch_assoc();
        echo json_encode([
            'success' => true,
            'data' => $client
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Cliente no encontrado'
        ]);
    }
} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();
?>