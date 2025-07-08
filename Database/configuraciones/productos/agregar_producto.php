<?php
include '../../../Config/conexion.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Validar campos requeridos
    $required = ['titulo', 'categoria_id', 'precio', 'tiempo_preparacion'];
    $missing = [];
    
    foreach ($required as $field) {
        if (empty($_POST[$field])) {
            $missing[] = $field;
        }
    }

    if (!empty($missing)) {
        echo json_encode([
            'success' => false,
            'error' => 'Faltan campos requeridos: ' . implode(', ', $missing)
        ]);
        $conn->close();
        exit;
    }

    // Obtener y sanitizar datos
    $titulo = $conn->real_escape_string($_POST['titulo']);
    $categoria_id = (int)$_POST['categoria_id'];
    $descripcion = isset($_POST['descripcion']) ? $conn->real_escape_string($_POST['descripcion']) : '';
    $precio = floatval($_POST['precio']);
    $tiempo_preparacion = (int)$_POST['tiempo_preparacion'];
    $disponible = isset($_POST['disponible']) ? 1 : 0;
    $destacado = isset($_POST['destacado']) ? 1 : 0;

    // Verificar que la categoría exista
    $checkCat = $conn->prepare("SELECT id FROM categorias WHERE id = ?");
    $checkCat->bind_param("i", $categoria_id);
    $checkCat->execute();
    $checkCat->store_result();

    if ($checkCat->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'error' => 'La categoría seleccionada no existe'
        ]);
        $conn->close();
        exit;
    }

    // Manejo de imagen
    $imagen = null;
    if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
        $imagen = file_get_contents($_FILES['imagen']['tmp_name']);
    }

    try {
        $stmt = $conn->prepare("INSERT INTO menu (titulo, categoria_id, descripcion, precio, tiempo_preparacion, disponible, destacado, imagen) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        
        if ($imagen) {
            $stmt->bind_param("sisdiiib", $titulo, $categoria_id, $descripcion, $precio, $tiempo_preparacion, $disponible, $destacado, $imagen);
            $stmt->send_long_data(7, $imagen);
        } else {
            $null = null;
            $stmt->bind_param("sisdiiib", $titulo, $categoria_id, $descripcion, $precio, $tiempo_preparacion, $disponible, $destacado, $null);
        }
        
        $stmt->execute();

        echo json_encode(['success' => true]);

    } catch(Exception $e) {
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Método no permitido'
    ]);
}

$conn->close();
?>