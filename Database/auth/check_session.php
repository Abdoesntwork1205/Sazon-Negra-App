<?php
session_start();

// Buffer de salida para evitar problemas
ob_start();

// Verificar si el usuario está logueado (compatible con ambos sistemas)
if (!isset($_SESSION['userData'])) {
        // Si no hay userData, verificar el sistema antiguo
        // Convertir el sistema antiguo al nuevo formato
        if (isset($_SESSION['user'])) {
            $_SESSION['userData'] = [
                'id' => $_SESSION['user']['id'] ?? 0,
                'nombre' => $_SESSION['user']['nombre'] ?? '',
                'correo' => $_SESSION['user']['correo'] ?? '',
                'tipo' => $_SESSION['user']['tipo'] ?? 'clientes',
                'rol' => $_SESSION['user']['rol'] ?? 'cliente'
            ];
        }
}

// Definir permisos por rol (compatible con ambos sistemas)
$rolePermissions = [
    'admin' => ['*'], // Acceso total
    'cajero' => ['crear-orden', 'ordenes', 'perfil'],
    'encargado' => ['crear-orden', 'orden', 'ordenes', 'dashboard', 'productos', 'categorias', 'tasas-cambio', 'usuarios', 'configuraciones', 'perfil'],
    'administracion' => ['tasas-cambio', 'reportes', 'ordenes', 'configuraciones', 'perfil'],
    'cliente' => ['index']
];

// Obtener información del usuario desde la sesión unificada
$userRole = strtolower($_SESSION['userData']['rol'] ?? '');
$currentPage = basename($_SERVER['PHP_SELF']);

// Guardar el ID del usuario en la sesión para fácil acceso
if (isset($_SESSION['userData']['id'])) {
    $_SESSION['usuario_id'] = $_SESSION['userData']['id'];
}

// Mapeo de páginas a permisos requeridos
$pagePermissions = [
    'dashboard.php' => 'dashboard',
    'dash.php' => 'dashboard',
    'crear-orden.php' => 'crear-orden',
    'orden.php' => 'orden',
    'ordenes.php' => 'ordenes',
    'productos.php' => 'productos',
    'categorias.php' => 'categorias',
    'tasas.php' => 'tasas-cambio',
    'usuarios.php' => 'usuarios',
    'configuraciones.php' => 'configuraciones',
    'reportes.php' => 'reportes',
    'perfil.php' => 'perfil',
    'historial.php' => 'historial',
    'promociones.php' => 'promociones',
    'index.php' => 'index'
];

// Verificar acceso a la página actual
if (array_key_exists($currentPage, $pagePermissions)) {
    $requiredPermission = $pagePermissions[$currentPage];
    $userPermissions = $rolePermissions[$userRole] ?? [];
    
    if ($userRole !== 'admin' && !in_array('*', $userPermissions) && !in_array($requiredPermission, $userPermissions)) {
        ob_end_clean();
        $defaultRoutes = [
            'admin' => '../configuraciones/dash.php',
            'cajero' => '../configuraciones/crear-orden.php',
            'encargado' => '../configuraciones/dashboard.php',
            'administracion' => '../configuraciones/reportes.php',
            'cliente' => '../../VIEWS/index.php'
        ];
        
        $redirectPage = $defaultRoutes[$userRole] ?? null;
        if($redirectPage) {
            header("Location: $redirectPage");
            exit();
        }
    }
}

// Limpiar buffer y guardar datos para frontend
ob_end_clean();
$_SESSION['userPermissions'] = $rolePermissions[$userRole] ?? [];
$_SESSION['userRole'] = $userRole;

// Guardar datos en sessionStorage para JavaScript
echo '<script>';
echo 'sessionStorage.setItem("userData", \'' . json_encode($_SESSION['userData'] ?? []) . '\');';
echo 'sessionStorage.setItem("userPermissions", \'' . json_encode($_SESSION['userPermissions'] ?? []) . '\');';
echo 'sessionStorage.setItem("userRole", \'' . ($_SESSION['userRole'] ?? '') . '\');';
echo 'sessionStorage.setItem("userId", \'' . ($_SESSION['usuario_id'] ?? '') . '\');';
echo '</script>';
?>