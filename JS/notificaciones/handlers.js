// handlers.js actualizado

// Manejar clic en "Ver todos los pedidos por confirmar"
$(document).on('click', '#viewAllPending', function(e) {
    e.preventDefault();
    
    const ordenesPath = '/proyecto_sazon_negra/VIEWS/configuraciones/ordenes.php';
    
    if (window.location.pathname.includes('ordenes')) {
        $('#statusFilter').val('por_confirmar');
        $('#searchId').val('');
        $('#deliveryFilter').val('0');
        $('#startDate').val('');
        $('#endDate').val('');
        $('#filterForm').trigger('submit');
        
        $('html, body').animate({
            scrollTop: $('#ordersTable').offset().top - 20
        }, 300);
    } else {
        window.location.href = ordenesPath + '?filter=por_confirmar';
    }
});

// Manejar parámetro de filtro al cargar la página
$(document).ready(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');
    
    if (filterParam === 'por_confirmar' && $('#statusFilter').length) {
        $('#statusFilter').val('por_confirmar');
        $('#searchId').val('');
        $('#deliveryFilter').val('0');
        $('#startDate').val('');
        $('#endDate').val('');
        $('#filterForm').trigger('submit');
    }
});

// Manejar clic en una notificación individual
$(document).on('click', '.notification-item', function(e) {
    e.preventDefault();
    const orderId = $(this).data('order-id');
    
    // Verificar si la función showOrderDetails está disponible
    if (typeof showOrderDetails === 'function') {
        showOrderDetails(orderId);
    } else {
        console.error('La función showOrderDetails no está disponible');
        // Fallback: redirigir a la página de detalles
        window.location.href = `detalle_pedido.php?id=${orderId}`;
    }
});

// Opcional: Si necesitas acceso a la función desde otros lugares
window.mostrarDetallesPedido = function(orderId) {
    if (typeof showOrderDetails === 'function') {
        showOrderDetails(orderId);
    } else {
        console.error('La función showOrderDetails no está disponible');
    }
};