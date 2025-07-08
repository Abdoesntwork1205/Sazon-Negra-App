/**
 * MÓDULO DE RESUMEN DE PEDIDO
 * - Generación de resumen completo
 * - Cálculo de totales con impuestos/envío
 * - Visualización estructurada de datos
 */
const CheckoutSummary = {
  // Genera todo el resumen para el paso 4
  loadOrderSummary() {
    this.showCustomerData();
    this.showDeliveryInfo();
    this.showPaymentMethod();
    this.showCartItems();
    this.calculateTotals();
  },

  // Muestra datos personales del cliente
  showCustomerData() {
    const customerData = {
      name: $('#nombre').val(),
      id: $('#cedula').val(),
      email: $('#email').val(),
      phone: $('#telefono').val()
    };

    const html = `
      <div class="customer-summary">
        <strong>${customerData.name}</strong>
        <div class="customer-details">
          <small><i class="fas fa-id-card"></i> ${customerData.id || 'No especificado'}</small>
          <small><i class="fas fa-phone"></i> ${customerData.phone}</small>
          <small><i class="fas fa-envelope"></i> ${customerData.email}</small>
        </div>
      </div>
    `;
    
    $('#summary-personal').html(html);
  },

  // Muestra información de entrega (delivery/recoger)
  showDeliveryInfo() {
  const deliveryType = $('input[name="tipo-entrega"]:checked').val();
  let html = '';

  if (deliveryType === 'recoger') {
    html = `
      <div class="delivery-method">
        <i class="fas fa-store"></i> <strong>Recoger en tienda</strong>
        <div class="delivery-notes">
          <small>Dirección: Av. Principal #123, Local 45</small>
          <small>Horario: Lunes a Viernes 9am - 6pm</small>
        </div>
      </div>
    `;
  } else {
    const direccionExacta = $('#direccion-exacta').val();
    const referencias = $('#direccion-referencias').val();
    const lat = $('#direccion-latitud').val();
    const lng = $('#direccion-longitud').val();
    
    html = `
      <div class="delivery-method">
        <i class="fas fa-truck"></i> <strong>Envío a domicilio</strong>
        <div class="delivery-address">
          <div>${direccionExacta || 'Dirección no especificada'}</div>
          ${referencias ? `<div class="references"><small>Referencias: ${referencias}</small></div>` : ''}
          ${lat && lng ? `<div class="coords"><small>Coordenadas: ${lat}, ${lng}</small></div>` : ''}
        </div>
      </div>
    `;
  }

  // Cambia esto:
  $('#summary-address').html(html);  // En lugar de $('#summary-delivery').html(html);
},

  // Muestra el método de pago seleccionado
  showPaymentMethod() {
    const method = $('input[name="payment-method"]:checked').val();
    if (!method) return;

    const paymentMethods = {
      transferencia: { icon: 'university', text: 'Transferencia Bancaria' },
      pago_movil: { icon: 'mobile-alt', text: 'Pago Móvil' },
      zelle: { icon: 'exchange-alt', text: 'Zelle' },
      efectivo_nacional: { icon: 'money-bill-wave', text: 'Efectivo (Moneda Local)' },
      efectivo_internacional: { icon: 'dollar-sign', text: 'Efectivo (USD)' },
      tarjeta: { icon: 'credit-card', text: 'Tarjeta Crédito/Débito' }
    };

    const reference = $('#payment-reference').val();
    const paymentDetails = CheckoutPayments.getPaymentDetails();

    let html = `
      <div class="payment-method">
        <i class="fas fa-${paymentMethods[method].icon}"></i> 
        <strong>${paymentMethods[method].text}</strong>
    `;

    if (reference) {
      html += `<div class="payment-reference"><small>Referencia: ${reference}</small></div>`;
    }

    // Detalles específicos por método
    if (method === 'transferencia' && paymentDetails.amount) {
      html += `
        <div class="payment-details">
          <small>Monto: ${paymentDetails.amount}</small>
          <small>Fecha: ${paymentDetails.date}</small>
        </div>
      `;
    }

    html += `</div>`;
    $('#summary-payment').html(html);
  },

  // Muestra los productos del carrito con sus detalles
  showCartItems() {
    let itemsHTML = '';
    
    Cart.cart.forEach(item => {
      const hasExtras = item.bebida || item.ingredientes;
      itemsHTML += `
        <div class="summary-item row">
          <div class="col-8 item-info">
            <div class="item-name">${item.nombre} x${item.quantity}</div>
            ${hasExtras ? `
              <div class="item-extras">
                ${item.bebida ? `<div class="item-drink"><small>+ ${item.bebida}</small></div>` : ''}
                ${item.ingredientes ? `<div class="item-ingredients"><small>${item.ingredientes}</small></div>` : ''}
              </div>
            ` : ''}
          </div>
          <div class="col-4 item-price text-end">
            $${(item.precio * item.quantity).toFixed(2)}
          </div>
        </div>
      `;
    });

    $('#summary-items').html(itemsHTML);
  },

  // Calcula y muestra los totales (VERSIÓN SIMPLIFICADA)
  calculateTotals() {
  const exchangeRate = Cart.exchangeRate || 36.50; // Asegúrate de tener la tasa actual
  
  // Cálculos en USD
  const subtotalUSD = Cart.cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
  const isDelivery = $('input[name="tipo-entrega"]:checked').val() === 'delivery';
  const shippingCostUSD = isDelivery ? 5.00 : 0;
  const totalUSD = subtotalUSD + shippingCostUSD;
  
  // Cálculos en Bs
  const subtotalBS = subtotalUSD * exchangeRate;
  const shippingCostBS = shippingCostUSD * exchangeRate;
  const totalBS = totalUSD * exchangeRate;

  // Mostrar ambos montos
  $('#summary-subtotal').html(`
    $${subtotalUSD.toFixed(2)} <small class="text-muted">| Bs. ${subtotalBS.toFixed(2)}</small>
  `);
  
  $('#summary-shipping').html(`
    $${shippingCostUSD.toFixed(2)} <small class="text-muted">| Bs. ${shippingCostBS.toFixed(2)}</small>
  `);
  
  $('#summary-total').html(`
    <strong>$${totalUSD.toFixed(2)}</strong> <small class="text-muted">| Bs. ${totalBS.toFixed(2)}</small>
  `);
}
};