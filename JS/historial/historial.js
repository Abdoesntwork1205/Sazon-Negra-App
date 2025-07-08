
function obtenerClaseEstado(estado) {
    const clases = {
        'confirmado': 'bg-success',
        'por_confirmar': 'bg-warning text-dark',
        'cancelado': 'bg-danger'
    };
    return clases[estado] || 'bg-secondary';
}

function obtenerClaseEntrega(esDelivery) {
    return esDelivery ? 'bg-primary' : 'bg-secondary'; // Azul para delivery, gris para local
}

function obtenerEstadoPreparacion(estado) {
    return estado === 'por_confirmar' ? 'En proceso' : 'Listo';
}

function obtenerClasePreparacion(estado) {
    return estado === 'por_confirmar' ? 'bg-info' : 'bg-success';
}

function renderizarPedidos(pedidos) {
    if (!pedidos || !pedidos.length) {
        $('#historial-body').html('');
        $('#no-pedidos').show();
        return;
    }

    const html = pedidos.map(pedido => {
        const esDelivery = pedido.delivery === 'si';
        const textoEstado = pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1).replace('_', ' ');
        const textoEntrega = esDelivery ? 'Delivery' : 'Recogida';
        const textoPreparacion = obtenerEstadoPreparacion(pedido.estado);
        
        return `
        <tr>
            <td><strong>#${pedido.id}</strong></td>
            <td>${pedido.fecha}</td>
            <td>$${pedido.total}</td>
            <td>${pedido.metodo_pago}</td>
            <td>
                <span class="badge ${obtenerClaseEstado(pedido.estado)} me-1">
                    ${textoEstado}
                </span>
                <span class="badge ${obtenerClaseEntrega(esDelivery)} me-1">
                    ${textoEntrega}
                </span>
                <span class="badge ${obtenerClasePreparacion(pedido.estado)}">
                    ${textoPreparacion}
                </span>
            </td>
            <td class="text-center">
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-secondary btn-details" data-pedido-id="${pedido.id}">
                        <i class="fas fa-eye me-1"></i> Detalles
                    </button>
                </div>
            </td>
        </tr>
        `;
    }).join('');

    $('#historial-body').html(html);
    $('#no-pedidos').hide();
    
    
    // Initialize button actions
    $('.btn-repeat').off('click').on('click', function() {
        const pedidoId = $(this).data('pedido-id');
        // Add your repeat order logic here
    });
    
    $('.btn-details').off('click').on('click', function() {
        const pedidoId = $(this).data('pedido-id');
        // Add your order details logic here
    });
}

function mostrarError() {
    $('#historial-body').html(`
        <tr>
            <td colspan="6" class="text-center text-danger py-3">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Error al cargar el historial
            </td>
        </tr>
    `);
}

function cargarHistorial() {
    try {
        const estado = $('#filterEstado').val() || 'all';
        const orden = $('#filterOrden').val() || 'recientes';

        // Mostrar loader con más duración
        $('#historial-body').html(`
            <tr>
                <td colspan="6" class="text-center">
                    <div class="spinner-border text-primary my-4" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <p class="text-muted mt-2">Cargando tu historial de pedidos...</p>
                </td>
            </tr>
        `);
        $('#no-pedidos').hide();

        // Forzar un mínimo de tiempo de visualización del loader (1.5 segundos)
        const loaderStartTime = Date.now();
        const minLoaderTime = 1500; // 1.5 segundos

        $.ajax({
            url: '../Database/historial/historial_pedidos.php',
            type: 'GET',
            data: { estado, orden },
            success: (response) => {
                const elapsed = Date.now() - loaderStartTime;
                const remainingTime = Math.max(0, minLoaderTime - elapsed);

                setTimeout(() => {
                    if (response?.success) {
                        renderizarPedidos(response.data);
                    } else {
                        mostrarError();
                        console.error('Respuesta inválida:', response);
                    }
                }, remainingTime);
            },
            error: (xhr, status, error) => {
                const elapsed = Date.now() - loaderStartTime;
                const remainingTime = Math.max(0, minLoaderTime - elapsed);

                setTimeout(() => {
                    mostrarError();
                }, remainingTime);
            }
        });
    } catch (error) {
        mostrarError();
    }
}

function initHistorial() {
    console.log('Intentando inicializar historial...');
    
    // Verificar si estamos en la vista correcta
    if (!window.location.search.includes('view=historial')) {
        return;
    }

    // Verificar si los filtros existen
    if (!$('#filterEstado').length || !$('#filterOrden').length) {
        setTimeout(initHistorial, 300);
        return;
    }

    cargarHistorial();
    
    // Configurar eventos de los filtros
    $('#filterEstado, #filterOrden').off('change').on('change', cargarHistorial);
    
    // Configurar botón de "no hay pedidos"
    $('#no-pedidos button').off('click').on('click', () => {
        if (typeof loadView === 'function') {
            loadView('menu');
        }
    });
}

// Sistema de espera mejorado
function waitForHistorialView() {
    // Verificar cada 100ms si estamos en la vista de historial
    const checkInterval = setInterval(() => {
        if (window.location.search.includes('view=historial')) {
            clearInterval(checkInterval);
            
            // Esperar a que jQuery esté listo
            if (typeof $ !== 'undefined') {
                initHistorial();
            } else {
                setTimeout(initHistorial, 100);
            }
        }
    }, 100);
}

// Inicialización mejorada
if (document.readyState === 'complete') {
    waitForHistorialView();
} else {
    document.addEventListener('DOMContentLoaded', waitForHistorialView);
    window.addEventListener('load', waitForHistorialView);
}

// Escuchar eventos de cambio de vista del SPA
document.addEventListener('spa-view-changed', (event) => {
    if (event.detail.view === 'historial') {
        setTimeout(initHistorial, 50); // Pequeño retraso para asegurar que el DOM está listo
    }
});