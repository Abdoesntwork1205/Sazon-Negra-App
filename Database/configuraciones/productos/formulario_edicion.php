<?php
include '../../../Config/conexion.php';

$id = (int)($_GET['id'] ?? 0);

try {
    $sql = "SELECT p.*, c.nombre as categoria_nombre 
            FROM menu p 
            LEFT JOIN categorias c ON p.categoria_id = c.id 
            WHERE p.id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $producto = $result->fetch_assoc();

    if (!$producto) {
        throw new Exception("Producto no encontrado");
    }

} catch(Exception $e) {
    echo '<div class="alert alert-danger">'.$e->getMessage().'</div>';
    $conn->close();
    exit;
}
?>

<div class="modal-header bg-primary text-white">
    <h5 class="modal-title">Editar Producto</h5>
    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
</div>
<div class="modal-body">
    <form id="editProductForm">
        <input type="hidden" name="id" value="<?= htmlspecialchars($producto['id']) ?>">
        
        <div class="mb-3">
            <label class="form-label">Título</label>
            <input type="text" class="form-control" name="titulo" value="<?= htmlspecialchars($producto['titulo']) ?>" required>
        </div>
        
        <div class="mb-3">
            <label class="form-label">Categoría</label>
            <select class="form-control select2-modal" name="categoria_id" required>
                <option value="">Seleccionar categoría</option>
                <?php
                $catSql = "SELECT id, nombre FROM categorias WHERE activa = 1 ORDER BY nombre";
                $catResult = $conn->query($catSql);
                while ($cat = $catResult->fetch_assoc()) {
                    $selected = $cat['id'] == $producto['categoria_id'] ? 'selected' : '';
                    echo "<option value='{$cat['id']}' $selected>{$cat['nombre']}</option>";
                }
                ?>
            </select>
        </div>
        
        <div class="mb-3">
            <label class="form-label">Imagen</label>
            <?php if (!empty($producto['imagen'])): ?>
                <img id="imagePreview" src="data:image/jpeg;base64,<?= base64_encode($producto['imagen']) ?>" class="img-thumbnail mb-2" style="max-height: 100px; display: block;">
            <?php else: ?>
                <img id="imagePreview" src="#" class="img-thumbnail mb-2" style="max-height: 100px; display: none;">
            <?php endif; ?>
            <input type="file" class="form-control" id="editProductImage" name="imagen" accept="image/*">
        </div>
        
        <div class="mb-3">
            <label class="form-label">Descripción</label>
            <textarea class="form-control" name="descripcion" rows="3"><?= htmlspecialchars($producto['descripcion'] ?? '') ?></textarea>
        </div>
        
        <div class="row">
            <div class="col-md-6 mb-3">
                <label class="form-label">Precio</label>
                <div class="input-group">
                    <span class="input-group-text">$</span>
                    <input type="number" step="0.01" class="form-control" name="precio" value="<?= htmlspecialchars($producto['precio']) ?>" required>
                </div>
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label">Tiempo preparación (min)</label>
                <input type="number" class="form-control" name="tiempo_preparacion" value="<?= htmlspecialchars($producto['tiempo_preparacion']) ?>" required>
            </div>
        </div>
        
        <div class="mb-3">
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" name="disponible" id="editDisponible" <?= $producto['disponible'] ? 'checked' : '' ?>>
                <label class="form-check-label" for="editDisponible">Disponible</label>
            </div>
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" name="destacado" id="editDestacado" <?= $producto['destacado'] ? 'checked' : '' ?>>
                <label class="form-check-label" for="editDestacado">Destacado</label>
            </div>
        </div>
        
        <div class="d-grid gap-2">
            <button type="submit" class="btn btn-primary">Guardar cambios</button>
        </div>
    </form>
</div>

<?php
$conn->close();
?>