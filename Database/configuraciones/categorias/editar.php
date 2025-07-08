<?php
include '../../../config/conexion.php';

if (isset($_GET['id'])) {
    $id = (int)$_GET['id'];
    $query = $conn->query("SELECT * FROM categorias WHERE id = $id");
    $category = $query->fetch_assoc();
}
?>

<div class="modal-header bg-primary text-white">
    <h5 class="modal-title">Editar Categoría</h5>
    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
</div>
<form id="editCategoryForm">
    <input type="hidden" name="id" value="<?= $category['id'] ?>">
    <div class="modal-body">
        <div class="mb-3">
            <label for="editCategoryName" class="form-label">Nombre</label>
            <input type="text" class="form-control" id="editCategoryName" name="nombre" 
                   value="<?= htmlspecialchars($category['nombre']) ?>" required>
        </div>
        <div class="mb-3">
            <label for="editCategoryDescription" class="form-label">Descripción</label>
            <textarea class="form-control" id="editCategoryDescription" name="descripcion" 
                      rows="3"><?= htmlspecialchars($category['descripcion']) ?></textarea>
        </div>
        <div class="mb-3 form-check form-switch">
            <input class="form-check-input" type="checkbox" id="editCategoryActive" name="activa" 
                   <?= $category['activa'] ? 'checked' : '' ?>>
            <label class="form-check-label" for="editCategoryActive">Activa</label>
        </div>
    </div>
    <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
        <button type="submit" class="btn btn-primary">Guardar Cambios</button>
    </div>
</form>