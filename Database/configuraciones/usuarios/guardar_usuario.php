<?php
header('Content-Type: application/json');
require_once '../../../Config/conexion.php';

$response = ['success' => false, 'message' => ''];

try {
    // Validar datos de entrada
    $userData = $_POST;
    $userType = isset($userData['user_type']) ? $userData['user_type'] : 'clientes';
    $userId = isset($userData['user_id']) ? intval($userData['user_id']) : 0;

    // Validaciones comunes
    if (empty($userData['nombre']) || empty($userData['correo']) || empty($userData['telefono'])) {
        throw new Exception('Todos los campos obligatorios deben ser completados');
    }

    // Solo validar contraseña si es nuevo usuario o se está cambiando
    if ($userId === 0 || !empty($userData['clave'])) {
        if (empty($userData['clave']) || empty($userData['confirmar_clave'])) {
            throw new Exception('Ambos campos de contraseña son obligatorios');
        }

        if ($userData['clave'] !== $userData['confirmar_clave']) {
            throw new Exception('Las contraseñas no coinciden');
        }

        if (strlen($userData['clave']) < 8) {
            throw new Exception('La contraseña debe tener al menos 8 caracteres');
        }

        // Hash de la contraseña
        $hashedPassword = password_hash($userData['clave'], PASSWORD_DEFAULT);
    }

    if ($userType === 'clientes') {
        // Validaciones específicas para clientes
        if (empty($userData['apellido']) || empty($userData['nacionalidad']) || empty($userData['cedula'])) {
            throw new Exception('Apellido, nacionalidad y cédula son obligatorios para clientes');
        }

        // Verificar si el correo o cédula ya existen (excepto para actualización)
        $checkSql = "SELECT id FROM usuarios_clientes WHERE (correo = ? OR Cedula = ?)";
        $params = [$userData['correo'], $userData['cedula']];
        $types = 'ss';

        if ($userId > 0) {
            $checkSql .= " AND id != ?";
            $params[] = $userId;
            $types .= 'i';
        }

        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bind_param($types, ...$params);
        $checkStmt->execute();
        
        if ($checkStmt->get_result()->num_rows > 0) {
            throw new Exception('El correo o cédula ya están registrados');
        }

        // Preparar datos para clientes
        if ($userId > 0) {
            // Actualización de cliente
            $sql = "UPDATE usuarios_clientes SET 
                    nombre = ?, apellido = ?, nacionalidad = ?, Cedula = ?, telefono = ?, 
                    correo = ?, fecha_nacimiento = ?, direccion = ?";
            
            $params = [
                $userData['nombre'], $userData['apellido'], $userData['nacionalidad'], $userData['cedula'],
                $userData['telefono'], $userData['correo'], $userData['fecha_nacimiento'],
                $userData['direccion']
            ];
            $types = 'ssssssss';

            if (!empty($userData['clave'])) {
                $sql .= ", clave = ?";
                $params[] = $hashedPassword;
                $types .= 's';
            }

            $sql .= " WHERE id = ?";
            $params[] = $userId;
            $types .= 'i';
        } else {
            // Inserción de nuevo cliente
            $sql = "INSERT INTO usuarios_clientes 
                    (nombre, apellido, nacionalidad, Cedula, telefono, correo, fecha_nacimiento, direccion, clave, puntos_acumulados) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)";
            $params = [
                $userData['nombre'], $userData['apellido'], $userData['nacionalidad'], $userData['cedula'],
                $userData['telefono'], $userData['correo'], $userData['fecha_nacimiento'],
                $userData['direccion'], $hashedPassword
            ];
            $types = 'sssssssss';
        }
    } else {
        // Validaciones específicas para personal
        if (empty($userData['apellido']) || empty($userData['rol']) || empty($userData['nacionalidad']) || empty($userData['cedula'])) {
            throw new Exception('Apellido, rol, nacionalidad y cédula son obligatorios para personal');
        }

        // Verificar si el correo o cédula ya existen (excepto para actualización)
        $checkSql = "SELECT id FROM usuarios_personal WHERE (correo = ? OR cedula = ?)";
        $params = [$userData['correo'], $userData['cedula']];
        $types = 'ss';

        if ($userId > 0) {
            $checkSql .= " AND id != ?";
            $params[] = $userId;
            $types .= 'i';
        }

        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bind_param($types, ...$params);
        $checkStmt->execute();
        
        if ($checkStmt->get_result()->num_rows > 0) {
            throw new Exception('El correo o cédula ya están registrados');
        }

        // Preparar datos para personal
        $activo = isset($userData['activo']) ? 1 : 0;
        
        if ($userId > 0) {
            // Actualización de personal
            $sql = "UPDATE usuarios_personal SET 
                    nombre = ?, apellido = ?, nacionalidad = ?, cedula = ?, telefono = ?, correo = ?, 
                    rol = ?, fecha_contratacion = ?, activo = ?";
            
            $params = [
                $userData['nombre'], $userData['apellido'], $userData['nacionalidad'], $userData['cedula'],
                $userData['telefono'], $userData['correo'], $userData['rol'], 
                $userData['fecha_contratacion'], $activo
            ];
            $types = 'ssssssssi';

            if (!empty($userData['clave'])) {
                $sql .= ", clave = ?";
                $params[] = $hashedPassword;
                $types .= 's';
            }

            $sql .= " WHERE id = ?";
            $params[] = $userId;
            $types .= 'i';
        } else {
            // Inserción de nuevo personal
            $sql = "INSERT INTO usuarios_personal 
                    (nombre, apellido, nacionalidad, cedula, telefono, correo, rol, fecha_contratacion, clave, activo) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $params = [
                $userData['nombre'], $userData['apellido'], $userData['nacionalidad'], $userData['cedula'],
                $userData['telefono'], $userData['correo'], $userData['rol'], 
                $userData['fecha_contratacion'], $hashedPassword, $activo
            ];
            $types = 'sssssssssi';
        }
    }

    // Ejecutar consulta
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();

    if ($userId === 0) {
        $userId = $conn->insert_id;
    }

    $response['success'] = true;
    $response['message'] = $userId > 0 ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente';
    $response['user_id'] = $userId;

} catch (Exception $e) {
    $response['error'] = $e->getMessage();
} finally {
    if (isset($conn)) $conn->close();
    echo json_encode($response);
}
?>