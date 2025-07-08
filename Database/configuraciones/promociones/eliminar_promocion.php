<?php
header('Content-Type: application/json');
require_once('../../../Config/conexion.php');

$response = ['success' => false, 'message' => ''];

try {
    if (!isset($_POST['id'])) {
        throw new Exception('ID de promoción no especificado');
    }

    $promocion_id = intval($_POST['id']);

    // Verificar conexión
    if (!$conn || $conn->connect_error) {
        throw new Exception('Error de conexión a la base de datos');
    }

    $conn->begin_transaction();

    // Primero eliminar las relaciones en promociones_categorias
    $stmt = $conn->prepare("DELETE FROM promociones_categorias WHERE promocion_id = ?");
    $stmt->bind_param("i", $promocion_id);
    $stmt->execute();
    $stmt->close();

    // Luego eliminar las relaciones en promociones_menu
    $stmt = $conn->prepare("DELETE FROM promociones_menu WHERE promocion_id = ?");
    $stmt->bind_param("i", $promocion_id);
    $stmt->execute();
    $stmt->close();

    // Finalmente eliminar la promoción principal
    $stmt = $conn->prepare("DELETE FROM promociones WHERE id = ?");
    $stmt->bind_param("i", $promocion_id);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        $conn->commit();
        $response = [
            'success' => true,
            'message' => 'Promoción eliminada correctamente'
        ];
    } else {
        throw new Exception('No se encontró la promoción para eliminar');
    }

    $stmt->close();
} catch (Exception $e) {
    $conn->rollback();
    $response['message'] = 'Error: ' . $e->getMessage();
    error_log('Error en eliminar_promocion: ' . $e->getMessage());
}

if (isset($conn) && $conn instanceof mysqli) {
    $conn->close();
}

echo json_encode($response);
?>