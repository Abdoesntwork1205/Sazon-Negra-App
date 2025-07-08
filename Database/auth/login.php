<?php
require_once '../../Config/conexion.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

$email = trim($_POST['email'] ?? '');
$clave = $_POST['clave'] ?? '';

// Validaciones
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Correo electrónico no válido']);
    exit;
}

if (empty($clave)) {
    echo json_encode(['success' => false, 'message' => 'La contraseña es obligatoria']);
    exit;
}

$foundIn = [];
$userData = [];

// Buscar en usuarios_clientes con todos los campos necesarios
$stmt = $conn->prepare("SELECT id,nombre, apellido, correo, clave, puntos_acumulados, telefono, Cedula, Nacionalidad, fecha_nacimiento, direccion, clave 
                       FROM usuarios_clientes 
                       WHERE correo = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows > 0) {
    $usuario = $resultado->fetch_assoc();
    if (password_verify($clave, $usuario['clave'])) {
        $foundIn[] = 'clientes';
        $userData['clientes'] = [
            'id' => $usuario['id'],
             'nombre' => $usuario['nombre'],
            'apellido' => $usuario['apellido'],
            'correo' => $usuario['correo'],
            'telefono' => $usuario['telefono'] ?? '',
            'Cedula' => $usuario['Cedula'] ?? '',
            'Nacionalidad' => $usuario['Nacionalidad'] ?? '',
            'direccion' => $usuario['direccion'] ?? '', // ← Nuevo campo
            'fecha_nacimiento' => $usuario['fecha_nacimiento'] ?? '', // ← Nuevo campo 
            'tipo' => 'clientes',
            'rol' => 'cliente'
        ];
    }
}
$stmt->close();

// Buscar en usuarios_personal
$stmt = $conn->prepare("SELECT id, nombre, correo, clave, rol FROM usuarios_personal WHERE correo = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows > 0) {
    $usuario = $resultado->fetch_assoc();
    if (password_verify($clave, $usuario['clave'])) {
        $foundIn[] = 'personal';
        $userData['personal'] = [
            'id' => $usuario['id'],
            'nombre' => $usuario['nombre'],
            'correo' => $usuario['correo'],
            'tipo' => 'personal',
            'rol' => $usuario['rol']
        ];
    }
}
$stmt->close();

// Verificar resultados
if (empty($foundIn)) {
    echo json_encode(['success' => false, 'message' => 'Credenciales incorrectas o usuario no registrado']);
    exit;
}

// Configurar parámetros de sesión segura
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1); // Solo si estás usando HTTPS
ini_set('session.use_strict_mode', 1);

// Preparar respuesta
if (count($foundIn) > 1) {
    echo json_encode([
        'success' => true,
        'message' => 'Seleccione tipo de acceso',
        'multiple' => true,
        'options' => [
            'clientes' => $userData['clientes'],
            'personal' => $userData['personal']
        ]
    ]);
} else {
    $tipo = $foundIn[0];
    
    session_start();
    session_regenerate_id(true);
    
    $_SESSION['userData'] = $userData[$tipo];
    $_SESSION['last_activity'] = time();
    $_SESSION['created'] = time();
    
    echo json_encode([
        'success' => true,
        'message' => 'Inicio de sesión exitoso',
        'user' => $userData[$tipo]
    ]);
}

$conn->close();
?>