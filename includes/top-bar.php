<!-- Top Bar - Versión Cliente -->
<nav class="navbar navbar-expand-lg top-bar-client">
    <div class="container-fluid">
        <a class="navbar-brand" href="#" data-view="inicio">
            <img src="../logoi.png" alt="Logo" class="rounded-circle me-2">
            <span>El Sazón de la Negra</span>
        </a>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarClient">
            <i class="fas fa-bars"></i>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarClient">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item">
                    <a class="nav-link active" href="#" data-view="inicio"><i class="fas fa-home me-1"></i> Inicio</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#" data-view="menu"><i class="fas fa-utensils me-1"></i> Menú</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#" data-view="historial"><i class="fas fa-history me-1"></i> Historial</a>
                </li>
                
            </ul>
            
            <div class="d-flex align-items-center">
                <!-- Notificaciones mejoradas -->
                <div class="notifications me-3">
                    <div class="notification-icon-wrapper border border-light" id="notificationsDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fas fa-bell notification-icon"></i>
                        <span class="notification-badge" id="notificationCount">0</span>
                    </div>
                    <ul class="dropdown-menu dropdown-menu-end notification-dropdown" aria-labelledby="notificationsDropdown" id="notificationsList">
                        <li class="notification-header">
                            <span>Tus notificaciones</span>
                            <span class="notification-clear" id="clearNotifications">Limpiar</span>
                        </li>
                        <li>
                            <div class="notification-empty">No hay notificaciones nuevas</div>
                        </li>
                    </ul>
                </div>
                
                <div class="dropdown">
                    <a href="#" class="d-flex align-items-center text-decoration-none dropdown-toggle text-white" id="userDropdown" data-bs-toggle="dropdown">
                        <div class="avatar-circle bg-primary text-white" id="user-avatar-initials">
                            <?php
                                $nombre = $user['nombre'] ?? '';
                                $apellido = $user['apellido'] ?? '';
                                $inicialNombre = $nombre ? substr(trim($nombre), 0, 1) : '';
                                $inicialApellido = $apellido ? substr(trim($apellido), 0, 1) : '';
                                echo strtoupper($inicialNombre . $inicialApellido);
                            ?>
                        </div>
                        <span class="d-none d-lg-inline ms-2 user-fullname text-white">
                            <?php echo htmlspecialchars(trim($nombre . ' ' . $apellido)); ?>
                        </span>
                    </a>
                    
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li> <a class="dropdown-item" href="#" data-view="perfil" onclick="navigate(event)"><i class="fas fa-user me-2"></i> Perfil</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#" id="logoutBtn"><i class="fas fa-sign-out-alt me-2"></i> Cerrar Sesión</a></li>
                    </ul>
                </div>
                
                <a href="#" class="btn btn-light ms-3 cart-btn">
                    <i class="fas fa-shopping-cart me-1"></i>
                    <span class="badge bg-white text-primary">2</span>
                </a>
            </div>
        </div>
    </div>
</nav>