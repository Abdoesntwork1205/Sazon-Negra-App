<?php
// Incluir el archivo de verificación de sesión
require_once '../../Database/auth/check_session.php';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>El Sazón de la Negra - Promociones</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/select2-bootstrap-5-theme@1.3.0/dist/select2-bootstrap-5-theme.min.css">
    <link rel="stylesheet" href="../../CSS/configuraciones/sidebar.css">
    <link rel="stylesheet" href="../../CSS/configuraciones/promociones.css">
    <link rel="stylesheet" href="../../CSS/notificaciones/notificaciones.css">
</head>
<body>
    <?php include '../sidebar/sidebar.php' ?>

    <div id="content">
        <nav class="navbar top-bar">
            <div class="container-fluid">
                <button id="sidebarCollapse" class="btn">
                    <i class="fas fa-bars"></i>
                </button>

                <div class="notifications me-3 dropdown">
                        <button class="btn btn-link dropdown-toggle p-0" type="button" id="notificationsDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                            <div class="notification-icon-wrapper border border-light">
                                <i class="fas fa-bell notification-icon"></i>
                                <span class="badge bg-danger notification-badge" id="notificationCount">0</span>
                            </div>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end notification-dropdown" aria-labelledby="notificationsDropdown" id="notificationsList">
                            <li><h6 class="dropdown-header">Pedidos por confirmar</h6></li>
                            <li><div class="dropdown-item text-center py-3">Cargando notificaciones...</div></li>
                        </ul>
                    </div>
            </div>


            
        </nav>

        <div class="container-fluid">
            <div class="mb-4">
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#nuevaPromocionModal">
                    <i class="fas fa-plus me-2"></i>Nueva Promoción
                </button>
            </div>

            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">Promociones Activas</h5>
                    <button class="btn btn-sm btn-outline-secondary" id="refreshPromocionesBtn">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover" id="promocionesTable">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Tipo</th>
                                    <th>Descuento</th>
                                    <th>Vigencia</th>
                                    <th>Aplicación</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="promocionesTableBody">
                                <!-- Las promociones se cargarán aquí -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="card mt-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">Historial de Promociones</h5>
                    <button class="btn btn-sm btn-outline-secondary" id="refreshHistorialBtn">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover" id="historialPromocionesTable">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Tipo</th>
                                    <th>Descuento</th>
                                    <th>Vigencia</th>
                                    <th>Aplicación</th>
                                    <th>Pedidos</th>
                                </tr>
                            </thead>
                            <tbody id="historialPromocionesTableBody">
                                <!-- El historial se cargará aquí -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

 
    <!-- Modal Nueva Promoción -->
<div class="modal fade" id="nuevaPromocionModal" tabindex="-1" aria-labelledby="nuevaPromocionModalLabel">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="nuevaPromocionModalLabel">Crear Nueva Promoción</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="promocionForm">
                    <!-- Campos básicos -->
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <label for="promocionNombre" class="form-label">Nombre de la promoción</label>
                            <input type="text" class="form-control" id="promocionNombre" required>
                        </div>
                        <div class="col-md-6">
                            <label for="promocionTipo" class="form-label">Tipo de descuento</label>
                            <select class="form-select" id="promocionTipo" required>
                                <option value="">Seleccionar...</option>
                                <option value="porcentaje">Porcentaje (%)</option>
                                <option value="monto_fijo">Monto fijo ($)</option>
                                <option value="2x1">2x1</option>
                                <option value="3x2">3x2</option>
                            </select>
                        </div>
                    </div>

                    <!-- Campo de valor -->
                    <div class="row mb-4" id="descuentoContainer">
                        <div class="col-md-6">
                            <label for="promocionValor" class="form-label" id="valorDescuentoLabel">Valor del descuento</label>
                            <input type="text" class="form-control" id="promocionValor">
                        </div>
                    </div>

                    <!-- Fechas -->
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <label for="promocionInicio" class="form-label">Fecha de inicio</label>
                            <input type="text" class="form-control datetimepicker" id="promocionInicio" required>
                        </div>
                        <div class="col-md-6">
                            <label for="promocionFin" class="form-label">Fecha de finalización</label>
                            <input type="text" class="form-control datetimepicker" id="promocionFin" required>
                        </div>
                    </div>

                    <!-- Tipo de aplicación -->
                    <div class="mb-4">
                        <label class="form-label">Aplicar promoción a:</label>
                        <div class="d-flex gap-3">
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="aplicacionPromocion" id="aplicarCategorias" value="categorias" checked>
                                <label class="form-check-label" for="aplicarCategorias">Categorías</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="aplicacionPromocion" id="aplicarProductos" value="productos">
                                <label class="form-check-label" for="aplicarProductos">Productos</label>
                            </div>
                        </div>
                    </div>

                    <!-- Selector de elementos -->
                    <div class="mb-4">
                        <label class="form-label fw-bold" id="selectorLabel">Seleccionar categorías:</label>
                        <select class="form-select select2-elementos" id="elementosSearch" multiple="multiple" style="width: 100%;">
                            <!-- Opciones se cargarán dinámicamente -->
                        </select>
                        <small class="text-muted">Escribe para buscar y seleccionar elementos</small>
                    </div>

                    <!-- Tabla de resumen -->
                    <div class="table-responsive mt-4">
                        <table class="table table-hover" id="tablaResumenSeleccion">
                            <thead class="table-light">
                                <tr>
                                    <th width="5%">#</th>
                                    <th width="65%">Elemento</th>
                                    <th width="15%">Tipo</th>
                                    <th width="15%">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Se llenará dinámicamente -->
                            </tbody>
                        </table>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary" id="guardarPromocion">Guardar Promoción</button>
            </div>
        </div>
    </div>
</div>


    <!-- Modal Detalles Promoción -->
 <div class="modal fade" id="detallePromocionModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Detalles de Promoción</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="row mb-3">
                    <div class="col-md-6">
                        <h6>Información General</h6>
                        <table class="table table-sm">
                            <tr>
                                <th>Nombre:</th>
                                <td id="detalleNombre"></td>
                            </tr>
                            <tr>
                                <th>Tipo:</th>
                                <td id="detalleTipo"></td>
                            </tr>
                            <tr>
                                <th>Descuento:</th>
                                <td id="detalleDescuento"></td>
                            </tr>
                            <tr>
                                <th>Fechas:</th>
                                <td id="detalleFechas"></td>
                            </tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <h6>Estadísticas</h6>
                        <table class="table table-sm">
                            <tr>
                                <th>Estado:</th>
                                <td id="detalleEstado"></td>
                            </tr>
                            <tr>
                                <th>Elementos:</th>
                                <td id="detalleCantidad"></td>
                            </tr>
                        </table>
                    </div>
                </div>
                
                <h6>Elementos incluidos</h6>
                <div class="table-responsive">
                    <table class="table table-sm" id="tablaElementosPromocion">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Nombre</th>
                                <th>Tipo</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            </div>
        </div>
    </div>
</div>

    <!-- Scripts -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/es.js"></script>
    <script src="../../JS/configuraciones/promociones.js"></script>
    <script src="../../JS/notificaciones/notificaciones.js"></script>
    <script src="../../JS/configuraciones/validaciones.js"></script>
    <script src="../../JS/notificaciones/handlers.js"></script>
    <script src="../../JS/configuraciones/sidebar.js"></script>
</body>
</html>