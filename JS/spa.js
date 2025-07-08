// Objeto que manejará el estado de la aplicación
const appState = {
    currentView: 'inicio',
    cart: [],
    isInitialLoad: true
};

// Rutas de la aplicación
const routes = {
    'inicio': 'vistas-cliente/inicio.php',
    'menu': 'vistas-cliente/menu.php',
    'historial': 'vistas-cliente/historial.php',
    'perfil': 'vistas-cliente/perfil.php'  // Nueva ruta

};


// Función para mostrar/ocultar el preloader
function showPreloader(show) {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.style.display = show ? 'flex' : 'none';
    }
}

async function loadView(viewName) {
    try {
        // Solo mostrar preloader en la carga inicial
        if (appState.isInitialLoad) {
            showPreloader(true);
        }
        
        // Actualizar el estado
        appState.currentView = viewName;
        
        const response = await fetch(routes[viewName]);
        const content = await response.text();
        
        const container = document.getElementById('app-content');
        container.innerHTML = content;

        

        // Disparar evento de cambio de vista
        const viewChangedEvent = new CustomEvent('spa-view-changed', {
            detail: { view: viewName }
        });
        document.dispatchEvent(viewChangedEvent);
        
        // Ejecutar scripts de la vista
        const scripts = container.querySelectorAll('script');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            if (script.src) {
                newScript.src = script.src;
            } else {
                newScript.textContent = script.textContent;
            }
            document.body.appendChild(newScript).parentNode.removeChild(newScript);
        });
        
        updateActiveNavLink(viewName);
        
        switch(viewName) {
            case 'inicio':
                cargarProductosDestacados();

                break;
            case 'menu':
                initMenuPage();
                break;
            case 'perfil':
                initProfilePage();
                break;
        }
        
        // Solo ocultar preloader en la carga inicial
        if (appState.isInitialLoad) {
            setTimeout(() => {
                showPreloader(false);
                appState.isInitialLoad = false; // Marcamos que ya pasó la carga inicial
            }, 300);
        }
        
    } catch (error) {
        console.error('Error al cargar la vista:', error);
        document.getElementById('app-content').innerHTML = `
            <div class="container mt-5">
                <div class="alert alert-danger">
                    Error al cargar la página. Por favor, intenta nuevamente.
                </div>
            </div>
        `;
        showPreloader(false);
    }
}

// Función para actualizar el enlace activo en el navbar
function updateActiveNavLink(viewName) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-view') === viewName) {
            link.classList.add('active');
        }
    });
}

// Función para manejar la navegación
function navigate(event) {
    event.preventDefault();
    const viewName = event.target.getAttribute('data-view');
    if (viewName && routes[viewName]) {
        // Cambiar la URL sin recargar la página
        history.pushState({ view: viewName }, '', `?view=${viewName}`);
        loadView(viewName);
    }
}



// Evento cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    // Mostrar preloader solo al inicio
    showPreloader(true);
    
    // Configurar listeners del navbar
    const navLinks = document.querySelectorAll('.nav-link[data-view]');
    navLinks.forEach(link => {
        link.addEventListener('click', navigate);
    });
    
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.view) {
            loadView(event.state.view);
        }
    });
    
    // Cargar vista inicial
    const urlParams = new URLSearchParams(window.location.search);
    const initialView = urlParams.get('view') || 'inicio';
    history.replaceState({ view: initialView }, '', `?view=${initialView}`);
    loadView(initialView);
});

// Función para agregar items al carrito (puedes llamarla desde cualquier vista)
function addToCart(product) {
    appState.cart.push(product);
    updateCartCount();
    // Aquí podrías también mostrar una notificación o actualizar la sidebar
}

// Función para actualizar el contador del carrito
function updateCartCount() {
    const count = appState.cart.length;
    document.querySelectorAll('.order-badge, .cart-btn .badge').forEach(badge => {
        badge.textContent = count;
    });
}