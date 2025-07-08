<?php
session_start();
header('Content-Type: application/json');
require_once '../../Config/conexion.php';

$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit;
}

// Verificar que el código fue verificado previamente
if (!isset($_SESSION['codigo_verificado']) || $_SESSION['codigo_verificado'] !== true || 
    $_SESSION['codigo_email'] !== $email) {
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

// Validar fortaleza de la contraseña
if (strlen($password) < 8 || !preg_match('/[A-Z]/', $password) || 
    !preg_match('/[a-z]/', $password) || !preg_match('/[0-9]/', $password)) {
    echo json_encode(['success' => false, 'message' => 'La contraseña no cumple los requisitos']);
    exit;
}

// Hashear y actualizar contraseña
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);
$consulta = "UPDATE usuarios_clientes SET clave = ? WHERE correo = ?";
$stmt = $conn->prepare($consulta);
$stmt->bind_param("ss", $hashedPassword, $email);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    // Limpiar sesión después de éxito
    unset($_SESSION['codigo_recuperacion']);
    unset($_SESSION['codigo_email']);
    unset($_SESSION['codigo_expiracion']);
    unset($_SESSION['codigo_verificado']);
    
    echo json_encode(['success' => true, 'message' => 'Contraseña actualizada con éxito']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al actualizar la contraseña']);
}
?>