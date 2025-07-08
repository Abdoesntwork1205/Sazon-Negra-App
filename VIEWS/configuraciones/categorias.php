<?php
// Incluir el archivo de verificación de sesión
require_once '../../Database/auth/check_session.php';
?>


<!DOCTYPE html>
<html lang="es" data-bs-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Delicious Burger - Gestión de Categorías</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="../../CSS/configuraciones/categorias.css">
    <link rel="stylesheet" href="../../CSS/configuraciones/sidebar.css">
    <link rel="stylesheet" href="../../CSS/notificaciones/notificaciones.css">
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

        

            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">Gestión de Categorías</h5>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-secondary" id="refreshBtn">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </div>

                <!-- Formulario para agregar nueva categoría -->
                <div class="card-body border-bottom">
                    <form id="addCategoryForm" class="row g-3">
                        <div class="col-md-4">
                            <label for="categoryName" class="form-label">Nombre</label>
                            <input type="text" class="form-control" id="categoryName" required autocomplete="off">
                        </div>
                        <div class="col-md-5">
                            <label for="categoryDescription" class="form-label">Descripción</label>
                            <input type="text" class="form-control" id="categoryDescription" autocomplete="off">
                        </div>
                        <div class="col-md-2">
                            <div class="form-check form-switch mt-4 pt-2">
                                <input class="form-check-input" type="checkbox" id="categoryActive" checked>
                                <label class="form-check-label" for="categoryActive">Activa</label>
                            </div>
                        </div>
                        <div class="col-md-1 d-flex align-items-end">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-plus"></i> Agregar
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Tabla de categorías -->
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle" id="categoriesTable">
                            <thead>
                                <tr>
                                    <th width="5%">ID</th>
                                    <th width="25%">Nombre</th>
                                    <th width="45%">Descripción</th>
                                    <th width="15%">Estado</th>
                                    <th width="10%" class="text-end">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Datos se cargarán via AJAX -->
                                <tr>
                                    <td colspan="5" class="text-center py-4">
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

    <!-- Modal para editar categoría -->
    <div class="modal fade" id="editCategoryModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <!-- Contenido del modal se cargará via AJAX -->
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

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="../../JS/configuraciones/sidebar.js"></script>
    <script src="../../JS/configuraciones/categorias.js"></script>
    <script src="../../JS/configuraciones/validaciones.js"></script>
    <script src="../../JS/notificaciones/notificaciones.js"></script>
    <script src="../../JS/configuraciones/ordenes.js"></script>
    <script src="../../JS/notificaciones/handlers.js"></script>
</body>
</html>