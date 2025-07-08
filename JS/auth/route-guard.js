class RouteGuard {
    constructor() {
        this.rolePermissions = {
            'admin': ['*'],
            'cajero': ['crear-orden'],
            'encargado': ['crear-orden', 'ordenes', 'dashboard', 'promociones', 'productos', 'categorias', 'tasas-cambio', 'usuarios', 'configuraciones'],
            'administracion': ['tasas-cambio', 'reportes', 'ordenes', 'configuraciones'],
            'cliente': ['dashboard-menu', 'perfil', 'historial']
        };
        
        this.redirectMap = {
            'admin': 'configuraciones/dash.php',
            'cajero': 'configuraciones/crear-orden.php',
            'encargado': 'configuraciones/dashboard.php',
            'administracion': 'configuraciones/reportes.php',
            'cliente': '/VIEWS/index.php'
        };
    }

    getUserData() {
        try {
            // Primero verificar sessionStorage
            const sessionData = sessionStorage.getItem('userData');
            if (sessionData) {
                return JSON.parse(sessionData);
            }
            
            // Si no hay, verificar localStorage
            const backupData = localStorage.getItem('userDataBackup');
            if (backupData) {
                const parsedData = JSON.parse(backupData);
                sessionStorage.setItem('userData', backupData);
                return parsedData;
            }
            
            return null;
        } catch (e) {
            console.error('Error getting user data:', e);
            return null;
        }
    }

    checkPermission() {
        const userData = this.getUserData();
        
        // Si no hay usuario, redirigir a login
        if (!userData || !userData.rol) {
            this.redirectToLogin();
            return false;
        }

        const role = userData.rol.toLowerCase();
        const currentPage = window.location.pathname.split('/').pop();
        
        // Admin tiene acceso completo
        if (role === 'admin') return true;

        const permissions = this.rolePermissions[role] || [];
        const hasAccess = permissions.some(perm => 
            perm === '*' || currentPage.includes(perm)
        );

        if (!hasAccess) {
            this.redirectToDefault(role);
            return false;
        }

        return true;
    }

    redirectToLogin() {
        sessionStorage.removeItem('userData');
        localStorage.removeItem('userDataBackup');
        window.location.href = '../../VIEWS/Auth/login.php';
    }

    redirectToDefault(role) {
        const defaultPage = this.redirectMap[role] || 'Auth/login.php';
        window.location.href = `../../VIEWS/${defaultPage}`;
    }

    static init() {
        const guard = new RouteGuard();
        if (!guard.checkPermission()) {
            return false;
        }
        
        // Opcional: Cargar datos del usuario en la interfaz
        const userData = guard.getUserData();
        if (userData) {
            console.log('Usuario autenticado:', userData);
            // Aquí puedes actualizar la UI con los datos del usuario
        }
        
        return true;
    }
}

// Inicialización automática al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Solo inicializar si estamos en una página protegida
    if (!window.location.pathname.includes('login.php')) {
        RouteGuard.init();
    }
});