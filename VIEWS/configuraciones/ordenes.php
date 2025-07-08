<?php
// Incluir el archivo de verificación de sesión
require_once '../../Database/auth/check_session.php';
?>
<!DOCTYPE html>
<html lang="es" data-bs-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>El Sazón de la Negra - Pedidos</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    
    <link rel="stylesheet" href="../../CSS/configuraciones/sidebar.css">
    <link rel="stylesheet" href="../../CSS/configuraciones/ordenes.css">
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

                    <!-- Notifications -->
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

                    


             
        </nav>

        <div class="container-fluid">
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">Gestión de Pedidos</h5>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-secondary" id="refreshBtn">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </div>

                <!-- Filtros de búsqueda -->
                <div class="card-body border-bottom">
                    <form id="filterForm" autocomplete="off">
                        <!-- Primera fila - 4 inputs principales -->
                        <div class="row g-3 mb-3">
                            <div class="col-md-3">
                                <label for="searchId" class="form-label">Identificación/Cédula</label>
                                <input type="text" class="form-control" id="searchId" 
                                    placeholder="Buscar por cédula..." 
                                    autocomplete="off">
                            </div>
                            <div class="col-md-2">
                                <label for="deliveryFilter" class="form-label">Delivery</label>
                                <select class="form-select" id="deliveryFilter" autocomplete="off">
                                <option value="no">No</option>
                                <option value="si">Sí</option>
                                </select>
                            </div>
                            <div class="col-md-2">
                                <label for="statusFilter" class="form-label">Estado</label>
                                <select id="statusFilter" class="form-select">
                                    <option value="">Todos los estados</option>
                                    <option value="confirmado">Confirmado</option>
                                    <option value="por_confirmar">Por confirmar</option>
                                    <option value="cancelado">Cancelado</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <label for="startDate" class="form-label">Fecha inicial</label>
                                <div class="input-group">
                                    <input type="text" class="form-control light-datepicker" id="startDate" placeholder="DD/MM/YYYY" autocomplete="off">
                                    <span class="input-group-text">
                                        <i class="fas fa-calendar-alt"></i>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Segunda fila - Fecha fin y botón filtrar -->
                        <div class="row g-3 align-items-end">
                            <div class="col-md-3">
                                <label for="endDate" class="form-label">Fecha final</label>
                                <div class="input-group">
                                    <input type="text" class="form-control light-datepicker" id="endDate" placeholder="DD/MM/YYYY" autocomplete="off">
                                    <span class="input-group-text">
                                        <i class="fas fa-calendar-alt"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="col-md-2 offset-md-7">
                                <button type="submit" class="btn btn-primary w-100">
                                    <i class="fas fa-filter"></i> Filtrar
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                <!-- Tabla de pedidos -->
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle" id="ordersTable">
                            <thead>
                                <tr>
                                    <th width="15%">ID Pedido</th>
                                    <th width="20%">ID Cliente</th>
                                    <th width="15%">Monto</th>
                                    <th width="15%">Tipo de Pago</th>
                                    <th width="15%">Estado</th>
                                    <th width="10%" class="text-end">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="ordersTableBody">
                                <!-- Las filas se cargarán dinámicamente aquí -->
                            </tbody>
                        </table>
                    </div>

                    <!-- Paginación -->
                    <nav aria-label="Page navigation">
                        <ul class="pagination justify-content-end" id="pagination">
                            <li class="page-item disabled">
                                <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Anterior</a>
                            </li>
                            <li class="page-item active"><a class="page-link" href="#">1</a></li>
                            <li class="page-item"><a class="page-link" href="#">2</a></li>
                            <li class="page-item"><a class="page-link" href="#">3</a></li>
                            <li class="page-item">
                                <a class="page-link" href="#">Siguiente</a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/es.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script>
    // Hacer jsPDF disponible globalmente
    window.jsPDF = window.jspdf.jsPDF;
</script>
    <script src="../../JS/configuraciones/sidebar.js"></script>
    <script src="../../JS/configuraciones/ordenes.js"></script>
    <script src="../../JS/configuraciones/generar-factura-v2.js"></script>
    <script src="../../JS/configuraciones/validaciones.js"></script>
    <script src="../../JS/notificaciones/notificaciones.js"></script>
    <script src="../../JS/notificaciones/handlers.js"></script>

    

</body>
</html>