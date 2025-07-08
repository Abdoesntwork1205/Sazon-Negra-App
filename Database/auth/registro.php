<?php
// Incluir conexión a la base de datos
require_once '../../Config/conexion.php';

// Configurar cabeceras para JSON
header('Content-Type: application/json');

// Verificar si la solicitud es POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// Obtener y validar datos del formulario
$nombre = trim($_POST['nombre'] ?? '');
$apellido = trim($_POST['apellido'] ?? '');
$nacionalidad = trim($_POST['nacionalidad'] ?? '');
$cedula = trim($_POST['cedula'] ?? '');
$telefono = trim($_POST['telefono'] ?? '');
$nacimiento = $_POST['nacimiento'] ?? '';
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$direccion = trim($_POST['direccion'] ?? '');

// Validaciones básicas
$errors = [];

if (empty($nombre)) $errors[] = 'El nombre es obligatorio';
if (empty($apellido)) $errors[] = 'El apellido es obligatorio';
if (empty($nacionalidad)) $errors[] = 'La nacionalidad es obligatoria';
if (empty($cedula)) $errors[] = 'La cédula es obligatoria';
if (empty($telefono)) $errors[] = 'El teléfono es obligatorio';
if (empty($nacimiento)) $errors[] = 'La fecha de nacimiento es obligatoria';
if (empty($email)) $errors[] = 'El correo electrónico es obligatorio';
if (empty($password)) $errors[] = 'La contraseña es obligatoria';
if (empty($direccion)) $errors[] = 'La dirección es obligatoria';

// Validaciones específicas
if (!empty($nombre) && (strlen($nombre) < 2 || strlen($nombre) > 50)) $errors[] = 'El nombre debe tener entre 2 y 50 caracteres';
if (!empty($apellido) && (strlen($apellido) < 2 || strlen($apellido) > 50)) $errors[] = 'El apellido debe tener entre 2 y 50 caracteres';
if (!empty($nacionalidad) && !in_array($nacionalidad, ['V', 'E'])) $errors[] = 'Nacionalidad no válida';
if (!empty($cedula) && !preg_match('/^[0-9]{6,8}$/', $cedula)) $errors[] = 'Cédula debe tener entre 6 y 8 dígitos';
if (!empty($telefono) && !preg_match('/^(0412|0414|0416|0424)[0-9]{7}$/', $telefono)) $errors[] = 'Teléfono debe comenzar con 0412, 0414, 0416 o 0424 y tener 11 dígitos';
if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Correo electrónico no válido';
if (!empty($password) && strlen($password) < 8) $errors[] = 'La contraseña debe tener al menos 8 caracteres';
if (!empty($password) && !preg_match('/[A-Z]/', $password)) $errors[] = 'La contraseña debe contener al menos una mayúscula';
if (!empty($password) && !preg_match('/[a-z]/', $password)) $errors[] = 'La contraseña debe contener al menos una minúscula';
if (!empty($password) && !preg_match('/[0-9]/', $password)) $errors[] = 'La contraseña debe contener al menos un número';

// Validar fecha de nacimiento (mínimo 16 años)
if (!empty($nacimiento)) {
    $fechaNac = new DateTime($nacimiento);
    $hoy = new DateTime();
    $edad = $hoy->diff($fechaNac)->y;
    
    if ($edad < 16) $errors[] = 'Debes tener al menos 16 años para registrarte';
}

if (!empty($errors)) {
    echo json_encode(['success' => false, 'message' => implode('<br>', $errors)]);
    exit;
}

// Verificar si el correo ya existe
$consulta = "SELECT id FROM usuarios_clientes WHERE correo = ?";
$stmt = $conn->prepare($consulta);
$stmt->bind_param("s", $email);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'El correo electrónico ya está registrado']);
    exit;
}

// Verificar si la cédula ya existe
$consulta = "SELECT id FROM usuarios_clientes WHERE nacionalidad = ? AND cedula = ?";
$stmt = $conn->prepare($consulta);
$stmt->bind_param("ss", $nacionalidad, $cedula);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Esta cédula ya está registrada']);
    exit;
}

// Hashear la contraseña
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Insertar nuevo usuario con todos los campos
$consulta = "INSERT INTO usuarios_clientes (
                nombre, 
                apellido, 
                nacionalidad,
                cedula,
                telefono, 
                fecha_nacimiento, 
                correo, 
                clave, 
                fecha_registro,
                direccion,
                puntos_acumulados
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, 0)";

$stmt = $conn->prepare($consulta);
$stmt->bind_param(
    "sssssssss", 
    $nombre, 
    $apellido, 
    $nacionalidad,
    $cedula,
    $telefono, 
    $nacimiento, 
    $email, 
    $hashedPassword,
    $direccion
);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Registro exitoso. Redirigiendo...']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al registrar el usuario: ' . $conn->error]);
}

$stmt->close();
$conn->close();
?>