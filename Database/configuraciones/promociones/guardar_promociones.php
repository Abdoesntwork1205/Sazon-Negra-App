<?php
header('Content-Type: application/json');
require_once('../../../Config/conexion.php');

$response = ['success' => false, 'message' => ''];

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['nombre'], $data['tipo'], $data['fecha_inicio'], $data['fecha_fin'], $data['elementos'], $data['aplicacion'])) {
        throw new Exception('Datos incompletos');
    }

    $nombre = trim($data['nombre']);
    $tipo = $data['tipo'];
    $valor = isset($data['valor']) ? floatval($data['valor']) : null;
    $fecha_inicio = $data['fecha_inicio'];
    $fecha_fin = $data['fecha_fin'];
    $elementos = $data['elementos'];
    $aplicacion = $data['aplicacion'];

    // Validar formato de fechas (Y-m-d H:i:s)
    if (!DateTime::createFromFormat('Y-m-d H:i:s', $fecha_inicio)) {
        throw new Exception('Formato de fecha de inicio inválido');
    }
    
    if (!DateTime::createFromFormat('Y-m-d H:i:s', $fecha_fin)) {
        throw new Exception('Formato de fecha de fin inválido');
    }

    // Validar que fecha fin sea posterior a fecha inicio
    $fechaInicioObj = new DateTime($fecha_inicio);
    $fechaFinObj = new DateTime($fecha_fin);
    
    if ($fechaFinObj <= $fechaInicioObj) {
        throw new Exception('La fecha de fin debe ser posterior al inicio');
    }

    // Resto de validaciones...
    if (empty($nombre)) throw new Exception('Nombre de promoción requerido');
    if (empty($elementos)) throw new Exception('Debe seleccionar al menos un elemento');

    $conn->begin_transaction();

    // Insertar promoción principal
    $stmt = $conn->prepare("INSERT INTO promociones (nombre, tipo, valor_descuento, fecha_inicio, fecha_fin) 
                               VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("ssdss", $nombre, $tipo, $valor, $fecha_inicio, $fecha_fin);
    $stmt->execute();
    $promocion_id = $conn->insert_id;
    $stmt->close();

    // Insertar elementos asociados
    $table = ($aplicacion === 'categorias') ? 'promociones_categorias' : 'promociones_menu';
    $field = ($aplicacion === 'categorias') ? 'categoria_id' : 'menu_id';
    
    $stmt = $conn->prepare("INSERT INTO $table (promocion_id, $field) VALUES (?, ?)");
    
    foreach ($elementos as $elemento) {
        $stmt->bind_param("ii", $promocion_id, $elemento['id']);
        $stmt->execute();
    }
    $stmt->close();

    $conn->commit();
    $response = [
        'success' => true,
        'message' => 'Promoción guardada correctamente',
        'promocion_id' => $promocion_id
    ];

} catch (Exception $e) {
    $conn->rollback();
    $response['message'] = $e->getMessage();
    error_log('Error en guardar_promocion: ' . $e->getMessage());
}

echo json_encode($response);
?>