<?php
header('Content-Type: application/json');
require_once '../../../Config/conexion.php';

$response = ['success' => false, 'message' => ''];

// Verificar método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Método no permitido';
    echo json_encode($response);
    exit;
}

// Obtener y validar datos
$userId = filter_input(INPUT_POST, 'user_id', FILTER_VALIDATE_INT);
$userType = filter_input(INPUT_POST, 'user_type', FILTER_SANITIZE_STRING);
$activate = filter_input(INPUT_POST, 'activate', FILTER_VALIDATE_BOOLEAN);

if (!$userId || $userId <= 0) {
    $response['message'] = 'ID de usuario inválido';
    echo json_encode($response);
    exit;
}

if ($userType !== 'personal') {
    $response['message'] = 'Solo se puede cambiar estado del personal';
    echo json_encode($response);
    exit;
}

try {
    // Determinar el nuevo estado
    $nuevoEstado = $activate ? 'activo' : 'inactivo';
    
    // Actualizar el estado en la base de datos
    $sql = "UPDATE usuarios_personal SET activo = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception('Error al preparar la consulta: ' . $conn->error);
    }

    $stmt->bind_param('si', $nuevoEstado, $userId);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        $response['success'] = true;
        $response['message'] = $activate ? 'Usuario activado correctamente' : 'Usuario desactivado correctamente';
        $response['new_status'] = $nuevoEstado;
    } else {
        // Verificar si el usuario existe
        $checkSql = "SELECT id FROM usuarios_personal WHERE id = ?";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bind_param('i', $userId);
        $checkStmt->execute();
        $checkStmt->store_result();
        
        if ($checkStmt->num_rows === 0) {
            throw new Exception('El usuario no existe');
        } else {
            throw new Exception('No se realizaron cambios (el estado ya era el solicitado)');
        }
    }

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
} finally {
    if (isset($conn)) $conn->close();
    echo json_encode($response);
}
?>