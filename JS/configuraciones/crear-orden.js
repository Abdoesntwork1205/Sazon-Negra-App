// Preloader
window.addEventListener('load', function() {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
});

// Theme Switcher
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('change', function() {
        const html = document.documentElement;
        if (this.checked) {
            html.setAttribute('data-bs-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            html.setAttribute('data-bs-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });

    // Check for saved theme preference
    if (localStorage.getItem('theme') === 'dark') {
        themeToggle.checked = true;
        document.documentElement.setAttribute('data-bs-theme', 'dark');
    }
}



// Función para mostrar notificaciones (SweetAlert2)
function showAlert(icon, title, text = '') {
    Swal.fire({
        icon: icon,
        title: title,
        text: text,
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });
}

// =========================================================================
// Apartado Cliente
// =========================================================================
function searchClientById() {
    const clientId = $('#clientId').val().trim();
    if (!clientId) {
        showAlert('error', 'Por favor ingrese un número de cédula');
        return;
    }
    $.ajax({
        url: '../../Database/configuraciones/crear-orden/buscar-cliente.php',
        type: 'GET', dataType: 'json', data: { cedula: clientId },
        beforeSend: function() { $('#searchClientBtn').html('<i class="fas fa-spinner fa-spin"></i>').prop('disabled', true); },
        success: function(response) {
            if (response.success) {
                const client = response.data;
                $('#clientName').val(`${client.nombre} ${client.apellido}`);
                $('#clientPhone').val(client.telefono);
                $('#clientEmail').val(client.correo || '');
                $('#clientAddress').val(client.direccion || '');
                showAlert('success', 'Cliente encontrado');
            } else {
                $('#clientName, #clientPhone, #clientEmail, #clientAddress').val('');
                showAlert('info', 'Cliente no registrado', 'Por favor complete los datos manualmente.');
            }
        },
        error: function(xhr) { showAlert('error', 'Error al buscar cliente', xhr.responseText); },
        complete: function() { $('#searchClientBtn').html('<i class="fas fa-search"></i>').prop('disabled', false); }
    });
}

$('#searchClientBtn').click(searchClientById);
$('#clientId').keypress(function(e) { if (e.which === 13) { e.preventDefault(); searchClientById(); } });

// =========================================================================
// Variables Globales para el Pedido
// =========================================================================
let selectedProducts = [];
let productCounter = 0;
const confirmOrderModalElement = document.getElementById('confirmOrderModal');
const confirmOrderModal = confirmOrderModalElement ? new bootstrap.Modal(confirmOrderModalElement) : null;

// =========================================================================
// Funciones para manejar tasas de cambio y montos
// =========================================================================
function updateBsAmount() {
    try {
        if(!window.tasaCambio) {
            console.error("tasaCambio no está disponible");
            return;
        }
        
        const totalDolares = parseFloat($('#totalAmount').text().replace('$', '')) || 0;
        const totalBs = window.tasaCambio.convertir(totalDolares, 'USD', 'VES');
        
        const formattedBs = new Intl.NumberFormat('es-VE', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(totalBs);
        
        $('#totalAmountBs').text(formattedBs + ' Bs');
        $('#modalFinalTotalAmountBs').text(formattedBs + ' Bs');
    } catch (error) {
        console.error("Error en updateBsAmount:", error);
        $('#totalAmountBs, #modalFinalTotalAmountBs').text("Error al calcular");
    }
}

// =========================================================================
// Funciones mejoradas para manejo de promociones
// =========================================================================

async function applyProductPromotion(productData) {
    try {
        console.log('[Promociones] Verificando promoción para:', productData);
        
        // 1. Primero verificar promoción directa por producto
        let promotion = await checkPromotion(productData.id, null);
        
        // 2. Si no hay promoción directa, verificar por categoría
        if (!promotion && productData.categoria_id) {
            console.log('[Promociones] Buscando promoción por categoría:', productData.categoria_id);
            promotion = await checkPromotion(null, productData.categoria_id);
        }

        if (promotion) {
            console.log('[Promociones] Promoción aplicable encontrada:', promotion);
            
            // Calcular precio con descuento
            let precioFinal = productData.precio;
            let descuento = 0;
            
            if (promotion.tipo === 'porcentaje') {
                descuento = productData.precio * (promotion.valor_descuento / 100);
                precioFinal = productData.precio - descuento;
            } else if (promotion.tipo === 'monto_fijo') {
                descuento = promotion.valor_descuento;
                precioFinal = productData.precio - descuento;
            }
            
            // Asegurar que el precio no sea negativo
            precioFinal = Math.max(0, precioFinal);
            
            return {
                ...productData,
                precio: parseFloat(precioFinal.toFixed(2)),
                precio_original: productData.precio,
                promocion: promotion,
                descuento_aplicado: descuento
            };
        }
        
        console.log('[Promociones] No hay promociones aplicables');
        return productData;
        
    } catch (error) {
        console.error('[Promociones] Error al aplicar promoción:', error);
        return productData;
    }
}

async function checkPromotion(productId, categoryId) {
    try {
        const response = await $.ajax({
            url: '../../Database/configuraciones/crear-orden/verificar_promocion.php',
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                producto_id: productId,
                categoria_id: categoryId
            })
        });

        console.log('Respuesta de promoción:', response);

        if (response.success && response.data) {
            // Verificar que la promoción esté vigente
            const now = new Date();
            const startDate = new Date(response.data.fecha_inicio);
            const endDate = new Date(response.data.fecha_fin);
            
            if (now >= startDate && now <= endDate) {
                return response.data;
            }
            console.log('Promoción fuera de rango de fechas');
        }
        return null;
    } catch (error) {
        console.error('Error al verificar promoción:', error);
        return null;
    }
}

function updateOrderSummary() {
    let subtotal = 0;
    let totalDescuentos = 0;
    
    selectedProducts.forEach(product => {
        subtotal += product.precio * product.quantity;
        if (product.promocion) {
            totalDescuentos += (product.descuento_aplicado || 0) * product.quantity;
        }
    });

    const deliveryCost = $('#deliveryYes').is(':checked') ? 
        parseFloat($('#deliveryCostInput').val()) || 0 : 0;
    const total = subtotal + deliveryCost;

    $('#subtotalAmount').text('$' + subtotal.toFixed(2));
    $('#deliveryAmount').text('$' + deliveryCost.toFixed(2));
    $('#totalAmount').text('$' + total.toFixed(2));
    $('#modalFinalTotalAmount').text('$' + total.toFixed(2));
    
    // Mostrar descuentos si existen
    if (totalDescuentos > 0) {
        $('#discountAmount').text('-$' + totalDescuentos.toFixed(2)).parent().show();
    } else {
        $('#discountAmount').parent().hide();
    }
    
    updateBsAmount();
}

// =========================================================================
// Apartado Productos y Busqueda
// =========================================================================
if ($('#productSearch').length) {
    $('#productSearch').select2({
        theme: 'bootstrap-5',
        placeholder: 'Buscar productos por nombre o categoría...',
        allowClear: true,
        ajax: {
            url: '../../Database/configuraciones/crear-orden/buscar-producto.php',
            dataType: 'json',
            delay: 250,
            data: function(params) { return { q: params.term, page: params.page }; },
            processResults: function(data, params) {
                params.page = params.page || 1;
                return {
                    results: data.items,
                    pagination: { more: (params.page * 30) < data.total_count }
                };
            },
            cache: true
        },
        minimumInputLength: 1,
        templateResult: formatProduct,
        templateSelection: formatProductSelection
    });
}

function formatProduct(product) {
    if (product.loading) return product.text;
    return $(
        `<div class="select2-product-result d-flex justify-content-between align-items-center">
            <div>
                <div class="product-name fw-bold">${product.titulo}</div>
                <div class="product-category small text-muted">${product.categoria_nombre}</div>
            </div>
            <div class="product-price badge bg-primary">$${parseFloat(product.precio).toFixed(2)}</div>
        </div>`
    );
}

function formatProductSelection(product) {
    return product.titulo || product.text;
}

$('#productSearch').on('select2:select', async function(e) {
    const selectedProductData = e.params.data;
    console.log('Producto seleccionado:', selectedProductData);
    
    // Aplicar promoción si existe
    const productWithPromotion = await applyProductPromotion(selectedProductData);
    console.log('Producto con promoción:', productWithPromotion);
    
    const existingProductIndex = selectedProducts.findIndex(p => p.id === productWithPromotion.id);

    if (existingProductIndex >= 0) {
        selectedProducts[existingProductIndex].quantity += 1;
        updateProductRow(selectedProducts[existingProductIndex]);
    } else {
        productCounter++;
        const productWithQuantity = {
            ...productWithPromotion,
            rowId: productCounter,
            quantity: 1,
        };
        selectedProducts.push(productWithQuantity);
        addProductRow(productWithQuantity);
    }
    
    $('#productSearch').val(null).trigger('change');
    updateOrderSummary();
});

function addProductRow(product) {
    const subtotal = product.precio * product.quantity;
    
    // Mostrar precio original y descuento si aplica
    let priceDisplay = `$${product.precio.toFixed(2)}`;
    if (product.promocion) {
        priceDisplay = `
            <div class="d-flex flex-column">
                <span class="text-decoration-line-through text-danger small">$${product.precio_original.toFixed(2)}</span>
                <span>$${product.precio.toFixed(2)}</span>
                <span class="badge bg-success">${getPromoBadge(product.promocion)}</span>
            </div>
        `;
    }

    const row = `
        <tr id="product-row-${product.rowId}" data-product-id="${product.id}">
            <td>${product.rowId}</td>
            <td>
                <div>${product.titulo}</div>
                <small class="text-muted">${product.categoria_nombre}</small>
            </td>
            <td class="product-price">${priceDisplay}</td>
            <td>
                <div class="input-group quantity-control">
                    <button class="btn btn-sm btn-outline-secondary decrease-quantity" type="button">-</button>
                    <input type="number" class="form-control form-control-sm quantity-input" value="${product.quantity}" min="1">
                    <button class="btn btn-sm btn-outline-secondary increase-quantity" type="button">+</button>
                </div>
            </td>
            <td class="product-subtotal">$${subtotal.toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger remove-product" title="Eliminar"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    $('#selectedProductsTable tbody').append(row);
}

function getPromoBadge(promocion) {
    if (!promocion) return '';
    
    switch(promocion.tipo) {
        case 'porcentaje':
            return `-${promocion.valor_descuento}%`;
        case 'monto_fijo':
            return `-$${promocion.valor_descuento.toFixed(2)}`;
        default:
            return 'Promo';
    }
}

// =========================================================================
// Manejo de eventos del carrito
// =========================================================================
$('#selectedProductsTable tbody').on('click', '.decrease-quantity, .increase-quantity, .remove-product', function() {
    const $row = $(this).closest('tr');
    const rowId = parseInt($row.attr('id').replace('product-row-', ''));
    if ($(this).hasClass('decrease-quantity')) adjustQuantity(rowId, -1);
    else if ($(this).hasClass('increase-quantity')) adjustQuantity(rowId, 1);
    else if ($(this).hasClass('remove-product')) removeProduct(rowId);
});

$('#selectedProductsTable tbody').on('change', '.quantity-input', function() {
    const $row = $(this).closest('tr');
    const rowId = parseInt($row.attr('id').replace('product-row-', ''));
    setQuantity(rowId, parseInt($(this).val()) || 1);
});

function updateProductRow(product) {
    const subtotal = product.precio * product.quantity;
    const $row = $(`#product-row-${product.rowId}`);
    $row.find('.quantity-input').val(product.quantity);
    $row.find('.product-subtotal').text('$' + subtotal.toFixed(2));
    updateOrderSummary();
}

function adjustQuantity(rowId, change) {
    const productIndex = selectedProducts.findIndex(p => p.rowId === rowId);
    if (productIndex >= 0) {
        const newQuantity = selectedProducts[productIndex].quantity + change;
        if (newQuantity >= 1) {
            selectedProducts[productIndex].quantity = newQuantity;
            updateProductRow(selectedProducts[productIndex]);
        }
    }
}

function setQuantity(rowId, quantity) {
    if (quantity < 1) quantity = 1;
    const productIndex = selectedProducts.findIndex(p => p.rowId === rowId);
    if (productIndex >= 0) {
        selectedProducts[productIndex].quantity = quantity;
        updateProductRow(selectedProducts[productIndex]);
    }
}

function removeProduct(rowId) {
    const productIndex = selectedProducts.findIndex(p => p.rowId === rowId);
    if (productIndex >= 0) {
        selectedProducts.splice(productIndex, 1);
        $(`#product-row-${rowId}`).remove();
        updateOrderSummary();
    }
}

// =========================================================================
// Apartado Resumen de Pedido y Pago (Sidebar)
// =========================================================================
$('#paymentMethod').change(function() {
    const method = $(this).val();
    $('#internationalPaymentFields, #paymentReferenceField, #voucherUploadField').addClass('d-none');
    $('#internationalPaymentDescription, #paymentReference, #voucherUpload').val('');

    if (method === 'efectivo') {
        // No se muestra ningún campo adicional para Efectivo Nacional
    } else if (method === 'efectivo_internacional') {
        $('#internationalPaymentFields').removeClass('d-none');
        actualizarPagoInternacional();
    } else if (method === 'pago_movil' || method === 'transferencia' || method === 'zelle') {
        $('#paymentReferenceField').removeClass('d-none');
        $('#voucherUploadField').removeClass('d-none');
        $('#paymentReferenceField label').text('Número de Referencia');
    } else if (method === 'tarjeta') {
        $('#paymentReferenceField').removeClass('d-none');
        $('#paymentReferenceField label').text('Número de Autorización');
    }
}).trigger('change');

async function actualizarPagoInternacional() {
    try {
        if(!window.tasaCambio) {
            console.error("tasaCambio no está disponible");
            return;
        }

        const moneda = $('#internationalCurrency').val();
        const totalDolares = parseFloat($('#totalAmount').text().replace('$', ''));
        const montoEquivalente = window.tasaCambio.convertir(totalDolares, 'USD', moneda);
        
        const symbol = moneda === 'USD' ? '$' : moneda === 'EUR' ? '€' : '$';
        $('#currencySymbol').text(symbol);
        
        $('#internationalAmount').val(montoEquivalente.toFixed(2));
        $('#equivalentAmount').text('$' + totalDolares.toFixed(2) + ' USD');
        
        const tasaUsd = window.tasaCambio.getTasa(moneda, 'USD');
        $('#internationalPaymentDescription').val(
            `Recibido ${montoEquivalente.toFixed(2)} ${moneda}. Tasa ${moneda} a USD: ${tasaUsd.toFixed(4)}`
        );
    } catch (error) {
        console.error("Error en actualizarPagoInternacional:", error);
    }
}

// =========================================================================
// Apartado Confirmar Pedido (Modal y Lógica de Envío)
// =========================================================================
$(document).ready(function() {
    let confirmOrderModal = new bootstrap.Modal(document.getElementById('confirmOrderModal'));

    $('#confirmOrderBtn').on('click', function(e) {
        e.preventDefault();
        if (!validateClientData()) return;
        if (selectedProducts.length === 0) {
            showAlert('error', 'Debe agregar al menos un producto.');
            $('#productSearch').closest('.card').css('border', '1px solid #dc3545');
            setTimeout(() => {
                $('#productSearch').closest('.card').css('border', '');
            }, 3000);
            return;
        }
        if (!validatePaymentDetailsSidebar()) return;

        $('#modalFinalTotalAmount').text($('#totalAmount').text());
        if (confirmOrderModal) confirmOrderModal.show();
    });

    function validateClientData() {
        const clientId = $('#clientId').val().trim();
        const clientName = $('#clientName').val().trim();
        const clientPhone = $('#clientPhone').val().trim();

        if (!clientId) {
            showAlert('error', 'Debe ingresar la cédula del cliente');
            $('#clientId').focus();
            return false;
        }
        if (!clientName) {
            showAlert('error', 'Debe ingresar el nombre del cliente');
            $('#clientName').focus();
            return false;
        }
        if (!clientPhone) {
            showAlert('error', 'Debe ingresar el teléfono del cliente');
            $('#clientPhone').focus();
            return false;
        }
        return true;
    }

    function validatePaymentDetailsSidebar() {
        const paymentMethod = $('#paymentMethod').val();
        
        if (paymentMethod === 'efectivo_internacional') {
            if (!$('#internationalPaymentDescription').val().trim()) {
                showAlert('error', 'Ingrese la descripción del pago internacional.');
                $('#internationalPaymentDescription').focus();
                return false;
            }
        } else if (['pago_movil', 'transferencia', 'zelle', 'tarjeta'].includes(paymentMethod)) {
            if (!$('#paymentReference').val().trim()) {
                const label = paymentMethod === 'tarjeta' ? 'Número de Autorización' : 'Número de Referencia';
                showAlert('error', `Ingrese el ${label.toLowerCase()} del pago.`);
                $('#paymentReference').focus();
                return false;
            }
        }
        return true;
    }

    $('#finalConfirmOrderBtn').click(function() {
        const paymentStatus = $('input[name="paymentStatus"]:checked').val();
        submitOrderData(paymentStatus, true);
    });

    $('#anularPedidoModalBtn').click(function() {
        Swal.fire({
            title: '¿Está seguro?',
            text: "Esta acción anulará el pedido.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, anular',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.isConfirmed) submitOrderData('anulado', false);
        });
    });

    function submitOrderData(orderPaymentStatus, generateInvoiceFlag) {
        if (!window.tasaCambio) {
            showAlert('error', 'Error del sistema', 'No se pudo cargar las tasas de cambio');
            return;
        }

        const paymentMethod = $('#paymentMethod').val();
        
        let paymentDetails = {
            method: paymentMethod,
            status: orderPaymentStatus,
            reference: null,
            description: null,
            currency: null,
            exchange_rate: window.tasaCambio.getTasa('USD', 'VES')
        };

        if (paymentMethod === 'efectivo') {
            paymentDetails.reference = 'Pago en efectivo VES';
            paymentDetails.currency = 'VES';
        } else if (paymentMethod === 'efectivo_internacional') {
            const moneda = $('#internationalCurrency').val();
            paymentDetails.reference = $('#internationalPaymentDescription').val().trim();
            paymentDetails.description = paymentDetails.reference;
            paymentDetails.currency = moneda;
            paymentDetails.exchange_rate = window.tasaCambio.getTasa(moneda, 'USD');
        } else {
            paymentDetails.reference = $('#paymentReference').val().trim();
            paymentDetails.currency = paymentMethod === 'zelle' ? 'USD' : 'VES';
        }

        let totalBs = 0;
        try {
            const bsText = $('#totalAmountBs').text().replace(/[^\d,]/g, '');
            totalBs = parseFloat(bsText.replace('.', '').replace(',', '.'));
            
            if (isNaN(totalBs)) {
                const totalDolares = parseFloat($('#totalAmount').text().replace('$', '')) || 0;
                totalBs = window.tasaCambio.convertir(totalDolares, 'USD', 'VES');
            }
        } catch (e) {
            console.error("Error al parsear total en Bs:", e);
            const totalDolares = parseFloat($('#totalAmount').text().replace('$', '')) || 0;
            totalBs = window.tasaCambio.convertir(totalDolares, 'USD', 'VES');
        }

        const orderData = {
            client: {
                id: $('#clientId').val().trim(),
                name: $('#clientName').val().trim(),
                phone: $('#clientPhone').val().trim(),
                email: $('#clientEmail').val().trim() || null,
                address: $('#clientAddress').val().trim() || null,
            },
            delivery_method: $('input[name="deliveryMethod"]:checked').val() === '1' ? '1' : '0',
            notes: $('#orderNotes').val().trim() || null,
            payment: paymentDetails,
            products: selectedProducts.map(p => ({
                id: p.id,
                titulo: p.titulo,
                quantity: p.quantity,
                precio: p.precio,
                precio_original: p.precio_original,
                promocion: p.promocion ? {
                    tipo: p.promocion.tipo,
                    valor_descuento: p.promocion.valor_descuento
                } : null,
                descuento_aplicado: p.descuento_aplicado || 0
            })),
            subtotal: parseFloat($('#subtotalAmount').text().replace('$', '')) || 0,
            delivery_cost: parseFloat($('#deliveryAmount').text().replace('$', '')) || 0,
            total: parseFloat($('#totalAmount').text().replace('$', '')) || 0,
            total_bs: totalBs,
            generate_invoice: generateInvoiceFlag
        };

        if (isNaN(orderData.total) || isNaN(orderData.total_bs)) {
            showAlert('error', 'Error en montos', 'Los montos calculados no son válidos');
            return;
        }

        const formData = new FormData();
        formData.append('order', JSON.stringify(orderData));

        if (['pago_movil', 'transferencia', 'zelle'].includes(paymentMethod)) {
            if ($('#voucherUpload')[0].files.length > 0) {
                formData.append('voucher', $('#voucherUpload')[0].files[0]);
            }
        }

        const $buttons = $('#finalConfirmOrderBtn, #anularPedidoModalBtn');
        $buttons.prop('disabled', true);
        $('#finalConfirmOrderBtn').find('i').removeClass('fa-file-invoice fa-save').addClass('fa-spinner fa-spin');

        $.ajax({
            url: '../../Database/configuraciones/crear-orden/procesar_pedido.php',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    let successTitle = 'Pedido Procesado';
                    if (orderPaymentStatus === 'anulado') successTitle = 'Pedido Anulado';
                    else if (orderPaymentStatus === 'confirmado') successTitle = 'Pedido Confirmado';
                    else if (orderPaymentStatus === 'por_confirmar') successTitle = 'Pedido Registrado Pendiente';

                    showAlert('success', successTitle, response.order_id ? `ID: ${response.order_id}` : '');

                    if (generateInvoiceFlag && orderPaymentStatus !== 'anulado') {
                        try {
                            generarFacturaPDF(orderData, response.order_id);
                        } catch (e) {
                            console.error("Error al generar factura:", e);
                            showAlert('error', 'Error al generar factura', 'No se pudo crear el PDF');
                        }
                    }

                    resetOrderForm();
                    if (confirmOrderModal) confirmOrderModal.hide();
                } else {
                    showAlert('error', 'Error al procesar', response.error || 'No se pudo completar.');
                }
            },
            error: function(xhr) {
                showAlert('error', 'Error de conexión', xhr.responseText);
                console.error("Error AJAX:", xhr.responseText);
            },
            complete: function() {
                $buttons.prop('disabled', false);
                $('#finalConfirmOrderBtn').find('i').removeClass('fa-spinner fa-spin').addClass('fa-file-invoice');
            }
        });
    }

    function resetOrderForm() {
        if ($('#orderForm').length) {
            $('#orderForm')[0].reset();
        } else {
            $('#clientId, #clientName, #clientPhone, #clientEmail, #clientAddress, #orderNotes').val('');
            $('#internationalPaymentDescription, #paymentReference, #voucherUpload').val('');
        }
        $('#productSearch').val(null).trigger('change');
        $('#selectedProductsTable tbody').empty();
        selectedProducts = [];
        productCounter = 0;

        $('input[name="deliveryMethod"][value="1"]').prop('checked', true);
        $('#paymentMethod option:first').prop('selected', true);
        $('#paymentMethod').trigger('change');
        updateOrderSummary();
    }

    // Inicialización
    updateOrderSummary();
    $('#paymentMethod').trigger('change');
    
    // Eventos para actualizar montos
    $('#deliveryCostInput').on('input', updateOrderSummary);
    $('input[name="deliveryMethod"]').change(updateOrderSummary);
    $('#internationalCurrency').change(actualizarPagoInternacional);
});