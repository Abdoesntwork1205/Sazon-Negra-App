<?php
header('Content-Type: application/json');
require_once('../../../Config/conexion.php');

$response = ['success' => false, 'message' => ''];

try {
    if (!isset($_GET['id'])) {
        throw new Exception('ID de promoción no especificado');
    }

    $promocion_id = intval($_GET['id']);

    // Verificar conexión
    if (!$conn || $conn->connect_error) {
        throw new Exception('Error de conexión a la base de datos');
    }

    // Obtener información básica de la promoción
    $stmt = $conn->prepare("SELECT * FROM promociones WHERE id = ?");
    $stmt->bind_param("i", $promocion_id);
    $stmt->execute();
    $promocion = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$promocion) {
        throw new Exception('Promoción no encontrada');
    }

    // Determinar tipo de aplicación
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM promociones_categorias WHERE promocion_id = ?");
    $stmt->bind_param("i", $promocion_id);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    $aplicacion = ($result['count'] > 0) ? 'categorias' : 'productos';
    $promocion['aplicacion'] = $aplicacion;

    // Obtener elementos asociados
    if ($aplicacion === 'categorias') {
        $query = "SELECT c.id, c.nombre 
                FROM promociones_categorias pc
                JOIN categorias c ON pc.categoria_id = c.id
                WHERE pc.promocion_id = ?";
    } else {
        $query = "SELECT m.id, m.titulo as nombre, m.precio
                FROM promociones_menu pm
                JOIN menu m ON pm.menu_id = m.id
                WHERE pm.promocion_id = ?";
    }

    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $promocion_id);
    $stmt->execute();
    $elementos = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    $promocion['elementos'] = $elementos;

    $response = [
        'success' => true,
        'data' => $promocion
    ];

} catch (Exception $e) {
    $response['message'] = 'Error: ' . $e->getMessage();
    error_log('Error en obtener_detalle_promocion: ' . $e->getMessage());
}

if (isset($conn) && $conn instanceof mysqli) {
    $conn->close();
}

echo json_encode($response);
?>