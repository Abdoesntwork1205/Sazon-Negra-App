/**
 * MÓDULO DE PROCESAMIENTO DE PEDIDOS
 * - Recolección de datos del formulario
 * - Validación final
 * - Envío al servidor
 */
const CheckoutAPI = {
  // Recolecta todos los datos del pedido
  collectOrderData() {
  const subtotal = this.calculateSubtotal();
  const delivery = this.calculateDeliveryCost();
  const total = this.calculateTotal();

  // Obtener detalles de pago y asegurar que no sea null/undefined
  let paymentDetails = CheckoutPayments.getPaymentDetails() || {};
  
  // Si no hay método de pago, obtenerlo del formulario
  if (!paymentDetails.method) {
    paymentDetails.method = $('input[name="payment-method"]:checked').val() || 'efectivo';
  }

  const orderData = {
    client: this.getClientData(),
    delivery_method: this.getDeliveryMethod(),
    payment: {
      ...paymentDetails, // Usamos el objeto que ya hemos asegurado
      status: 'por_confirmar',
      method: paymentDetails.method // Aseguramos que siempre tenga valor
    },
    products: Cart.cart.map(item => ({
      id: item.id,
      titulo: item.titulo,
      precio: item.precio,
      quantity: item.quantity,
      notas: item.notas || ''
    })),
    subtotal: subtotal.usd,
    subtotal_bs: subtotal.bs,
    delivery_cost: delivery.usd,
    delivery_cost_bs: delivery.bs,
    total: total.usd,
    total_bs: total.bs,
    exchange_rate: this.getExchangeRate(),
    notes: $('#order-notes').val()?.trim() || ''
  };
  
  return orderData;
},
  // Obtiene datos del cliente (ahora incluye nacionalidad)
  getClientData() {
    return {
    name: $('#checkout_nombre').val() ? $('#checkout_nombre').val().trim() : '',
    id_type: $('#checkout_nacionalidad').val() || 'V',
    id: $('#checkout_cedula').val() ? $('#checkout_cedula').val().trim() : '',
    email: $('#checkout_email').val() ? $('#checkout_email').val().trim() : '',
    phone: $('#checkout_telefono').val() ? $('#checkout_telefono').val().trim() : '',
    nacionalidad: $('#checkout_nacionalidad').val() || 'V',
    profile_address: userSessionData?.direccion || '',
    address: this.getAddressData(),
    use_profile_address: $('#use-profile-address').is(':checked'),
    lat: $('#direccion-latitud').val() || null,
    lng: $('#direccion-longitud').val() || null
  };



      
  },

  getAddressData() {
  const deliveryType = $('input[name="tipo-entrega"]:checked').val();
  
  if (deliveryType === 'delivery') {
    // Cambiamos esto para enviar solo el string de dirección
    return $('#direccion-exacta').val() ? $('#direccion-exacta').val().trim() : '';
  }
  return '';
},

  getExchangeRate() {
      return Cart.exchangeRate || 36.50; // Usa la tasa del carrito o un valor por defecto
    },





  

  // Obtiene método de entrega
  getDeliveryMethod() {
    return $('input[name="tipo-entrega"]:checked').val() === 'delivery' ? '1' : '0';
  },

  // Cálculos financieros
   calculateSubtotal() {
    const subtotalUSD = Cart.cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    return {
      usd: subtotalUSD,
      bs: subtotalUSD * this.getExchangeRate()
    };
  },

    calculateDeliveryCost() {
    const deliveryUSD = $('input[name="tipo-entrega"]:checked').val() === 'delivery' ? 5.00 : 0;
    return {
      usd: deliveryUSD,
      bs: deliveryUSD * this.getExchangeRate()
    };
  },

    calculateTotal() {
    const subtotal = this.calculateSubtotal();
    const delivery = this.calculateDeliveryCost();
    
    return {
      usd: subtotal.usd + delivery.usd,
      bs: subtotal.bs + delivery.bs
    };
  },

  // Valida todos los datos antes de enviar
validateOrder() {
  // Validar datos personales
  const nombre = $('#checkout_nombre').val();
  const cedula = $('#checkout_cedula').val();
  const telefono = $('#checkout_telefono').val();
  
  if (!nombre || !nombre.trim() || !cedula || !cedula.trim() || !telefono || !telefono.trim()) {
    return { valid: false, message: 'Completa tus datos personales' };
  }

  // Validar dirección si es delivery
  const deliveryType = $('input[name="tipo-entrega"]:checked').val();
  if (deliveryType === 'delivery') {
    const direccion = this.getAddressData();
    if (!direccion) {
      return { valid: false, message: 'Completa tu dirección de entrega' };
    }
  }

  // Validar método de pago (solo selección, no detalles)
  if (!$('input[name="payment-method"]:checked').val()) {
    return { valid: false, message: 'Selecciona un método de pago' };
  }

  // Validar referencia de pago (único campo requerido para todos)
  if (!$('#payment-reference').val().trim()) {
    return { valid: false, message: 'Ingresa el número de referencia' };
  }

  // Validar términos y condiciones
  if (!$('#accept-terms').is(':checked')) {
    return { valid: false, message: 'Debes aceptar los términos y condiciones' };
  }

  return { valid: true };
},

  // Método processOrder actualizado
processOrder() {
  const validation = this.validateOrder();
  if (!validation.valid) {
    this.showErrorAlert('Error', validation.message);
    return;
  }

  const orderData = this.collectOrderData();
  
  // Enviar directamente al servidor sin mostrar loader
  this.sendOrderToServer(orderData);
},

// En el método sendOrderToServer
sendOrderToServer(orderData) {
  const formData = new FormData();
  formData.append('order', JSON.stringify(orderData));
  
  // Guardamos los productos para la factura ANTES de limpiar el carrito
  const productsForInvoice = [...Cart.cart]; // Copia profunda de los productos
  
  // Manejar el comprobante de pago
  const paymentProofInput = document.getElementById('payment-proof');
  if (paymentProofInput?.files[0]) {
    formData.append('voucher', paymentProofInput.files[0]);
  }

  $.ajax({
    url: '../Database/configuraciones/crear-orden/procesar_pedido.php',
    type: 'POST',
    data: formData,
    processData: false,
    contentType: false,
    success: (response) => {
      try {
        const data = typeof response === 'string' ? JSON.parse(response) : response;
        
        if (data.success) {
          // Cerrar modal de checkout
          $('#checkoutModal').modal('hide');
          
          // Mostrar modal de éxito con los productos guardados
          this.showSuccessModal(data.order_id, data.payment_method, productsForInvoice);
          
          // Limpiar carrito SOLO después de asegurarnos que tenemos los datos
          if (typeof Cart !== 'undefined' && typeof Cart.clearCart === 'function') {
            Cart.clearCart();
          }
        } else {
          this.showErrorAlert('Error', data.error || 'Error al procesar el pedido');
        }
      } catch (e) {
        console.error("Error al interpretar respuesta:", e);
        this.showErrorAlert('Error', 'Error al procesar la respuesta del servidor');
      }
    },
    error: (xhr) => {
      console.error("Error en la solicitud:", xhr.responseText);
      this.showErrorAlert('Error', 'Error de conexión con el servidor');
    }
  });
},

// Método showErrorAlert añadido para consistencia
showErrorAlert(title, message) {
  Swal.fire({
    title: title,
    text: message,
    icon: 'error',
    confirmButtonText: 'Entendido'
  });
},


showSuccessModal(orderId, paymentMethod, productsForInvoice) {
  // Cerrar modal de checkout si está abierto
  if ($('#checkoutModal').is(':visible')) {
    $('#checkoutModal').modal('hide');
  }

  setTimeout(() => {
    // 1. Calcular valores basados en los productos guardados
    const exchangeRate = this.getExchangeRate();
    const subtotalUSD = productsForInvoice.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    const isDelivery = $('input[name="tipo-entrega"]:checked').val() === 'delivery';
    const deliveryUSD = isDelivery ? 5.00 : 0;
    const totalUSD = subtotalUSD + deliveryUSD;

    // 2. Construir orderData completo con los valores calculados
    const orderData = {
      ...this.collectOrderData(), // Datos del cliente, pago, etc.
      products: productsForInvoice.map(item => ({
        id: item.id,
        titulo: item.titulo || item.nombre || 'Producto',
        precio: parseFloat(item.precio) || 0,
        quantity: parseInt(item.quantity) || 1
      })),
      subtotal: subtotalUSD,
      subtotal_bs: subtotalUSD * exchangeRate,
      delivery_cost: deliveryUSD,
      delivery_cost_bs: deliveryUSD * exchangeRate,
      total: totalUSD,
      total_bs: totalUSD * exchangeRate,
      exchange_rate: exchangeRate,
      delivery_method: isDelivery ? '1' : '0'
    };

    console.log('Datos completos para factura:', {
      productos: orderData.products,
      subtotal: orderData.subtotal,
      delivery: orderData.delivery_cost,
      total: orderData.total
    });

    const paymentMethods = {
      'efectivo': 'Efectivo',
      'transferencia': 'Transferencia',
      'pago_movil': 'Pago Móvil',
      'zelle': 'Zelle',
      'tarjeta': 'Tarjeta'
    };
    
    let displayMethod = paymentMethods[paymentMethod] || paymentMethod;
    
    if (paymentMethod === 'efectivo') {
      const paymentDetails = orderData.payment;
      if (paymentDetails.tipo_efectivo === 'nacional') {
        displayMethod = 'Efectivo Nacional';
      } else if (paymentDetails.tipo_efectivo === 'internacional') {
        displayMethod = 'Efectivo USD';
      }
    }
    
    Swal.fire({
      title: '¡Pedido Recibido!',
      html: `
        <div class="text-left">
          <div class="alert alert-info mb-3">
            <i class="fas fa-info-circle me-2"></i>
            Hemos recibido tu pedido <strong>#${orderId}</strong> correctamente.
          </div>
          
          <div class="order-details p-3 bg-light rounded">
            <p class="mb-1"><strong>Método de pago:</strong> ${displayMethod}</p>
            <p class="mb-1"><strong>Referencia:</strong> ${$('#payment-reference').val() || 'N/A'}</p>
            <p class="mb-1"><strong>Subtotal:</strong> $${subtotalUSD.toFixed(2)}</p>
            ${deliveryUSD > 0 ? `<p class="mb-1"><strong>Envío:</strong> $${deliveryUSD.toFixed(2)}</p>` : ''}
            <p class="mb-0 fw-bold"><strong>Total:</strong> $${totalUSD.toFixed(2)}</p>
          </div>
        </div>
      `,
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'Cerrar',
      cancelButtonText: '<i class="fas fa-print me-2"></i> Imprimir factura',
      allowOutsideClick: false,
      buttonsStyling: false,
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-secondary me-2'
      }
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.cancel) {
        generarFacturaPDF(orderData, orderId);
      }
      
      // Limpieza final
      $('.modal').modal('hide');
      $('#checkout-form')[0]?.reset();
    });
  }, 300);
}
};