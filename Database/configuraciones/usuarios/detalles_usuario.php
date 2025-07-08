<?php
require_once '../../../Config/conexion.php';

$userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
$userType = isset($_GET['user_type']) ? $_GET['user_type'] : 'clientes';

try {
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
    
    // Obtener iniciales para el avatar
    $iniciales = '';
    if (!empty($user['nombre'])) {
        $iniciales .= strtoupper(substr($user['nombre'], 0, 1));
        if (!empty($user['apellido'])) {
            $iniciales .= strtoupper(substr($user['apellido'], 0, 1));
        } else {
            // Si no hay apellido, tomar segunda letra del nombre si existe
            if (strlen($user['nombre']) > 1) {
                $iniciales .= strtoupper(substr($user['nombre'], 1, 1));
            }
        }
    }

    // Generar HTML de detalles con clases CSS mejoradas
    echo '<style>
        .user-details-container {
            font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #333;
            max-width: 1200px;
            margin: 20px auto;
            padding: 20px;
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .user-header {
            border-bottom: 2px solidrgb(22, 211, 97);
            padding-bottom: 15px;
            margin-bottom: 25px;
            display: flex;
            align-items: center;
        }
        
        .user-avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background-color:rgb(52, 212, 31);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            margin-right: 20px;
            font-weight: bold;
        }
        
        .user-title {
            font-size: 24px;
            font-weight: 600;
            color: #503e2c;
            margin: 0;
        }
        
        .user-subtitle {
            color: #7f8c8d;
            font-size: 16px;
            margin-top: 5px;
        }
        
        .detail-section {
            margin-bottom: 30px;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #503e2c;
            border-left: 4px solidrgb(22, 155, 68);
            padding-left: 10px;
            margin-bottom: 15px;
        }
        
        .detail-item {
            display: flex;
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid #ecf0f1;
        }
        
        .detail-label {
            font-weight: 600;
            color: #7f8c8d;
            min-width: 180px;
        }
        
        .detail-value {
            color: #5e4834;
        }
        
        .badge {
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .bg-success {
            background-color: #2ecc71 !important;
        }
        
        .bg-danger {
            background-color: #e74c3c !important;
        }
        
        .fas {
            margin-right: 8px;
            color:rgb(17, 138, 85);
        }
        
        @media (max-width: 768px) {
            .detail-item {
                flex-direction: column;
            }
            
            .detail-label {
                margin-bottom: 5px;
            }
        }
    </style>';

    echo '<div class="user-details-container">';
    
    // Encabezado con avatar
    echo '<div class="user-header">';
    echo '<div class="user-avatar">';
    echo $iniciales ?: '<i class="fas ' . ($userType === 'clientes' ? 'fa-user' : 'fa-user-tie') . '"></i>';
    echo '</div>';
    echo '<div>';
    echo '<h1 class="user-title">' . htmlspecialchars($user['nombre'] . (!empty($user['apellido']) ? ' ' . $user['apellido'] : '')) . '</h1>';
    echo '<p class="user-subtitle">' . ($userType === 'clientes' ? 'Cliente' : ucfirst($user['rol'])) . '</p>';
    echo '</div>';
    echo '</div>';
    
    echo '<div class="row">';
    
    if ($userType === 'clientes') {
        echo '<div class="col-md-6">';
        echo '<div class="detail-section">';
        echo '<h3 class="section-title"><i class="fas fa-id-card"></i> Información Básica</h3>';
        echo '<div class="detail-item"><span class="detail-label">Nombre completo:</span><span class="detail-value">' . htmlspecialchars($user['nombre']) . (!empty($user['apellido']) ? ' ' . htmlspecialchars($user['apellido']) : '') . '</span></div>';
        echo '<div class="detail-item"><span class="detail-label">Cédula:</span><span class="detail-value">' . 
             (!empty($user['nacionalidad']) ? htmlspecialchars($user['nacionalidad']) : 'V') . '-' . 
             (!empty($user['cedula']) ? htmlspecialchars($user['cedula']) : 'No registrada') . '</span></div>';
        echo '<div class="detail-item"><span class="detail-label">Fecha de registro:</span><span class="detail-value">' . (!empty($user['fecha_registro']) ? date('d/m/Y', strtotime($user['fecha_registro'])) : 'No registrada') . '</span></div>';
        echo '</div>';
        echo '</div>';
        
        echo '<div class="col-md-6">';
        echo '<div class="detail-section">';
        echo '<h3 class="section-title"><i class="fas fa-address-book"></i> Contacto</h3>';
        echo '<div class="detail-item"><span class="detail-label">Teléfono:</span><span class="detail-value">' . (!empty($user['telefono']) ? htmlspecialchars($user['telefono']) : 'No registrado') . '</span></div>';
        echo '<div class="detail-item"><span class="detail-label">Correo:</span><span class="detail-value">' . (!empty($user['correo']) ? htmlspecialchars($user['correo']) : 'No registrado') . '</span></div>';
        echo '<div class="detail-item"><span class="detail-label">Dirección:</span><span class="detail-value">' . (!empty($user['direccion']) ? htmlspecialchars($user['direccion']) : 'No registrada') . '</span></div>';
        echo '</div>';
        echo '</div>';
        
        echo '<div class="col-md-6">';
        echo '<div class="detail-section">';
        echo '<h3 class="section-title"><i class="fas fa-birthday-cake"></i> Datos Adicionales</h3>';
        echo '<div class="detail-item"><span class="detail-label">Fecha de nacimiento:</span><span class="detail-value">' . (!empty($user['fecha_nacimiento']) ? date('d/m/Y', strtotime($user['fecha_nacimiento'])) : 'No registrada') . '</span></div>';
        echo '<div class="detail-item"><span class="detail-label">Puntos acumulados:</span><span class="detail-value">' . (isset($user['puntos_acumulados']) ? $user['puntos_acumulados'] : '0') . '</span></div>';
        echo '</div>';
        echo '</div>';
    } else {
        echo '<div class="col-md-6">';
        echo '<div class="detail-section">';
        echo '<h3 class="section-title"><i class="fas fa-id-card"></i> Información Básica</h3>';
        echo '<div class="detail-item"><span class="detail-label">Nombre completo:</span><span class="detail-value">' . htmlspecialchars($user['nombre']) . (!empty($user['apellido']) ? ' ' . htmlspecialchars($user['apellido']) : '') . '</span></div>';
        echo '<div class="detail-item"><span class="detail-label">Cédula:</span><span class="detail-value">' . 
             (!empty($user['nacionalidad']) ? htmlspecialchars($user['nacionalidad']) : 'V') . '-' . 
             (!empty($user['cedula']) ? htmlspecialchars($user['cedula']) : 'No registrada') . '</span></div>';
        echo '<div class="detail-item"><span class="detail-label">Rol:</span><span class="detail-value">' . ucfirst(htmlspecialchars($user['rol'])) . '</span></div>';
        echo '<div class="detail-item"><span class="detail-label">Estado:</span><span class="detail-value">' . ($user['activo'] ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-danger">Inactivo</span>') . '</span></div>';
        echo '</div>';
        echo '</div>';
        
        echo '<div class="col-md-6">';
        echo '<div class="detail-section">';
        echo '<h3 class="section-title"><i class="fas fa-address-book"></i> Contacto</h3>';
        echo '<div class="detail-item"><span class="detail-label">Teléfono:</span><span class="detail-value">' . (!empty($user['telefono']) ? htmlspecialchars($user['telefono']) : 'No registrado') . '</span></div>';
        echo '<div class="detail-item"><span class="detail-label">Correo:</span><span class="detail-value">' . (!empty($user['correo']) ? htmlspecialchars($user['correo']) : 'No registrado') . '</span></div>';
        echo '<div class="detail-item"><span class="detail-label">Fecha contratación:</span><span class="detail-value">' . (!empty($user['fecha_contratacion']) ? date('d/m/Y', strtotime($user['fecha_contratacion'])) : 'No registrada') . '</span></div>';
        echo '</div>';
        echo '</div>';
    }
    
    echo '</div>'; // cierre row
    echo '</div>'; // cierre container

} catch (Exception $e) {
    echo '<div class="alert alert-danger">' . htmlspecialchars($e->getMessage()) . '</div>';
} finally {
    if (isset($conn)) $conn->close();
}
?>