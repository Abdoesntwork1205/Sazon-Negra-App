// Función para resetear los filtros a sus valores predeterminados
function resetFilters() {
    $('#searchId').val(''); // Limpiar búsqueda
    $('#deliveryFilter').val(''); // Todos los tipos de delivery
    $('#statusFilter').val(''); // Todos los estados
    $('#startDate').val(''); // Limpiar fecha inicio
    $('#endDate').val(''); // Limpiar fecha fin
    
    // Resetear los datepickers si están inicializados
    if ($("#startDate").data('flatpickr')) {
        $("#startDate").flatpickr().clear();
    }
    if ($("#endDate").data('flatpickr')) {
        $("#endDate").flatpickr().clear();
    }
}

// Función para cargar pedidos con paginación de 10 filas
// Función para cargar pedidos con filtros corregidos
function loadOrders(page = 1, showToast = false, isFilter = false) {
    const filters = {
        searchId: $('#searchId').val(),
        deliveryFilter: $('#deliveryFilter').val(),
        statusFilter: $('#statusFilter').val(),
        startDate: $('#startDate').val() ? formatDateForDB($('#startDate').val()) : '',
        endDate: $('#endDate').val() ? formatDateForDB($('#endDate').val()) + ' 23:59:59' : '',
        page: page,
        per_page: 10 // Añadir este parámetro para forzar 10 items por página
    };
    // Mostrar indicador de carga
$('#ordersTableBody').html('<tr><td colspan="6" class="text-center py-4"><div class="spinner-border text-primary" role="status"></div></td></tr>');

    $.ajax({
        url: '../../Database/configuraciones/ordenes/traer_ordenes.php',
        method: 'GET',
        data: filters,
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                if (response.data.length > 0) {
                    renderOrders(response.data);
                    updatePagination(response.pagination);
                    
                    if(showToast) {
                        const toastMessage = isFilter ? 'Datos filtrados correctamente' : 'Datos actualizados';
                        showToastNotification('success', toastMessage);
                    }
                } else {
                    $('#ordersTableBody').html('<tr><td colspan="6" class="text-center py-4">No se encontraron pedidos</td></tr>');
                    $('#pagination').empty();
                    if(isFilter) {
                        showToastNotification('info', 'No se encontraron resultados con los filtros aplicados');
                    }
                }
            } else {
                console.error('Error:', response.error);
                $('#ordersTableBody').html('<tr><td colspan="6" class="text-center py-4 text-danger">Error al cargar los pedidos</td></tr>');
                showToastNotification('error', 'Error al cargar los pedidos');
            }
        },
        error: function(xhr, status, error) {
            console.error('AJAX Error:', error);
            $('#ordersTableBody').html(`<tr><td colspan="6" class="text-center py-4 text-danger">Error: ${xhr.statusText}</td></tr>`);
            showToastNotification('error', 'Error de conexión al servidor');
        }
    });
}

// Función para mostrar notificaciones Toast
function showToastNotification(icon, title) {
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: icon,
        title: title,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
    });
}

// Función para formatear fecha de DD/MM/YYYY a YYYY-MM-DD
function formatDateForDB(dateString) {
    if (!dateString) return '';
    const parts = dateString.split('/');
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

// Función para renderizar pedidos con formato mejorado
// Función para renderizar pedidos con formato mejorado
function renderOrders(orders) {
    const tbody = $('#ordersTableBody');
    tbody.empty();

    orders.forEach(order => {
        // Badge de delivery - mostrar siempre (Local o Delivery)
        const deliveryBadge = order.delivery === 'si' ? 
            '<span class="badge bg-info">Delivery</span>' : 
            '<span class="badge bg-secondary">Local</span>';
        
        const formattedStatus = formatStatus(order.status);
        const statusClass = getStatusClass(formattedStatus);
        
        // Determinar si mostrar el botón de confirmar (solo si el estado es "por confirmar")
        const showConfirmButton = formattedStatus.toLowerCase() === 'por confirmar';
        
        const row = `
        <tr data-order-id="${order.id}">
            <td>${order.id}</td>
            <td>${order.client_cedula}<br><small>${order.client_name}</small></td>
            <td>$${order.total}</td>
            <td>${formatPaymentType(order.payment_type)}</td>
            <td>
                <span class="badge ${statusClass}">${formattedStatus}</span>
                ${deliveryBadge}
            </td>
            <td class="text-end">
                <div class="dropdown">
                    <button class="btn btn-sm btn-actions dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item action-btn" href="#" data-action="invoice"><i class="fas fa-file-invoice me-2"></i>Factura</a></li>
                        <li><a class="dropdown-item action-btn" href="#" data-action="details"><i class="fas fa-info-circle me-2"></i>Detalles</a></li>
                        <li><a class="dropdown-item action-btn" href="#" data-action="edit"><i class="fas fa-edit me-2"></i>Editar</a></li>
                        ${showConfirmButton ? 
                        `<li><a class="dropdown-item action-btn text-success" href="#" data-action="confirm">
                            <i class="fas fa-check-circle me-2"></i>Confirmar
                        </a></li>` : ''}
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item action-btn text-danger" href="#" data-action="delete"><i class="fas fa-trash-alt me-2"></i>Cancelado</a></li>
                    </ul>
                </div>
            </td>
        </tr>
        `;
        tbody.append(row);
    });
}
// Funciones auxiliares mejoradas
function getStatusClass(status) {
    // Convertir a minúsculas y normalizar
    const normalizedStatus = status.toLowerCase().trim();
    
    switch(normalizedStatus) {
        case 'confirmado': 
            return 'bg-success';
        case 'por confirmar': 
            return 'bg-warning text-dark';
        case 'cancelado': 
            return 'bg-danger';
        default: 
            return 'bg-secondary'; // Para cualquier otro caso no esperado
    }
}

function formatStatus(status) {
    // Normalizar los estados permitidos
    const normalized = status.toLowerCase().trim();
    
    // Mapear a los estados permitidos
    switch(normalized) {
        case 'confirmado':
        case 'por confirmar':
        case 'cancelado':
            return normalized.charAt(0).toUpperCase() + normalized.slice(1);
        default:
            return 'Por confirmar'; // Valor por defecto si no coincide
    }
}

function formatPaymentType(paymentType) {
    // Reemplazar todos los _ por espacios y capitalizar
    return paymentType.replace(/_/g, ' ')
                     .replace(/\b\w/g, l => l.toUpperCase());
}

function updatePagination(pagination) {
    const paginationContainer = $('#pagination');
    paginationContainer.empty();

    if (pagination.last_page <= 1) return;

    // Botón Anterior
    paginationContainer.append(`
        <li class="page-item ${pagination.current_page === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${pagination.current_page - 1}">Anterior</a>
        </li>
    `);

    // Números de página
    const maxPagesToShow = 5; // Máximo de páginas a mostrar en la paginación
    let startPage, endPage;
    
    if (pagination.last_page <= maxPagesToShow) {
        startPage = 1;
        endPage = pagination.last_page;
    } else {
        const half = Math.floor(maxPagesToShow / 2);
        if (pagination.current_page <= half + 1) {
            startPage = 1;
            endPage = maxPagesToShow;
        } else if (pagination.current_page >= pagination.last_page - half) {
            startPage = pagination.last_page - maxPagesToShow + 1;
            endPage = pagination.last_page;
        } else {
            startPage = pagination.current_page - half;
            endPage = pagination.current_page + half;
        }
    }

    // Mostrar primera página si no está visible
    if (startPage > 1) {
        paginationContainer.append(`
            <li class="page-item">
                <a class="page-link" href="#" data-page="1">1</a>
            </li>
            ${startPage > 2 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
        `);
    }

    // Mostrar páginas
    for (let i = startPage; i <= endPage; i++) {
        paginationContainer.append(`
            <li class="page-item ${i === pagination.current_page ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `);
    }

    // Mostrar última página si no está visible
    if (endPage < pagination.last_page) {
        paginationContainer.append(`
            ${endPage < pagination.last_page - 1 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
            <li class="page-item">
                <a class="page-link" href="#" data-page="${pagination.last_page}">${pagination.last_page}</a>
            </li>
        `);
    }

    // Botón Siguiente
    paginationContainer.append(`
        <li class="page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${pagination.current_page + 1}">Siguiente</a>
        </li>
    `);
}

// Inicialización
$(document).ready(function() {
    // Cargar datos iniciales
    loadOrders();
    
    // Manejar el envío del formulario de filtros
    $('#filterForm').on('submit', function(e) {
        e.preventDefault();
        loadOrders(1, true, true); // Mostrar toast al filtrar
    });
    
    // Manejar clics en la paginación
    $(document).on('click', '.page-link', function(e) {
        e.preventDefault();
        const page = $(this).data('page');
        loadOrders(page);
    });
    
    // Manejar el botón de refrescar - ahora resetea los filtros
    $('#refreshBtn').click(function() {
        resetFilters(); // Resetear todos los filtros
        loadOrders(1, true); // Cargar primera página con datos frescos
    });
    
    // Recarga automática cada 30 segundos
    setInterval(function() {
        loadOrders($('#pagination .page-item.active').text() || 1);
    }, 30000);

    // Configuración del calendario
    const datepickerConfig = {
        dateFormat: "d/m/Y",
        locale: {
            firstDayOfWeek: 1,
            weekdays: {
                shorthand: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
                longhand: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
            },
            months: {
                shorthand: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                longhand: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
            }
        },
        theme: "light",
        allowInput: true,
        clickOpens: true,
        static: true
    };

    const startDate = $("#startDate").flatpickr({
        ...datepickerConfig,
        onChange: function(selectedDates) {
            endDate.set('minDate', selectedDates[0] || new Date());
        }
    });

    const endDate = $("#endDate").flatpickr({
        ...datepickerConfig,
        onChange: function(selectedDates) {
            startDate.set('maxDate', selectedDates[0] || new Date().fp_incr(365));
        }
    });
});




//////////////////////////////
//FUNCIONES PARA DROPDOWN////

function setupActionButtons() {
    $(document).on('click', '.action-btn', function(e) {
        e.preventDefault();
        const action = $(this).data('action');
        const orderId = $(this).closest('tr').data('order-id');
        
        switch(action) {
            case 'invoice':
                generateInvoice(orderId);
                break;
            case 'details':
                showOrderDetails(orderId);
                break;
            case 'delete':
                cancelOrder(orderId);
                break;
            case 'confirm':
                confirmOrder(orderId);
                break;
            case 'edit':
                // Se implementará posteriormente
                break;
        }
    });
}

// Función para cancelar un pedido
function cancelOrder(orderId) {
    Swal.fire({
        title: '¿Cancelar este pedido?',
        text: "El pedido cambiará a estado 'Cancelado'",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'No, volver'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '../../Database/configuraciones/ordenes/cancelar_pedido.php',
                method: 'POST',
                data: { order_id: orderId },
                dataType: 'json',
                success: function(response) {
                    if (response.success) {
                        showToastNotification('success', 'Pedido cancelado');
                        loadOrders($('#pagination .page-item.active').text() || 1);
                    } else {
                        showToastNotification('error', response.error || 'Error al cancelar el pedido');
                    }
                },
                error: function(xhr) {
                    showToastNotification('error', 'Error de conexión: ' + xhr.statusText);
                }
            });
        }
    });
}


function confirmOrder(orderId) {
    Swal.fire({
        title: '¿Confirmar este pedido?',
        text: "El pedido cambiará a estado 'Confirmado'",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, confirmar',
        cancelButtonText: 'No, volver'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '../../Database/configuraciones/ordenes/confirmar_pedido.php',
                method: 'POST',
                data: { order_id: orderId },
                dataType: 'json',
                success: function(response) {
                    if (response.success) {
                        showToastNotification('success', 'Pedido confirmado');
                        loadOrders($('#pagination .page-item.active').text() || 1);
                    } else {
                        showToastNotification('error', response.error || 'Error al confirmar el pedido');
                    }
                },
                error: function(xhr) {
                    showToastNotification('error', 'Error de conexión: ' + xhr.statusText);
                }
            });
        }
    });
}

// Función para generar factura
function generateInvoice(orderId) {
    // Mostrar loader mientras se obtienen los datos
    Swal.fire({
        title: 'Generando factura',
        html: 'Por favor espere...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    $.ajax({
        url: '../../Database/configuraciones/ordenes/obtener_datos_factura.php',
        method: 'GET',
        data: { order_id: orderId },
        dataType: 'json',
        success: function(response) {
            Swal.close();
            
            if (response.success) {
                // Validar estructura de datos antes de generar el PDF
                if (!response.data || typeof response.data !== 'object') {
                    showToastNotification('error', 'Datos de factura no válidos');
                    return;
                }

                // Verificar propiedades mínimas requeridas
                const requiredProps = ['client', 'products', 'subtotal', 'total', 'payment', 'total_bs'];
                const missingProps = requiredProps.filter(prop => !response.data.hasOwnProperty(prop));
                
                if (missingProps.length > 0) {
                    showToastNotification('error', `Faltan datos requeridos: ${missingProps.join(', ')}`);
                    return;
                }

                // Mapear datos para asegurar compatibilidad
                const invoiceData = {
                    client: {
                        id: response.data.client.id || 'N/A',
                        name: response.data.client.name || 'Cliente no identificado',
                        phone: response.data.client.phone || 'No especificado',
                        address: response.data.client.address || 'No especificada',
                        email: response.data.client.email || ''
                    },
                    products: (response.data.products || []).map(product => ({
                        titulo: product.titulo || 'Producto sin nombre',
                        quantity: product.cantidad || 0,
                        precio: product.precio || 0,
                        notas: product.notas || ''
                    })),
                    subtotal: response.data.subtotal || 0,
                    delivery_cost: response.data.delivery_cost || 0,
                    total: response.data.total || 0,
                    total_bs: response.data.total_bs || 0, // Asegurar que se pasa el monto en Bs
                    payment: {
                        method: response.data.payment.method || 'No especificado',
                        reference: response.data.payment.reference || 'N/A',
                        status: response.data.payment.status || 'Pendiente'
                    },
                    delivery: response.data.delivery || false,
                    order_id: response.data.order_id || orderId
                };

                // Generar la factura con los datos mapeados
                generarFacturaPDF(invoiceData, orderId);
            } else {
                showToastNotification('error', response.error || 'Error al generar factura');
            }
        },
        error: function(xhr) {
            Swal.close();
            showToastNotification('error', 'Error de conexión: ' + xhr.statusText);
        }
    });
}


// Función para mostrar detalles del pedido
function showOrderDetails(orderId) {
    // Mostrar loader mientras se obtienen los datos
    Swal.fire({
        title: 'Cargando detalles',
        html: 'Por favor espere...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    $.ajax({
        url: '../../Database/configuraciones/ordenes/obtener_detalles_pedido.php',
        method: 'GET',
        data: { order_id: orderId },
        dataType: 'json',
        success: function(response) {
            Swal.close();
            if (response.success) {
                renderOrderDetailsModal(response.data);
            } else {
                showToastNotification('error', response.error || 'Error al cargar detalles');
            }
        },
        error: function(xhr) {
            Swal.close();
            showToastNotification('error', 'Error de conexión: ' + xhr.statusText);
        }
    });
}

// Función para renderizar el modal de detalles
function renderOrderDetailsModal(orderData) {
    // Formatear fecha
    const orderDate = new Date(orderData.fecha_pedido);
    const formattedDate = orderDate.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Formatear método de pago
    const paymentMethod = orderData.metodo_pago.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    // Construir HTML de productos
    let productsHtml = '';
    orderData.productos.forEach(product => {
        productsHtml += `
            <div class="row mb-2">
                <div class="col-6">${product.nombre}</div>
                <div class="col-2 text-center">${product.cantidad}</div>
                <div class="col-2 text-end">$${product.precio_unitario.toFixed(2)}</div>
                <div class="col-2 text-end">$${(product.precio_unitario * product.cantidad).toFixed(2)}</div>
            </div>
        `;
    });

    // Determinar el tipo de pedido (Delivery/Local) - AJUSTE PRINCIPAL
    const isDelivery = orderData.delivery && 
                      (orderData.delivery.toString().toLowerCase() === 'si' || 
                       orderData.delivery.toString().toLowerCase() === '1' ||
                       orderData.delivery.toString().toLowerCase() === 'true');
    const orderType = isDelivery ? 'Delivery' : 'Local';

    // Construir modal completo
    const modalHtml = `
        <div class="modal fade" id="orderDetailsModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Detalles del Pedido #${orderData.id}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <h6>Información del Cliente</h6>
                                <p><strong>Nombre:</strong> ${orderData.cliente_nombre}<br>
                                <strong>Cédula:</strong> ${orderData.cliente_cedula}<br>
                                <strong>Dirección:</strong> ${orderData.direccion || 'No especificada'}<br>
                                <strong>Teléfono:</strong> ${orderData.cliente_telefono || 'No especificado'}</p>
                            </div>
                            <div class="col-md-6">
                                <h6>Información del Pedido</h6>
                                <p><strong>Fecha:</strong> ${formattedDate}<br>
                                <strong>Estado:</strong> ${orderData.estado.replace(/_/g, ' ')}<br>
                                <strong>Tipo:</strong> ${orderType}<br>
                                <strong>Método Pago:</strong> ${paymentMethod}</p>
                            </div>
                        </div>
                        
                        
                        <div class="row fw-bold mb-2">
                            <div class="col-6">Productos</div>
                            <div class="col-2 text-center">Cant.</div>
                            <div class="col-2 text-end">P. Unit.</div>
                            <div class="col-2 text-end">Total</div>
                        </div>
                        ${productsHtml}
                        <hr>
                        
                        <div class="row">
                            <div class="col-8"></div>
                            <div class="col-4">
                                <div class="row mb-1">
                                    <div class="col-6 text-end"><strong>Subtotal:</strong></div>
                                    <div class="col-6 text-end">$${orderData.subtotal.toFixed(2)}</div>
                                </div>
                                ${isDelivery ? `
                                <div class="row mb-1">
                                    <div class="col-6 text-end"><strong>Envío:</strong></div>
                                    <div class="col-6 text-end">$${orderData.costo_envio.toFixed(2)}</div>
                                </div>
                                ` : ''}
                                <div class="row mb-1">
                                    <div class="col-6 text-end"><strong>Total (USD):</strong></div>
                                    <div class="col-6 text-end">$${orderData.precio_total.toFixed(2)}</div>
                                </div>
                                <div class="row mb-1">
                                    <div class="col-6 text-end"><strong>Total (Bs):</strong></div>
                                    <div class="col-6 text-end">Bs. ${orderData.precio_bs ? orderData.precio_bs.toFixed(2) : '0.00'}</div>
                                </div>
                                ${orderData.id_tasa ? `
                                <div class="row">
                                    <div class="col-12 text-end small text-muted">
                                        Tasa de cambio: ${orderData.tasa_cambio ? `1 USD = Bs. ${orderData.tasa_cambio.toFixed(2)}` : 'No disponible'}
                                    </div>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        
                        ${orderData.notas ? `
                        <div class="mt-3">
                            <h6>Notas adicionales</h6>
                            <p>${orderData.notas}</p>
                        </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        <button type="button" class="btn btn-primary" onclick="generateInvoice(${orderData.id})">
                            <i class="fas fa-file-invoice me-1"></i> Generar Factura
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Agregar modal al DOM y mostrarlo
    $('body').append(modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
    modal.show();

    // Eliminar el modal cuando se cierre
    $('#orderDetailsModal').on('hidden.bs.modal', function () {
        $(this).remove();
    });
}

// Inicialización (agregar al final del documento ready)
$(document).ready(function() {
    // ... (código existente)
    setupActionButtons();
});


