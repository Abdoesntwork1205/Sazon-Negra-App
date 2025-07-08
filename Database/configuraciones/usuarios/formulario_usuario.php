<?php
require_once '../../../Config/conexion.php';

$userType = isset($_GET['user_type']) ? $_GET['user_type'] : 'clientes';
$userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

// Si es edición, obtener datos del usuario
$userData = [];
if ($userId > 0) {
    $table = ($userType === 'clientes') ? 'usuarios_clientes' : 'usuarios_personal';
    $sql = "SELECT * FROM $table WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $userData = $result->fetch_assoc();
}
?>

<!-- Agregar estos recursos en tu head o antes del cierre del body -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
<script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/es.js"></script>

<style>
    .user-form-container {
        max-width: 900px;
        margin: 0 auto;
        padding: 20px;
        background: #fff;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .form-header {
        margin-bottom: 25px;
        padding-bottom: 15px;
        border-bottom: 2px solid var(--primary);
    }
    
    .form-header h3 {
        color: #503e2c;
        font-weight: 600;
    }
    
    .form-label {
        font-weight: 500;
        color: #5e4834;
    }
    
    .form-control, .form-select {
        border-radius: 5px;
        padding: 10px;
        border: 1px solid #ddd;
        transition: all 0.3s;
    }
    
    .form-control:focus, .form-select:focus {
        border-color: #3ae3fa;
        box-shadow: 0 0 0 0.25rem rgba(58, 227, 250, 0.25);
    }
    
    .form-check-input {
        width: 20px;
        height: 20px;
        margin-top: 0.25rem;
    }
    
    .form-check-input:checked {
        background-color: #3ae3fa;
        border-color: #3ae3fa;
    }
    
    .text-muted {
        font-size: 0.85rem;
        color: #7f8c8d !important;
    }

    /* Estilos para Flatpickr */
    .flatpickr-input {
        background-color: white !important;
        cursor: pointer;
    }
    .flatpickr-calendar {
        font-family: inherit;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    @media (max-width: 768px) {
        .user-form-container {
            padding: 15px;
        }
        
        .col-md-6, .col-12 {
            margin-bottom: 15px;
        }
    }
</style>

<div class="user-form-container">
    <div class="form-header">
        <h3><?= ($userId > 0 ? 'Editar' : 'Agregar') ?> <?= $userType === 'clientes' ? 'Cliente' : 'Usuario' ?></h3>
    </div>
    
    <?php if ($userType === 'clientes') { ?>
        <form id="userForm" class="row g-3">
            <div class="col-md-6">
                <label for="nombre" class="form-label">Nombre</label>
                <input type="text" class="form-control" id="nombre" name="nombre" required 
                       value="<?= isset($userData['nombre']) ? htmlspecialchars($userData['nombre']) : '' ?>">
            </div>
            <div class="col-md-6">
                <label for="apellido" class="form-label">Apellido</label>
                <input type="text" class="form-control" id="apellido" name="apellido" required
                       value="<?= isset($userData['apellido']) ? htmlspecialchars($userData['apellido']) : '' ?>">
            </div>
            <div class="col-md-6">
                <label for="nacionalidad" class="form-label">Nacionalidad</label>
                <select class="form-select" id="nacionalidad" name="nacionalidad" required>
                    <option value="V" <?= (isset($userData['nacionalidad']) && $userData['nacionalidad'] === 'V') ? 'selected' : '' ?>>Venezolano</option>
                    <option value="E" <?= (isset($userData['nacionalidad']) && $userData['nacionalidad'] === 'E') ? 'selected' : '' ?>>Extranjero</option>
                </select>
            </div>
            <div class="col-md-6">
                <label for="cedula" class="form-label">Cédula</label>
                <div class="input-group">
                    <span class="input-group-text" id="nacionalidad-prefix"><?= isset($userData['nacionalidad']) ? $userData['nacionalidad'] : 'V' ?></span>
                    <input type="text" class="form-control" id="cedula" name="cedula" required
                        value="<?= isset($userData['cedula']) ? htmlspecialchars($userData['cedula']) : '' ?>">
                </div>
            </div>
            <div class="col-md-6">
                <label for="telefono" class="form-label">Teléfono</label>
                <input type="tel" class="form-control" id="telefono" name="telefono" required
                       value="<?= isset($userData['telefono']) ? htmlspecialchars($userData['telefono']) : '' ?>">
            </div>
            <div class="col-md-6">
                <label for="correo" class="form-label">Correo Electrónico</label>
                <input type="email" class="form-control" id="correo" name="correo" required
                       value="<?= isset($userData['correo']) ? htmlspecialchars($userData['correo']) : '' ?>">
            </div>
            <div class="col-md-6">
                <label for="fecha_nacimiento" class="form-label">Fecha de Nacimiento</label>
                <input type="text" class="form-control flatpickr-date" id="fecha_nacimiento" name="fecha_nacimiento" placeholder="Seleccionar fecha"
                       value="<?= isset($userData['fecha_nacimiento']) ? htmlspecialchars($userData['fecha_nacimiento']) : '' ?>">
            </div>
            <div class="col-md-12">
                <label for="direccion" class="form-label">Dirección</label>
                <textarea class="form-control" id="direccion" name="direccion" rows="2"><?= isset($userData['direccion']) ? htmlspecialchars($userData['direccion']) : '' ?></textarea>
            </div>
            <div class="col-md-6">
                <label for="clave" class="form-label"><?= ($userId > 0) ? 'Nueva ' : '' ?>Contraseña</label>
                <input type="password" class="form-control" id="clave" name="clave" <?= ($userId === 0) ? 'required' : '' ?>>
                <?php if ($userId > 0): ?>
                    <small class="text-muted">Dejar en blanco para mantener la contraseña actual</small>
                <?php endif; ?>
            </div>
            <div class="col-md-6">
                <label for="confirmar_clave" class="form-label">Confirmar <?= ($userId > 0) ? 'Nueva ' : '' ?>Contraseña</label>
                <input type="password" class="form-control" id="confirmar_clave" name="confirmar_clave" <?= ($userId === 0) ? 'required' : '' ?>>
            </div>
            <input type="hidden" name="user_type" value="clientes">
            <?php if ($userId > 0): ?>
                <input type="hidden" name="user_id" value="<?= $userId ?>">
            <?php endif; ?>
        </form>
    <?php } else { ?>
        
        
        
        <form id="userForm" class="row g-3">
            <div class="col-md-6">
                <label for="nombre" class="form-label">Nombre</label>
                <input type="text" class="form-control" id="nombre" name="nombre" required
                       value="<?= isset($userData['nombre']) ? htmlspecialchars($userData['nombre']) : '' ?>">
            </div>
            <div class="col-md-6">
                <label for="apellido" class="form-label">Apellido</label>
                <input type="text" class="form-control" id="apellido" name="apellido" required
                       value="<?= isset($userData['apellido']) ? htmlspecialchars($userData['apellido']) : '' ?>">
            </div>
            <div class="col-md-6">
                <label for="correo" class="form-label">Correo Electrónico</label>
                <input type="email" class="form-control" id="correo" name="correo" required
                       value="<?= isset($userData['correo']) ? htmlspecialchars($userData['correo']) : '' ?>">
            </div>
            <div class="col-md-6">
                <label for="telefono" class="form-label">Teléfono</label>
                <input type="tel" class="form-control" id="telefono" name="telefono" required
                       value="<?= isset($userData['telefono']) ? htmlspecialchars($userData['telefono']) : '' ?>">
            </div>


            <div class="col-md-6">
                <label for="nacionalidad" class="form-label">Nacionalidad</label>
                <select class="form-select" id="nacionalidad" name="nacionalidad" required>
                    <option value="V" <?= (isset($userData['nacionalidad']) && $userData['nacionalidad'] === 'V') ? 'selected' : '' ?>>Venezolano</option>
                    <option value="E" <?= (isset($userData['nacionalidad']) && $userData['nacionalidad'] === 'E') ? 'selected' : '' ?>>Extranjero</option>
                </select>
            </div>
            <div class="col-md-6">
                <label for="cedula" class="form-label">Cédula</label>
                <div class="input-group">
                    <span class="input-group-text" id="nacionalidad-prefix"><?= isset($userData['nacionalidad']) ? $userData['nacionalidad'] : 'V' ?></span>
                    <input type="text" class="form-control" id="cedula" name="cedula" required
                        value="<?= isset($userData['Cedula']) ? htmlspecialchars($userData['Cedula']) : '' ?>">
                </div>
            </div>

           <div class="col-md-6">
    <label for="rol" class="form-label">Rol</label>
    <select class="form-select" id="rol" name="rol" required>
        <option value="">Seleccionar rol</option>
        <option value="admin" <?= (isset($userData['rol']) && $userData['rol'] === 'admin') ? 'selected' : '' ?>>Administrador</option>
        <option value="encargado" <?= (isset($userData['rol']) && $userData['rol'] === 'encargado') ? 'selected' : '' ?>>Encargado</option>
        <option value="cajero" <?= (isset($userData['rol']) && $userData['rol'] === 'cajero') ? 'selected' : '' ?>>Cajero</option>
        <option value="administracion" <?= (isset($userData['rol']) && $userData['rol'] === 'administracion') ? 'selected' : '' ?>>Administración</option>
    </select>
</div>
            <div class="col-md-6">
                <label for="fecha_contratacion" class="form-label">Fecha de Contratación</label>
                <input type="text" class="form-control flatpickr-date" id="fecha_contratacion" name="fecha_contratacion" placeholder="Seleccionar fecha"
                       value="<?= isset($userData['fecha_contratacion']) ? htmlspecialchars($userData['fecha_contratacion']) : '' ?>">
            </div>
            <div class="col-md-6">
                <label for="clave" class="form-label"><?= ($userId > 0) ? 'Nueva ' : '' ?>Contraseña</label>
                <input type="password" class="form-control" id="clave" name="clave" <?= ($userId === 0) ? 'required' : '' ?>>
                <?php if ($userId > 0): ?>
                    <small class="text-muted">Dejar en blanco para mantener la contraseña actual</small>
                <?php endif; ?>
            </div>
            <div class="col-md-6">
                <label for="confirmar_clave" class="form-label">Confirmar <?= ($userId > 0) ? 'Nueva ' : '' ?>Contraseña</label>
                <input type="password" class="form-control" id="confirmar_clave" name="confirmar_clave" <?= ($userId === 0) ? 'required' : '' ?>>
            </div>
            <div class="col-12">
    <div class="form-check">
        <input class="form-check-input" type="checkbox" id="activo" name="activo" <?= (!isset($userData['activo']) || $userData['activo']) ? 'checked' : '' ?>>
        <label class="form-check-label" for="activo">Usuario activo</label>
    </div>
</div>
            <input type="hidden" name="user_type" value="personal">
            <?php if ($userId > 0): ?>
                <input type="hidden" name="user_id" value="<?= $userId ?>">
            <?php endif; ?>
        </form>
    <?php } ?>
</div>

<script>
$(document).ready(function() {
    // Configuración de Flatpickr
    flatpickr.localize(flatpickr.l10ns.es);
    
    $(".flatpickr-date").flatpickr({
        dateFormat: "Y-m-d",
        allowInput: true,
        locale: "es",
        // Configuración específica para fecha de nacimiento
        maxDate: new Date().fp_incr(-18 * 365) // Mínimo 18 años
    });
    
    // Configuración diferente para fecha de contratación
    $("#fecha_contratacion").flatpickr({
        dateFormat: "Y-m-d",
        allowInput: true,
        locale: "es",
        minDate: "2000-01-01",
        maxDate: new Date().fp_incr(0) // Hoy
    });


     $('#nacionalidad').change(function() {
        $('#nacionalidad-prefix').text($(this).val());
    });
    
    // Validar cédula (solo números y máximo 8 dígitos)
    $('#cedula').on('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
        if (this.value.length > 8) {
            this.value = this.value.slice(0, 8);
        }
    });

});
</script>