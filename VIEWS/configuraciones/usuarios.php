<?php
// Incluir el archivo de verificación de sesión
require_once '../../Database/auth/check_session.php';
?>
<!DOCTYPE html>
<html lang="es" data-bs-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>El Sazón de la Negra - Gestión de Usuarios</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../../CSS/configuraciones/sidebar.css">
    <link rel="stylesheet" href="../../CSS/notificaciones/notificaciones.css">
    <link rel="stylesheet" href="../../CSS/configuraciones/usuarios.css">
</head>
<body>
    <?php include '../sidebar/sidebar.php'; ?>

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
                    <h5 class="card-title mb-0">Gestión de Usuarios</h5>
                    <div class="btn-group">
                        
                    </div>
                </div>

                <!-- Filtros y selector de tipo de usuario -->
                <div class="card-body border-bottom">
                    <div class="row">
                        <div class="col-md-3">
                            <div class="btn-group w-100" role="group">
                                <button type="button" class="btn btn-outline-primary active" id="btnClientes">
                                    <i class="fas fa-users me-1"></i> Clientes
                                </button>
                                <button type="button" class="btn btn-outline-primary" id="btnPersonal">
                                    <i class="fas fa-user-tie me-1"></i> Personal
                                </button>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-search"></i></span>
                                <input type="text" class="form-control" id="searchInput" placeholder="Buscar...">
                            </div>
                        </div>
                        <div class="col-md-3">
                            <select class="form-select" id="statusFilter">
                                <option value="">Todos los estados</option>
                                <option value="activo">Activo</option>
                                <option value="inactivo">Inactivo</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <button class="btn btn-primary w-100" id="addUserBtn">
                                <i class="fas fa-plus me-1"></i> Nuevo
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Tabla de usuarios -->
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle" id="usersTable">
                            <thead>
                                <tr>
                                    <th width="10%">ID</th>
                                    <th width="20%">Nombre</th>
                                    <th width="15%">Identificación</th>
                                    <th width="20%">Contacto</th>
                                    <th width="15%">Registro</th>
                                    <th width="10%">Estado</th>
                                    <th width="10%" class="text-end">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="usersTableBody">
                                <!-- Datos se cargarán via AJAX -->
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

                    <!-- Paginación -->
                    <nav aria-label="Page navigation">
                        <ul class="pagination justify-content-end" id="pagination">
                            <!-- Paginación se cargará via AJAX -->
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal para agregar/editar usuario -->
    <div class="modal fade" id="userModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <!-- Contenido del modal se cargará via AJAX -->
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/es.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="../../JS/configuraciones/sidebar.js"></script>
    <script src="../../JS/configuraciones/validaciones.js"></script>
        <script src="../../JS/notificaciones/notificaciones.js"></script>
    <script src="../../JS/notificaciones/handlers.js"></script>
    <script src="../../JS/configuraciones/usuarios.js"></script>

</body>
</html>