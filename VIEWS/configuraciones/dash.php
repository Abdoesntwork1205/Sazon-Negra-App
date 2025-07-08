<?php
// Iniciar buffering
ob_start();

// Incluir el archivo de verificación de sesión
require_once '../../Database/auth/check_session.php';

// Limpiar el buffer que podría haber generado el check_session
ob_clean();
?>

<!DOCTYPE html>
<html lang="es" data-bs-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <title>El Sazón de la Negra</title>
    <link rel="icon" href="data:,"> <!-- Esto evita la solicitud de favicon.ico -->
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <!-- Google Fonts (Poppins) -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css" rel="stylesheet">

    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <!-- CSS Personalizado -->
    <link rel="stylesheet" href="../../CSS/configuraciones/dashboard.css">
    <link rel="stylesheet" href="../../CSS/configuraciones/sidebar.css">
    <link rel="stylesheet" href="../../CSS/notificaciones/notificaciones.css">
</head>
<body>
    <!-- Preloader -->
 

    <!-- Include Sidebar -->
    <?php include '../sidebar/sidebar.php'; ?>

    <!-- Main Content -->
    <div id="content">
        <!-- Top Bar -->
       <nav class="navbar top-bar">
            <div class="container-fluid">
                <button id="sidebarCollapse" class="btn">
                    <i class="fas fa-bars"></i>
                </button>
                <div class="d-flex align-items-center">
                    <!-- Theme Switcher -->
                    <div class="theme-switcher me-3">
                        
                    </div>
                    
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
                    
                    <!-- User Dropdown -->
                    <div class="user-dropdown dropdown">
                        
                    </div>
                </div>
            </div>
        </nav>

        <!-- Contenido Principal -->
        <div class="container-fluid">
            <!-- Breadcrumb -->
            <div class="row mb-4">
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">

                    </ol>
                </nav>
            </div>

            <div class="row metric-cards">
    <!-- Ventas Hoy -->
   <div class="row metric-cards">
    <!-- Ventas Hoy -->
    <div class="col-xl-3 col-md-6 mb-4">
        <a href="../configuraciones/reportes.php" class="card-link">
            <div class="card h-100 sales-card">
                <div class="card-body">
                    <div class="d-flex flex-md-row flex-column">
                        <div class="icon-circle mb-md-0 mb-3">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="ms-md-3">
                            <h6 class="text-uppercase mb-1">Ventas Hoy</h6>
                            <h2 class="mb-2">$2,450</h2>
                            <p class="mb-0">
                                <i class="fas fa-arrow-up"></i> <strong>18.2%</strong> vs ayer
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </a>
    </div>
    
    <!-- Órdenes Hoy -->
    <div class="col-xl-3 col-md-6 mb-4">
        <a href="../configuraciones/ordenes.php" class="card-link">
            <div class="card h-100 orders-card">
                <div class="card-body">
                    <div class="d-flex flex-md-row flex-column">
                        <div class="icon-circle mb-md-0 mb-3">
                            <i class="fas fa-clipboard-list"></i>
                        </div>
                        <div class="ms-md-3">
                            <h6 class="text-uppercase mb-1">Órdenes Hoy</h6>
                            <h2 class="mb-2">24</h2>
                            <p class="mb-0">
                                <i class="fas fa-clock"></i> <strong>5</strong> en proceso
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </a>
    </div>
    
    <!-- Clientes Registrados -->
    <div class="col-xl-3 col-md-6 mb-4">
        <a href="../configuraciones/usuarios.php" class="card-link">
            <div class="card h-100 customers-card">
                <div class="card-body">
                    <div class="d-flex flex-md-row flex-column">
                        <div class="icon-circle mb-md-0 mb-3">
                            <i class="fas fa-user-check"></i>
                        </div>
                        <div class="ms-md-3">
                            <h6 class="text-uppercase mb-1">Clientes Registrados</h6>
                            <h2 class="mb-2">156</h2>
                            <p class="mb-0">
                                <i class="fas fa-crown"></i> <strong>32</strong> VIP
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </a>
    </div>
    
    <!-- Productos/Categorías -->
    <div class="col-xl-3 col-md-6 mb-4">
        <a href="../configuraciones/productos.php" class="card-link">
            <div class="card h-100 products-card">
                <div class="card-body">
                    <div class="d-flex flex-md-row flex-column">
                        <div class="icon-circle mb-md-0 mb-3">
                            <i class="fas fa-box-open"></i>
                        </div>
                        <div class="ms-md-3">
                            <h6 class="text-uppercase mb-1">Productos</h6>
                            <h2 class="mb-2">87</h2>
                            <p class="mb-0">
                                <i class="fas fa-tags"></i> <strong>12</strong> categorías
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </a>
    </div>
</div>

            <!-- Gráficos y Estadísticas -->
            <div class="row">
                <!-- Gráfico Principal -->
                <div class="col-xl-8 mb-4">
                    <div class="card h-100">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Rendimiento Semanal en Ventas</h5>
            
                        </div>
                        <div class="card-body">
                            <canvas id="mainChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Hamburguesa Destacada -->
                <div class="col-xl-4 mb-4">
                    <div class="card h-100">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Producto Estrella</h5>
                        </div>
                        <div class="card-body text-center">
                            <div class="burger-of-the-day">
                                <img src="https://via.placeholder.com/250x150/ff6b00/ffffff?text=Bacon+Deluxe" alt="Hamburguesa" class="img-fluid">
                                <div class="badge-premium">TOP 1</div>
                            </div>
                            <h3 class="mt-3">Bacon Deluxe</h3>
                            <div class="rating mb-2">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star-half-alt"></i>
                                <span class="ms-1">4.7</span>
                            </div>
>
                            <p class="text-muted">Total vendido esta semana: <strong id="productoEstrellaVentas">0</strong> unidades</p>
                           
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabla -->
            <!-- Tabla -->
<div class="row">
    <!-- Últimas Órdenes -->
    <div class="col-xl-12 mb-4">
        <div class="card h-100">
            <div class="card-header">
                <h5 class="card-title mb-0">Órdenes Recientes</h5>
                <button class="btn btn-sm btn-outline-primary">Ver Todas</button>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cliente</th>
                                <th>Productos</th>
                                <th>Total</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Las filas se llenarán dinámicamente -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
        </div>
    </div>

<!-- Bootstrap JS Bundle con Popper -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/minidenticons@4.2.0/dist/minidenticons.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<!-- Script Personalizado -->
<script src="../../JS/configuraciones/sidebar.js"></script>
<script src="../../JS/notificaciones/notificaciones.js"></script>
<script src="../../JS/notificaciones/handlers.js"></script>
<script src="../../JS/configuraciones/ordenes.js"></script>
<script src="../../JS/configuraciones/dashboard.js"></script>
</body>
</html>