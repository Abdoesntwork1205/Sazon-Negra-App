<?php
session_start();
header('Content-Type: application/json');

try {
    // Obtener datos del POST
    $email = $_POST['email'] ?? '';
    $code = $_POST['code'] ?? '';

    // Validar datos de entrada
    if (empty($email) || empty($code)) {
        throw new Exception('Datos incompletos');
    }

    // Verificar existencia de código en sesión
    if (!isset($_SESSION['codigo_recuperacion'])) {
        throw new Exception('No hay código de recuperación pendiente');
    }

    // Validar coincidencia del código
    if ($_SESSION['codigo_recuperacion'] !== $code) {
        throw new Exception('Código incorrecto');
    }

    // Validar correo asociado
    if ($_SESSION['codigo_email'] !== $email) {
        throw new Exception('Correo no coincide con la solicitud');
    }

    // Validar expiración
    if (time() > $_SESSION['codigo_expiracion']) {
        throw new Exception('Código expirado');
    }

    // Marcar como verificado
    $_SESSION['codigo_verificado'] = true;
    
    echo json_encode([
        'success' => true,
        'message' => 'Código verificado correctamente'
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>