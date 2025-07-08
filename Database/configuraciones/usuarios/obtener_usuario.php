<?php
require_once '../../../Config/conexion.php';

$response = ['success' => false, 'data' => []];

try {
    $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    $userType = isset($_GET['user_type']) ? $_GET['user_type'] : 'clientes';

    if ($userId <= 0) {
        throw new Exception('ID de usuario no válido');
    }

    if ($userType === 'clientes') {
        $sql = "SELECT * FROM usuarios_clientes WHERE id = ?";
    } else {
        $sql = "SELECT * FROM usuarios_personal WHERE id = ?";
    }

    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception('Usuario no encontrado');
    }

    $user = $result->fetch_assoc();
    
    // No devolver la contraseña por seguridad
    unset($user['clave']);
    
    $response['success'] = true;
    $response['data'] = $user;

} catch (Exception $e) {
    $response['error'] = $e->getMessage();
} finally {
    if (isset($conn)) $conn->close();
    header('Content-Type: application/json');
    echo json_encode($response);
}
?>