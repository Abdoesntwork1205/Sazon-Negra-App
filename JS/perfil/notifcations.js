// Función para verificar notificaciones
function checkNotifications() {
    $.ajax({
        url: '../Database/perfil/check_notification.php',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                // Obtener el estado actual de localStorage
                const notificationState = JSON.parse(localStorage.getItem('notificationState') || '{}');
                
                // Si es la primera vez, inicializar
                if (!notificationState.lastUpdate) {
                    notificationState.lastUpdate = new Date().toISOString();
                    notificationState.viewedIds = [];
                }
                
                // Filtrar solo notificaciones no vistas
                const newNotifications = response.notificaciones.filter(notif => 
                    !notificationState.viewedIds.includes(notif.id)
                );
                
                // Actualizar UI
                updateNotificationUI({
                    ...response,
                    count: newNotifications.length
                });
                
                // Guardar todos los IDs de notificaciones actuales
                const allIds = response.notificaciones.map(n => n.id);
                localStorage.setItem('notificationState', JSON.stringify({
                    ...notificationState,
                    allIds: allIds,
                    lastUpdate: new Date().toISOString()
                }));
            }
        },
        error: function(xhr, status, error) {
            console.error('Error al cargar notificaciones:', error);
        }
    });
}

// Actualizar la interfaz de notificaciones
function updateNotificationUI(response) {
    const $badge = $('#notificationCount');
    const $list = $('#notificationsList');
    
    // Actualizar contador
    $badge.text(response.count).toggleClass('d-none', response.count === 0);
    
    // Animación si hay notificaciones nuevas
    if (response.count > 0) {
        $badge.addClass('pulse');
    } else {
        $badge.removeClass('pulse');
    }
    
    // Limpiar lista
    $list.find('li:not(.notification-header)').remove();
    
    if (response.notificaciones.length === 0) {
        $list.append('<li><div class="notification-empty">No hay notificaciones nuevas</div></li>');
        return;
    }
    
    response.notificaciones.forEach(notif => {
        const iconClass = notif.estado === 'confirmado' ? 'text-success' : 'text-danger';
        const icon = notif.estado === 'confirmado' ? 'fa-check-circle' : 'fa-times-circle';
        
        $list.append(`
            <li class="notification-item">
                <div class="notification-icon-container ${iconClass}">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-message">${notif.mensaje}</div>
                    <div class="notification-time">${formatDate(notif.fecha)}</div>
                </div>
            </li>
        `);
    });
}

// Limpiar notificaciones
$('#clearNotifications').on('click', function(e) {
    e.stopPropagation();
    markNotificationsAsRead();
    $('#notificationsList').find('li:not(.notification-header)').remove();
    $('#notificationsList').append('<li><div class="notification-empty">No hay notificaciones</div></li>');
});

// Función para marcar como vistas
function markNotificationsAsViewed() {
    const currentState = JSON.parse(localStorage.getItem('notificationsState') || {});
    
    // Marcar todas las notificaciones existentes como vistas
    localStorage.setItem('notificationsState', JSON.stringify({
        ...currentState,
        viewedNotifications: currentState.allNotifications || []
    }));
    
    // Actualizar UI
    $('#notificationCount').text('0').addClass('d-none');
}

// Función para marcar notificaciones como leídas
function markNotificationsAsRead() {
    const state = JSON.parse(localStorage.getItem('notificationState') || {});
    
    // Marcar todas las notificaciones actuales como vistas
    localStorage.setItem('notificationState', JSON.stringify({
        ...state,
        viewedIds: state.allIds || []
    }));
    
    // Actualizar el contador en la UI
    $('#notificationCount').text('0').addClass('d-none');
}

// Formatear fecha para mostrar
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Mostrar notificación emergente
function showToastNotification(notificacion) {
    const lastShownId = localStorage.getItem('lastShownNotif');
    if (lastShownId && lastShownId === notificacion.id.toString()) return;
    
    Toastify({
        text: notificacion.mensaje,
        duration: 5000,
        gravity: "top",
        position: "right",
        backgroundColor: notificacion.estado === 'confirmado' ? "#28a745" : "#dc3545",
        stopOnFocus: true,
        onClick: function() {
            // Redirigir al historial al hacer clic
            window.location.href = '?view=historial';
        }
    }).showToast();
    
    localStorage.setItem('lastShownNotif', notificacion.id);
}

// Inicializar el sistema
function initNotificationSystem() {
    // Verificar al cargar la página
    checkNotifications();
    
    // Marcar como leídas al abrir el dropdown
    $('#notificationsDropdown').on('show.bs.dropdown', markNotificationsAsRead);
    
    // Verificar cada 30 segundos
    setInterval(checkNotifications, 30000);
}


// Iniciar cuando el DOM esté listo
$(document).ready(initNotificationSystem);