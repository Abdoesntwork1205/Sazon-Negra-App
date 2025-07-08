document.addEventListener('DOMContentLoaded', function() {
    // Esperar 100ms para asegurar que sessionStorage esté listo
    setTimeout(() => {
        // 1. Verificar datos de usuario
        const userData = JSON.parse(sessionStorage.getItem('userData')) || {};
        const userPermissions = JSON.parse(sessionStorage.getItem('userPermissions')) || [];
        const userRole = userData.rol?.toLowerCase() || '';
        
        if (!userRole) {
            console.warn('No se encontraron datos de usuario');
            window.location.href = '../../VIEWS/Auth/login.php';
            return;
        }

        // 2. Configuración de permisos
        const currentPath = window.location.pathname.split('/').pop();
        
        const PERMISSION_CONFIG = {
            pages: {
                'dashboard.php': 'dashboard',
                'dash.php': 'dashboard',
                'crear-orden.php': 'crear-orden',
                'orden.php': 'orden',
                'ordenes.php': 'ordenes',
                'productos.php': 'productos',
                'categorias.php': 'categorias',
                'tasas.php': 'tasas-cambio',
                'usuarios.php': 'usuarios',
                'configuraciones.php': 'configuraciones',
                'reportes.php': 'reportes',
                'perfil.php': 'perfil',
                'historial.php': 'historial',
                'promociones.php': 'promociones'
            },
            roleAccess: {
                'admin': ['dashboard.php', 'dash.php', 'crear-orden.php', 'orden.php', 'ordenes.php', 
                         'productos.php', 'categorias.php', 'tasas.php', 'usuarios.php', 
                         'configuraciones.php', 'reportes.php', 'perfil.php', 'historial.php', 'promociones.php'],
                'cajero': ['crear-orden.php'],
                'encargado': ['dashboard.php', 'dash.php', 'crear-orden.php', 'orden.php', 'ordenes.php', 
                             'productos.php', 'categorias.php', 'perfil.php', 'historial.php', 'tasas.php', 'promociones.php'],
                'administracion': ['reportes.php', 'perfil.php', 'historial.php','orden.php', 'ordenes.php',],
                'cliente': ['perfil.php', 'historial.php']
            }
        };

        // 3. Verificar acceso a la página actual
        checkCurrentPageAccess(userRole, currentPath, PERMISSION_CONFIG);

        // 4. Inicializar sidebar
        initializeSidebar();
        
        // 5. Configurar elemento activo del menú
        setActiveMenuItem(currentPath);
        
        // 6. Mostrar información de usuario
        displayUserInfo(userData, userRole);

        // 7. Configurar logout
        setupLogout();

        // 8. Configurar redirección al hacer clic en elementos sin permiso
        setupRedirects(userRole, PERMISSION_CONFIG);

    }, 100);

    // ============ FUNCIONES ============ //

    function checkCurrentPageAccess(userRole, currentPath, config) {
        // Páginas permitidas para todos los roles
        const commonPages = ['perfil.php', 'historial.php'];
        
        // Verificar si la página actual está permitida para el rol
        const allowedPages = config.roleAccess[userRole] || [];
        
        if (![...allowedPages, ...commonPages].includes(currentPath)) {
            const defaultRoutes = {
                'admin': 'dash.php',
                'cajero': 'crear-orden.php',
                'encargado': 'dash.php',
                'administracion': 'reportes.php',
                'cliente': 'perfil.php'
            };
            
            Swal.fire({
                title: 'Acceso denegado',
                text: 'No tienes permisos para acceder a esta sección',
                icon: 'error',
                confirmButtonText: 'Entendido'
            }).then(() => {
                window.location.href = defaultRoutes[userRole] || '../../VIEWS/Auth/login.php';
            });
        }
    }

    function initializeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const content = document.getElementById('content');
        const sidebarCollapse = document.getElementById('sidebarCollapse');
        const sidebarOverlay = document.querySelector('.sidebar-overlay');

        if (!sidebar || !content) return;

        const toggleSidebar = () => {
            if (window.innerWidth > 768) {
                sidebar.classList.toggle('collapsed');
                content.classList.toggle('collapsed');
            } else {
                const isShowing = !sidebar.classList.contains('show');
                sidebar.classList.toggle('show', isShowing);
                if (sidebarOverlay) {
                    sidebarOverlay.style.opacity = isShowing ? '1' : '0';
                    sidebarOverlay.style.visibility = isShowing ? 'visible' : 'hidden';
                }
                document.body.style.overflow = isShowing ? 'hidden' : '';
            }
        };

        if (sidebarCollapse) {
            sidebarCollapse.addEventListener('click', toggleSidebar);
        }

        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    toggleSidebar();
                }
            });
        }

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                sidebar.classList.remove('show');
                if (sidebarOverlay) {
                    sidebarOverlay.style.opacity = '0';
                    sidebarOverlay.style.visibility = 'hidden';
                }
                document.body.style.overflow = '';
            }
        });

        if (window.innerWidth <= 768) {
            sidebar.classList.add('collapsed');
        }
    }

    function setActiveMenuItem(currentPath) {
        document.querySelectorAll('.sidebar-item').forEach(item => {
            const link = item.querySelector('a');
            if (link) {
                const linkPath = link.getAttribute('href').split('/').pop();
                item.classList.toggle('active', currentPath === linkPath);
            }
        });
    }

    function displayUserInfo(userData, userRole) {
        const userPanel = document.querySelector('.user-panel');
        if (!userPanel || !userData.nombre) return;
        
        const roleNames = {
            'admin': 'Administrador',
            'cajero': 'Cajero',
            'encargado': 'Encargado',
            'administracion': 'Administración',
            'cliente': 'Cliente'
        };

        userPanel.innerHTML = `
            <div class="user-info">
                <h5>${userData.nombre} ${userData.apellido || ''}</h5>
                <small>${roleNames[userRole] || 'Usuario'}</small>
            </div>
            <div class="user-actions">
                <button id="logout-btn" class="btn btn-sm btn-outline-danger" title="Cerrar sesión">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
            </div>
        `;
    }

    function setupLogout() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                Swal.fire({
                    title: '¿Cerrar sesión?',
                    text: '¿Estás seguro de que deseas salir del sistema?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#f3a21f',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Sí, cerrar sesión',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Limpiar almacenamiento local
                        sessionStorage.clear();
                        localStorage.clear();
                        
                        // Forzar recarga sin caché
                        fetch('../../VIEWS/Auth/logout.php?' + new Date().getTime(), {
                            method: 'GET',
                            cache: 'no-store',
                            credentials: 'same-origin'
                        })
                        .then(() => {
                            // Redirigir con parámetro para evitar caché
                            window.location.href = '../../VIEWS/Auth/login.php?logout=' + new Date().getTime();
                        })
                        .catch(() => {
                            window.location.href = '../../VIEWS/Auth/login.php?logout=' + new Date().getTime();
                        });
                    }
                });
            });
        }
    }

    function setupRedirects(userRole, config) {
        document.querySelectorAll('.sidebar-item a').forEach(link => {
            link.addEventListener('click', function(e) {
                const linkPath = this.getAttribute('href').split('/').pop();
                const allowedPages = config.roleAccess[userRole] || [];
                
                // Permitir siempre al admin
                if (userRole === 'admin') {
                    return; // No hacer nada, permitir la navegación normal
                }
                
                // Verificar si la página está permitida para el rol
                if (!allowedPages.includes(linkPath)) {
                    e.preventDefault();
                    
                    const defaultRoutes = {
                        'admin': 'dash.php',
                        'cajero': 'crear-orden.php',
                        'encargado': 'dash.php',
                        'administracion': 'reportes.php',
                        'cliente': 'perfil.php'
                    };
                    
                    // Mostrar mensaje de error
                    Swal.fire({
                        title: 'Acceso denegado',
                        text: 'No tienes permisos para acceder a esta sección',
                        icon: 'error',
                        confirmButtonText: 'Entendido'
                    }).then(() => {
                        window.location.href = defaultRoutes[userRole] || '../../VIEWS/Auth/login.php';
                    });
                }
            });
        });
    }
});