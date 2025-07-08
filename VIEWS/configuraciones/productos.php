<?php
// Incluir el archivo de verificación de sesión
require_once '../../Database/auth/check_session.php';
?>
<!DOCTYPE html>
<html lang="es" data-bs-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>El Sazón de la Negra</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../../CSS/configuraciones/sidebar.css">
    <link rel="stylesheet" href="../../CSS/notificaciones/notificaciones.css">
    <link rel="stylesheet" href="../../CSS/configuraciones/productos.css">
    
    
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
                    <h5 class="card-title mb-0">Gestión de Productos</h5>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-secondary" id="refreshBtn">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </div>

                <!-- Formulario para agregar nuevo producto -->
                <!-- Formulario para agregar nuevo producto -->
<div class="card-body border-bottom">
    <form id="addProductForm" class="row g-3" enctype="multipart/form-data">
        <div class="col-md-3">
            <label for="productTitle" class="form-label">Título</label>
            <input type="text" class="form-control" id="productTitle" name="titulo" required autocomplete="off">
        </div>
        <div class="col-md-3">
            <label for="productCategory" class="form-label">Categoría</label>
            <select class="form-select select2" id="productCategory" name="categoria_id" required>
                <option value="">Seleccionar categoría</option>
            </select>
        </div>
        <div class="col-md-2">
            <label for="productPrice" class="form-label">Precio</label>
            <div class="input-group">
                <span class="input-group-text">$</span>
                <input type="number" class="form-control" id="productPrice" name="precio" min="0" step="0.01" required autocomplete="off">
            </div>
        </div>
        <div class="col-md-2">
            <label for="productTime" class="form-label">Tiempo (min)</label>
            <input type="number" class="form-control" id="productTime" name="tiempo_preparacion" min="1" required>
        </div>
        <div class="col-md-2">
            <label for="productImage" class="form-label">Imagen</label>
            <input type="file" class="form-control" id="productImage" name="imagen" accept="image/*">
        </div>
        <div class="col-md-6">
            <label for="productDescription" class="form-label">Descripción</label>
            <textarea class="form-control" id="productDescription" name="descripcion" rows="2" autocomplete="off"></textarea>
        </div>
        <div class="col-md-2">
            <div class="form-check form-switch mt-4 pt-2">
                <input class="form-check-input" type="checkbox" id="productAvailable" name="disponible" checked>
                <label class="form-check-label" for="productAvailable">Disponible</label>
            </div>
        </div>
        <div class="col-md-2">
            <div class="form-check form-switch mt-4 pt-2">
                <input class="form-check-input" type="checkbox" id="productFeatured" name="destacado">
                <label class="form-check-label" for="productFeatured">Destacado</label>
            </div>
        </div>
        <div class="col-md-2 d-flex align-items-end">
            <button type="submit" class="btn btn-primary">
                <i class="fas fa-plus"></i> Agregar
            </button>
        </div>
    </form>
</div>

                <!-- Tabla de productos -->
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle" id="productsTable">
                            <thead>
                                <tr>
                                    <th width="5%">ID</th>
                                    <th width="15%">Imagen</th>
                                    <th width="20%">Título</th>
                                    <th width="15%">Categoría</th>
                                    <th width="10%">Precio</th>
                                    <th width="10%">Tiempo</th>
                                    <th width="10%">Estado</th>
                                    <th width="15%" class="text-end">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Datos se cargarán via AJAX -->
                                <tr>
                                    <td colspan="8" class="text-center py-4">
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

    <!-- Modal para editar producto -->
    <div class="modal fade" id="editProductModal" tabindex="-1" aria-hidden="true">
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
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="../../JS/configuraciones/sidebar.js"></script>
    <script src="../../JS/configuraciones/validaciones.js"></script>
    <script src="../../JS/configuraciones/productos.js"></script>
    <script src="../../JS/configuraciones/ordenes.js"></script>
    <script src="../../JS/notificaciones/notificaciones.js"></script>
    <script src="../../JS/notificaciones/handlers.js"></script>
</body>
</html>