<?php
ob_start(); // Activa el buffer de salida

// Incluir el archivo de verificación de sesión unificado
require_once '../Database/auth/check_session.php';

// Ahora puedes usar $_SESSION['userData'] en todo tu código
$user = isset($_SESSION['userData']) ? $_SESSION['userData'] : null;
?>
<!DOCTYPE html>

<html lang="es" data-bs-theme="light">
<head>
    <?php include '../includes/head.php'; ?>
    <title><?php echo htmlspecialchars($user['nombre']); ?> - Panel de Cliente</title>
</head>
<body>
    <?php include '../includes/preloader.php'; ?>
    <?php include '../includes/order-sidebar.php'; ?>
    
    <?php 
    // Modificar el top-bar para mostrar información del usuario
    include '../includes/top-bar.php'; 
    ?>
    
    <div id="content-client">
        <!-- El contenido se cargará dinámicamente aquí -->
        <div id="app-content"></div>
    </div>
    
    <?php include '../includes/footer.php'; ?>
    <?php include '../includes/floating-buttons.php'; ?>
    

    <script>
        // Pasar datos del usuario a JavaScript
        var userData = <?php echo json_encode($user); ?>;
        
        
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Usuario logueado:', userData);
            
            // -------------------------------
            // 1. Configuración del Carrusel
            // -------------------------------
            

            // -------------------------------
            // 2. Funcionalidad de Sidebar
            // -------------------------------
            // Cerrar sidebar
            document.getElementById('closeSidebar')?.addEventListener('click', closeSidebar);
            
            // Abrir sidebar (ejemplo)
            window.openSidebar = function() {
                document.getElementById('orderSidebar').classList.add('show');
                document.getElementById('sidebarOverlay').classList.add('show');
                document.body.classList.add('sidebar-open');
            };

            // Cerrar sidebar (función reutilizable)
            function closeSidebar() {
                document.getElementById('orderSidebar').classList.remove('show');
                document.getElementById('sidebarOverlay').classList.remove('show');
                document.body.classList.remove('sidebar-open');
            }

            // Cerrar al hacer clic en overlay
            document.getElementById('sidebarOverlay')?.addEventListener('click', closeSidebar);

            // -------------------------------
            // 3. Secciones Desplegables
            // -------------------------------
            document.querySelectorAll('[data-toggle="acompanantes"], [data-toggle="extras"], [data-toggle="bebidas"], [data-toggle="notas"]').forEach(header => {
                header.addEventListener('click', () => {
                    const card = header.closest('.card');
                    card.classList.toggle('expanded');
                    header.classList.toggle('collapsed');
                });
            });

            // -------------------------------
            // 5. Cambio de Tema (Opcional)
            // -------------------------------
            const themeToggle = document.getElementById('themeToggleClient');
            if (themeToggle) {
                themeToggle.addEventListener('change', function() {
                    document.documentElement.setAttribute(
                        'data-bs-theme', 
                        this.checked ? 'dark' : 'light'
                    );
                    localStorage.setItem('theme', this.checked ? 'dark' : 'light');
                });

                // Cargar preferencia guardada
                const savedTheme = localStorage.getItem('theme') || 'light';
                document.documentElement.setAttribute('data-bs-theme', savedTheme);
                if (themeToggle) {
                    themeToggle.checked = savedTheme === 'dark';
                }
            }
        });

        // -------------------------------
        // Funciones Globales
        // -------------------------------
        function showLoader() {
            document.getElementById('preloader').style.display = 'flex';
        }

        function hideLoader() {
            document.getElementById('preloader').style.display = 'none';
        }


        

        const userSessionData = <?php echo json_encode([
            'nombre' => htmlspecialchars($user['nombre'] ?? ''),
            'apellido' => htmlspecialchars($user['apellido'] ?? ''),
            'correo' => htmlspecialchars($user['correo'] ?? ''),
            'telefono' => htmlspecialchars($user['telefono'] ?? ''),
            'Cedula' => htmlspecialchars($user['Cedula'] ?? ''), // Mayúscula
            'Nacionalidad' => htmlspecialchars($user['Nacionalidad'] ?? 'V') // Mayúscula
        ]); ?>;

        // Ejemplo: Para usar en llamadas AJAX
        /*
        function fetchData() {
            showLoader();
            fetch('url')
                .then(response => response.json())
                .then(data => {
                    // Procesar datos
                })
                .finally(() => hideLoader());
        }
        */
    </script>
    <?php include '../includes/scripts.php'; ?>

</body>
</html>