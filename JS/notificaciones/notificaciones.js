class Notificaciones {
    constructor() {
        this.initElements();
        this.initEvents();
        this.loadPendingConfirmations();
        this.startAutoRefresh();
        this.refreshInterval = null; // Almacenar el intervalo para poder limpiarlo
    }

    initElements() {
        this.notificationsList = $('#notificationsList');
        this.notificationCount = $('#notificationCount');
    }

    initEvents() {
        $(document).on('click', '.notification-item', (e) => this.handleNotificationClick(e));
        $(document).on('click', '#viewAllPending', (e) => this.handleViewAllClick(e));
    }

    loadPendingConfirmations() {
        $.ajax({
            url: '../../Database/configuraciones/notificaciones/obtener_por_confirmar.php',
            type: 'GET',
            dataType: 'json',
            success: (response) => this.updateNotificationsUI(response),
            error: (xhr, status, error) => console.error('Error al cargar notificaciones:', error)
        });
    }

    updateNotificationsUI(response) {
        // Limpiar lista excepto el encabezado
        this.notificationsList.find('li:not(:first)').remove();
        
        if(response.success && response.data.length > 0) {
            this.notificationCount.text(response.data.length > 9 ? '9+' : response.data.length);
            
            response.data.forEach(order => {
                const formattedAmount = new Intl.NumberFormat('es-VE', {
                    style: 'currency',
                    currency: 'USD'
                }).format(order.monto_total || 0);

                const notificationItem = `
                    <li class="w-100">
                        <div class="dropdown-item notification-item" data-order-id="${order.id}">
                            <div class="notification-content w-100">
                                <div class="notification-header">
                                    <span class="notification-id">Pedido #${order.id}</span>
                                    <span class="notification-time">${order.fecha_pedido}</span>
                                </div>
                                <div class="notification-client-info">
                                    <div class="notification-client-details">
                                        <span class="notification-client-name">${order.cliente_nombre}</span>
                                        <span class="notification-client-id">C.I. ${order.cliente_cedula}</span>
                                    </div>
                                    <div class="notification-amount">
                                        <span class="notification-amount-label">Total</span>
                                        <span class="notification-amount-value">${formattedAmount}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                `;
                this.notificationsList.append(notificationItem);
            });
            
            // Agregar pie con "Ver todos"
            this.notificationsList.append(`
                <li class="notification-footer w-100">
                    <a href="#" id="viewAllPending">
                        <i class="fas fa-list"></i> Ver todos los pedidos por confirmar
                    </a>
                </li>
            `);
        } else {
            this.notificationCount.text('0');
            this.notificationsList.append(`
                <li class="w-100"><div class="dropdown-item no-notifications">No hay pedidos por confirmar</div></li>
            `);
        }
    }

    handleNotificationClick(e) {
        const orderId = $(e.currentTarget).data('order-id');
        // Disparar evento personalizado para que otras páginas lo manejen
        $(document).trigger('notification:order-clicked', [orderId]);
    }

    handleViewAllClick(e) {
        e.preventDefault();
        // Disparar evento personalizado para que otras páginas lo manejen
        $(document).trigger('notification:view-all-pending');
    }

    startAutoRefresh() {
        // Limpiar intervalo existente si hay uno
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        // Establecer nuevo intervalo de 20 segundos (20000 milisegundos)
        this.refreshInterval = setInterval(() => this.loadPendingConfirmations(), 20000);
    }

    // Método público para actualizar manualmente
    refresh() {
        this.loadPendingConfirmations();
    }
}

// Inicialización cuando el DOM esté listo
$(document).ready(() => {
    window.notificaciones = new Notificaciones();
});


//animacion

document.addEventListener('DOMContentLoaded', function() {
    const notificationsDropdown = document.getElementById('notificationsDropdown');
    const notificationsList = document.getElementById('notificationsList');
    
    // Actualizar clase cuando hay notificaciones
    function updateNotificationBadge(count) {
        const badge = document.getElementById('notificationCount');
        const container = document.querySelector('.notifications');
        
        badge.textContent = count;
        
        if (count > 0) {
            container.classList.add('has-notifications');
            // Agregar animación solo si es una nueva notificación
            if (parseInt(badge.textContent) < count) {
                const icon = document.querySelector('.notification-icon');
                icon.style.animation = 'none';
                void icon.offsetHeight; // Trigger reflow
                icon.style.animation = 'bell-shake 0.5s ease-in-out';
            }
        } else {
            container.classList.remove('has-notifications');
        }
    }
    
    // Ejemplo de cómo actualizar las notificaciones
    // updateNotificationBadge(3);
    
    // Efecto hover para el icono
    notificationsDropdown.addEventListener('mouseenter', function() {
        const icon = document.querySelector('.notification-icon');
        icon.style.transform = 'scale(1.1)';
    });
    
    notificationsDropdown.addEventListener('mouseleave', function() {
        const icon = document.querySelector('.notification-icon');
        icon.style.transform = 'scale(1)';
    });
    
    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', function(event) {
        if (!notificationsDropdown.contains(event.target) && !notificationsList.contains(event.target)) {
            const dropdown = bootstrap.Dropdown.getInstance(notificationsDropdown);
            if (dropdown) {
                dropdown.hide();
            }
        }
    });
});