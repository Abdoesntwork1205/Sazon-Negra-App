<?php
include '../../../Config/conexion.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    try {
        // Validar campos requeridos
        $required = ['id', 'titulo', 'categoria_id', 'precio', 'tiempo_preparacion'];
        foreach ($required as $field) {
            if (empty($_POST[$field])) {
                throw new Exception("El campo $field es requerido");
            }
        }

        // Obtener y sanitizar datos
        $id = (int)$_POST['id'];
        $titulo = $conn->real_escape_string($_POST['titulo']);
        $categoria_id = (int)$_POST['categoria_id'];
        $descripcion = isset($_POST['descripcion']) ? $conn->real_escape_string($_POST['descripcion']) : '';
        $precio = (float)$_POST['precio'];
        $tiempo_preparacion = (int)$_POST['tiempo_preparacion'];
        $disponible = isset($_POST['disponible']) ? 1 : 0;
        $destacado = isset($_POST['destacado']) ? 1 : 0;

        // Verificar que la categoría exista
        $checkCat = $conn->prepare("SELECT id FROM categorias WHERE id = ?");
        $checkCat->bind_param("i", $categoria_id);
        $checkCat->execute();
        $checkCat->store_result();

        if ($checkCat->num_rows === 0) {
            throw new Exception("La categoría seleccionada no existe");
        }

        // Manejo de imagen
        $imagen = null;
        $updateImage = false;
        if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
            $imagen = file_get_contents($_FILES['imagen']['tmp_name']);
            $updateImage = true;
        }

        // Preparar consulta SQL según si hay imagen o no
        if ($updateImage) {
            $sql = "UPDATE menu SET 
                    titulo = ?, 
                    categoria_id = ?, 
                    descripcion = ?, 
                    precio = ?, 
                    tiempo_preparacion = ?, 
                    disponible = ?, 
                    destacado = ?, 
                    imagen = ? 
                    WHERE id = ?";
            
            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                throw new Exception("Error al preparar consulta: " . $conn->error);
            }
            
            $stmt->bind_param("sisdiiibi", 
                $titulo, 
                $categoria_id, 
                $descripcion, 
                $precio, 
                $tiempo_preparacion, 
                $disponible, 
                $destacado, 
                $imagen, 
                $id);
            
            $stmt->send_long_data(7, $imagen);
        } else {
            $sql = "UPDATE menu SET 
                    titulo = ?, 
                    categoria_id = ?, 
                    descripcion = ?, 
                    precio = ?, 
                    tiempo_preparacion = ?, 
                    disponible = ?, 
                    destacado = ? 
                    WHERE id = ?";
            
            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                throw new Exception("Error al preparar consulta: " . $conn->error);
            }
            
            $stmt->bind_param("sisdiiii", 
                $titulo, 
                $categoria_id, 
                $descripcion, 
                $precio, 
                $tiempo_preparacion, 
                $disponible, 
                $destacado, 
                $id);
        }

        // Ejecutar consulta
        if (!$stmt->execute()) {
            throw new Exception("Error al actualizar producto: " . $stmt->error);
        }

        echo json_encode([
            'success' => true,
            'message' => 'Producto actualizado correctamente'
        ]);

    } catch(Exception $e) {
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Método no permitido. Se esperaba POST'
    ]);
}

// Cerrar conexiones
if (isset($checkCat)) $checkCat->close();
if (isset($stmt)) $stmt->close();
$conn->close();
?>