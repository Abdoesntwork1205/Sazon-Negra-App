<?php
header('Content-Type: application/json');
session_start();
date_default_timezone_set('America/Caracas');

try {
    include_once('../../../Config/conexion.php');
    
    // Verificar sesión y permisos
    if (!isset($_SESSION['usuario_id'])) {
        throw new Exception('Usuario no autenticado. Por favor inicie sesión.');
    }

    // Obtener datos de entrada (compatible con JSON y POST normal)
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        parse_str($input, $postData);
        $data = $_POST ?: $postData;
    }
    
    // Validar campos obligatorios
    $errors = [];
    if (empty($data['moneda_origen'])) {
        $errors[] = 'El campo moneda_origen es requerido';
    }
    if (empty($data['moneda_destino'])) {
        $errors[] = 'El campo moneda_destino es requerido';
    }
    if (!isset($data['tasa']) || $data['tasa'] === '') {
        $errors[] = 'El campo tasa es requerido';
    } elseif (!is_numeric($data['tasa'])) {
        $errors[] = 'La tasa debe ser un valor numérico';
    }
    
    if (!empty($errors)) {
        throw new Exception(implode(', ', $errors));
    }
    
    // Asignar valores
    $moneda_origen = strtoupper($data['moneda_origen']);
    $moneda_destino = strtoupper($data['moneda_destino']);
    $tasa = (float) $data['tasa'];
    $usuario_id = $_SESSION['usuario_id'];
    $fecha_actualizacion = date('Y-m-d H:i:s');
    
    // Validar que la tasa sea positiva
    if ($tasa <= 0) {
        throw new Exception('La tasa debe ser un valor positivo');
    }
    
    // Verificar si ya existe una tasa para este par de monedas
    $queryCheck = "SELECT id FROM tasas WHERE moneda_origen = ? AND moneda_destino = ?";
    $stmtCheck = $conn->prepare($queryCheck);
    $stmtCheck->bind_param("ss", $moneda_origen, $moneda_destino);
    $stmtCheck->execute();
    $stmtCheck->store_result();
    
    if ($stmtCheck->num_rows > 0) {
        throw new Exception('Ya existe una tasa para este par de monedas');
    }
    
    // Insertar en la base de datos
    $query = "INSERT INTO tasas 
              (moneda_origen, moneda_destino, tasa, usuario_id, fecha_actualizacion) 
              VALUES (?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("ssdis", 
        $moneda_origen, 
        $moneda_destino, 
        $tasa, 
        $usuario_id,
        $fecha_actualizacion
    );
    
    if (!$stmt->execute()) {
        throw new Exception('Error al ejecutar la consulta: ' . $stmt->error);
    }
    
    if ($stmt->affected_rows > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Tasa creada exitosamente',
            'id' => $stmt->insert_id,
            'fecha_actualizacion' => $fecha_actualizacion,
            'usuario_id' => $usuario_id
        ]);
    } else {
        throw new Exception('No se pudo crear la tasa');
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Error al crear la tasa: ' . $e->getMessage(),
        'received_data' => $data ?? null,
        'session_data' => $_SESSION ?? null
    ]);
}
?>