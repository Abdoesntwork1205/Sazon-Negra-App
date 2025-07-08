<!-- Bootstrap JS Bundle con Popper -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="../JS/configuraciones/generar-factura.js"></script>
<script>
  // Hacer disponible globalmente
  window.jspdf = window.jspdf || { jsPDF: window.jsPDF };
</script>



<!-- Script Personalizado -->
 <script src="../JS/dashboard/dashboard.js"></script>

<script src="../JS/funciones_cliente/obtener_destacados.js"></script>
<script src="../JS/funciones_cliente/get_categorias.js"></script>
<script src="../JS/funciones_cliente/cart.js"></script>

<!-- Script Checkout -->

<script src="../JS/checkout/checkout-main.js"></script>
<script src="../JS/checkout/chackout-geo.js"></script>
<script src="../JS/checkout/checkout-payments.js"></script>
<script src="../JS/checkout/checkout-steps.js"></script>
<script src="../JS/checkout/checkout-summary.js"></script>
<script src="../JS/checkout/checkout-submit.js"></script>
<script src="../JS/auth/logout.js"></script>

<!-- Script Historial -->
<script src="../JS/historial/historial.js" defer></script>
<script src="../JS/historial/detalles_pedido.js" defer></script>


<!-- Script Promociones -->
<script src="../JS/promociones/get_promociones.js" defer></script>

<!-- Script Perfil -->
<script src="../JS/perfil/perfil.js" defer></script>

<!-- Script Perfil -->
<script src="../JS/perfil/notifcations.js" defer></script>









<!-- Cart Scripts 
<script type="module" src="../JS/cart/cart-init.js"></script>
<script src="../JS/cart/cart-core.js"></script>
<script src="../JS/cart/cart-storage.js"></script>
<script src="../JS/cart/cart-ui.js"></script>
<script src="../JS/cart/cart-sidebar.js"></script>-->












<script src= "../JS/spa.js"></script>
<script>
    // Script para manejar la barra lateral del pedido
    document.addEventListener('DOMContentLoaded', function() {
        // Simular carga del preloader
        setTimeout(function() {
            document.querySelector('.preloader').style.display = 'none';
        }, 1500);
        
        // Elementos de la sidebar
        const sidebar = document.getElementById('orderSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        const openBtn = document.getElementById('openSidebar');
        const closeBtn = document.getElementById('closeSidebar');
        const continueBtn = document.getElementById('continueShopping');
        
        // Función para abrir la sidebar
        function openSidebar() {
            sidebar.classList.add('show');
            overlay.classList.add('show');
            document.body.classList.add('sidebar-open');
        }
        
        // Función para cerrar la sidebar
        function closeSidebar() {
            sidebar.classList.remove('show');
            overlay.classList.remove('show');
            document.body.classList.remove('sidebar-open');
        }
        
        // Event listeners
        openBtn.addEventListener('click', openSidebar);
        closeBtn.addEventListener('click', closeSidebar);
        continueBtn.addEventListener('click', closeSidebar);
        overlay.addEventListener('click', closeSidebar);
        
        // Actualizar contador del pedido
        function updateOrderCount() {
            const count = 2; // Esto debería venir de tu lógica de carrito
            document.querySelector('.order-badge').textContent = count;
        }
        
        updateOrderCount();
        
        // Manejar el cambio de cantidad de productos
        document.querySelectorAll('.btn-outline-secondary').forEach(btn => {
            btn.addEventListener('click', function() {
                // Lógica para aumentar/disminuir cantidad
                // Aquí iría tu código para actualizar las cantidades y el total
            });
        });

        // Manejar selección de acompañantes
        document.querySelectorAll('.acompanantes-container input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                // Aquí iría la lógica para actualizar el precio
                console.log('Acompañante seleccionado:', this.id, this.checked);
                // Deberías actualizar el total aquí
            });
        });
        
        // Manejar eliminación de items con animación
        document.querySelectorAll('.btn-link.text-danger').forEach(btn => {
            btn.addEventListener('click', function() {
                const item = this.closest('.order-item');
                item.classList.add('removing');
                setTimeout(() => {
                    item.remove();
                    // Actualizar el total y el contador del carrito
                    updateOrderTotal();
                }, 300);
            });
        });
        
        // Función para actualizar el total
        function updateOrderTotal() {
            // Lógica para calcular el total basado en:
            // - Productos
            // - Cantidades
            // - Acompañantes seleccionados
            console.log('Actualizando total...');
        }

        
    });

    // Toggle para los botones de redes sociales flotantes
document.getElementById('toggleSocial').addEventListener('click', function() {
    document.querySelector('.floating-social-container').classList.toggle('show');
});

// Cerrar los botones sociales al hacer clic fuera
document.addEventListener('click', function(e) {
    const socialContainer = document.querySelector('.floating-social-container');
    if (!socialContainer.contains(e.target) && e.target.id !== 'toggleSocial') {
        socialContainer.classList.remove('show');
    }
});



</script>