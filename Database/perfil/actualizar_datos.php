<?php
session_start();
require_once '../../Config/conexion.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user'])) {
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$userId = $_SESSION['user']['id'];

// Validaciones básicas
$requiredFields = ['nombre', 'apellido', 'email'];
foreach ($requiredFields as $field) {
    if (empty($data[$field])) {
        echo json_encode(['success' => false, 'message' => "El campo $field es obligatorio"]);
        exit;
    }
}

if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Formato de correo no válido']);
    exit;
}

try {
    $conn->begin_transaction();
    
    // Verificar si el email ya existe (solo si cambió)
    if ($data['email'] !== $_SESSION['user']['correo']) {
        $stmt = $conn->prepare("SELECT id FROM usuarios_clientes WHERE correo = ? AND id != ?");
        $stmt->bind_param('si', $data['email'], $userId);
        $stmt->execute();
        
        if ($stmt->get_result()->num_rows > 0) {
            throw new Exception('El correo electrónico ya está registrado');
        }
    }
    
    // Actualizar datos principales
    $updateData = [
        'nombre' => htmlspecialchars(trim($data['nombre'])),
        'apellido' => htmlspecialchars(trim($data['apellido'])),
        'correo' => htmlspecialchars(trim($data['email'])),
        'Cedula' => htmlspecialchars(trim($data['cedula'])), // Nuevo nombre del campo
        'Nacionalidad' => htmlspecialchars(trim($data['nacionalidad'])), // Nuevo nombre del campo
        'telefono' => !empty($data['telefono']) ? htmlspecialchars(trim($data['telefono'])) : null,
        'direccion' => !empty($data['direccion']) ? htmlspecialchars(trim($data['direccion'])) : null,
        'fecha_nacimiento' => !empty($data['fecha_nacimiento']) ? $data['fecha_nacimiento'] : null
    ];
    
    $stmt = $conn->prepare("
        UPDATE usuarios_clientes 
        SET nombre = ?, apellido = ?, correo = ?, telefono = ?, 
            direccion = ?, fecha_nacimiento = ?, Nacionalidad = ?
        WHERE id = ?
    ");
    
    $stmt->bind_param(
        'sssssssi',
        $updateData['nombre'],
        $updateData['apellido'],
        $updateData['correo'],
        $updateData['telefono'],
        $updateData['direccion'],
        $updateData['fecha_nacimiento'],
        $updateData['Nacionalidad'],
        $userId
    );
    
    $stmt->execute();
    
    // Actualizar contraseña si se proporcionó
    if (!empty($data['clave_actual']) && !empty($data['clave_nueva'])) {
        $stmt = $conn->prepare("SELECT clave FROM usuarios_clientes WHERE id = ?");
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        
        if (!password_verify($data['clave_actual'], $user['clave'])) {
            throw new Exception('La contraseña actual es incorrecta');
        }
        
        $newPasswordHash = password_hash($data['clave_nueva'], PASSWORD_DEFAULT);
        $stmt = $conn->prepare("UPDATE usuarios_clientes SET clave = ? WHERE id = ?");
        $stmt->bind_param('si', $newPasswordHash, $userId);
        $stmt->execute();
    }
    
    $conn->commit();
    
    // Actualizar sesión
    $_SESSION['user'] = array_merge($_SESSION['user'], $updateData);
    
    echo json_encode([
        'success' => true,
        'message' => 'Perfil actualizado correctamente',
        'userData' => $updateData
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>