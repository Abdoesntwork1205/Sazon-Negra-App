<?php
header('Content-Type: application/json');
session_start();
include_once('../../../Config/conexion.php');
date_default_timezone_set('America/Caracas');

try {
    // Verificar sesión y permisos
    if (!isset($_SESSION['usuario_id'])) {
        throw new Exception('Usuario no autenticado. Por favor inicie sesión.');
    }

    $data = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    
    if (!isset($data['id']) || !is_numeric($data['id'])) {
        throw new Exception("ID de tasa no válido");
    }
    
    if (!isset($data['tasa']) || !is_numeric($data['tasa'])) {
        throw new Exception("Tasa no válida");
    }
    
    $id = (int)$data['id'];
    $tasa = (float)$data['tasa'];
    $fecha_actualizacion = date('Y-m-d H:i:s');
    $usuario_id = $_SESSION['usuario_id'];
    
    if ($tasa <= 0) {
        throw new Exception("La tasa debe ser mayor que cero");
    }
    
    // Verificar que la tasa existe antes de actualizar
    $queryCheck = "SELECT id FROM tasas WHERE id = ?";
    $stmtCheck = $conn->prepare($queryCheck);
    $stmtCheck->bind_param("i", $id);
    $stmtCheck->execute();
    $stmtCheck->store_result();
    
    if ($stmtCheck->num_rows === 0) {
        throw new Exception("La tasa especificada no existe");
    }
    
    // Actualizar la tasa
    $query = "UPDATE tasas SET 
              tasa = ?, 
              fecha_actualizacion = ?,
              usuario_id = ?
              WHERE id = ?";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("dsii", $tasa, $fecha_actualizacion, $usuario_id, $id);
    $stmt->execute();
    
    if ($stmt->affected_rows > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Tasa actualizada exitosamente',
            'fecha_actualizacion' => $fecha_actualizacion,
            'usuario_id' => $usuario_id
        ]);
    } else {
        throw new Exception("No se realizaron cambios en la tasa");
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Error al actualizar la tasa: ' . $e->getMessage(),
        'session_data' => $_SESSION ?? null
    ]);
}

$conn->close();
?>