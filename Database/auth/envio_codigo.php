<?php
session_start();
header('Content-Type: application/json');
require_once '../../Config/conexion.php';
require '../../vendor/autoload.php';

$email = $_POST['email'] ?? '';

if (empty($email)) {
    echo json_encode(['success' => false, 'message' => 'El correo es requerido']);
    exit;
}

// Verificar si el correo existe
$consulta = "SELECT id FROM usuarios_clientes WHERE correo = ?";
$stmt = $conn->prepare($consulta);
$stmt->bind_param("s", $email);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'El correo no está registrado']);
    exit;
}

// Generar código y guardar en sesión
$code = str_pad(mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);
$_SESSION['codigo_recuperacion'] = $code;
$_SESSION['codigo_email'] = $email;
$_SESSION['codigo_expiracion'] = time() + 3600; // 1 hora de expiración

// Enviar el código por email
$mail = new PHPMailer\PHPMailer\PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'codigoderecuperacion2023@gmail.com';
    $mail->Password = 'qvsr rqni qsep hngz';
    $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    $mail->setFrom('codigoderecuperacion2023@gmail.com', 'Recuperación de Contraseña');
    $mail->addAddress($email);

    $mail->isHTML(true);
    $mail->Subject = 'Código de Recuperación';
    $mail->Body = "Tu código de recuperación es: <strong>$code</strong><br><br>Este código expirará en 1 hora.";

    $mail->send();
    echo json_encode(['success' => true, 'message' => 'Código enviado al correo electrónico']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error al enviar el correo: ' . $mail->ErrorInfo]);
}
?>