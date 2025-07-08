<?php
// Incluir el archivo de verificación de sesión
require_once '../../Database/auth/check_session.php';
?>
<!DOCTYPE html>
<html lang="es" data-bs-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>El Sazón de la Negra - Tasas de Cambio</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    
    <link rel="stylesheet" href="../../CSS/configuraciones/sidebar.css">
    <link rel="stylesheet" href="../../CSS/configuraciones/tasas.css">
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
                    <h5 class="card-title mb-0">Tasas de Cambio USD → VES</h5>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-secondary" id="refreshBtn">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        
                        <button class="btn btn-sm btn-primary" id="addRateBtn" data-bs-toggle="modal" data-bs-target="#addRateModal">
                            <i class="fas fa-plus"></i> Nueva Tasa
                        </button>
                    </div>
                </div>

                <!-- Tabla de tasas -->
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle" id="ratesTable">
                            <thead>
                                <tr>
                                    <th width="5%">ID</th>
                                    <th width="20%">Moneda Origen</th>
                                    <th width="20%">Moneda Destino</th>
                                    <th width="15%">Tasa</th>
                                    <th width="20%">Última Actualización</th>
                                    <th width="10%">Usuario</th>
                                    <th width="10%" class="text-end">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="ratesTableBody">
                                <tr>
                                    <td colspan="7" class="text-center py-4">
                                        <div class="spinner-border text-primary" role="status">
                                            <span class="visually-hidden">Cargando...</span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal para agregar nueva tasa -->
    <div class="modal fade" id="addRateModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Agregar Nueva Tasa USD → VES</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="addRateForm">
                        <div class="mb-3">
                            <label for="rateValue" class="form-label">Tasa de Cambio (1 USD = ? VES)</label>
                            <div class="input-group">
                                <span class="input-group-text">1 USD =</span>
                                <input type="number" class="form-control" id="rateValue" step="0.000001" min="0" required>
                                <span class="input-group-text">VES</span>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="saveRateBtn">Guardar Tasa</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal para editar tasa -->
    <div class="modal fade" id="editRateModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <!-- Contenido se cargará dinámicamente -->
            </div>
        </div>
    </div>

    <!-- Toast para notificaciones -->
    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
        <div id="toastNotification" class="toast align-items-center text-white bg-success" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body" id="toastMessage"></div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="../../JS/configuraciones/sidebar.js"></script>
    <script src="../../JS/configuraciones/tasas.js"></script>
    <script src="../../JS/notificaciones/notificaciones.js"></script>
</body>
</html>