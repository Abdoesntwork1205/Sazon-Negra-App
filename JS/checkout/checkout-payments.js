/* MÓDULO DE MÉTODOS DE PAGO
 * - Configuración de métodos
 * - Validación de selección
 * - Mostrar detalles específicos
 * - Generación de datos para el pedido
 */
const CheckoutPayments = {
  paymentMethods: {
    transferencia: {
      name: 'Transferencia Bancaria',
      icon: 'university',
      details: {
        banco: 'Banco Nacional',
        tipo_cuenta: 'Corriente',
        numero: '1234-5678-9012-3456',
        titular: 'Mi Empresa S.A.',
        rif: 'J-123456789'
      }
    },
    pago_movil: {
      name: 'Pago Móvil',
      icon: 'mobile-alt',
      details: {
        telefono: '0412-1234567',
        cedula: 'V-12345678',
        banco: 'Banco Nacional'
      }
    },
    zelle: {
      name: 'Zelle',
      icon: 'exchange-alt',
      details: {
        email: 'pagos@miempresa.com',
        nombre: 'Mi Empresa LLC'
      }
    },
    efectivo_nacional: {
      name: 'Efectivo Nacional',
      icon: 'money-bill-wave'
    },
    efectivo_internacional: {
      name: 'Efectivo USD',
      icon: 'dollar-sign'
    },
    tarjeta: {
      name: 'Tarjeta Crédito/Débito',
      icon: 'credit-card'
    }
  },

  init() {
    this.setupPaymentMethods();
    this.setupConfirmationDetails();
  },

  // Configura eventos de métodos de pago
  setupPaymentMethods() {
    $(document).on('change', 'input[name="payment-method"]', (e) => {
      const method = $(e.target).val();
      this.showPaymentDetails(method);
      this.updateConfirmationDetails(method);
      this.validatePaymentSelection();
    });
  },

  // Muestra detalles según método seleccionado
  showPaymentDetails(method) {
  // Ocultar todos los detalles primero
  $('#payment-details-container, .payment-details').hide();
  
  // Mostrar detalles específicos si aplica
  if (this.paymentMethods[method]?.details) {
    $(`#${method}-details`).show(); // Asegúrate que method sea exactamente "pago_movil"
    $('#payment-details-container').show();
  }
},

  // Configura sección de confirmación de pago
  setupConfirmationDetails() {
    $(document).on('change', 'input[name="payment-method"]', () => {
      this.updateConfirmationDetails();
    });
  },

  // Actualiza campos de confirmación según método
  updateConfirmationDetails(method) {
    $('.payment-confirm-details').hide();
    
    if (method) {
      $(`#${method}-confirm`).show();
    }
  },

  // Valida que se haya seleccionado un método
  // En CheckoutPayments
validatePaymentSelection() {
  const hasSelection = $('input[name="payment-method"]:checked').length > 0;
  
  if (!hasSelection) {
    // Mostrar SweetAlert con icono de error
    Cart.showErrorAlert(
      'Método de pago requerido', 
      'Por favor selecciona un método de pago para continuar',
      'warning' // Cambiamos a warning para que sea amarillo y más llamativo
    );
    
    // Efectos visuales en el formulario
    $('.payment-methods').addClass('border border-warning rounded p-2');
    $('.payment-option').addClass('text-warning');
    
    // Animación de sacudida
    $('.payment-methods').css('animation', 'shake 0.5s');
    setTimeout(() => {
      $('.payment-methods').css('animation', '');
    }, 500);
    
    // Desplazamiento al área de pago
    $('.checkout-modal').animate({
      scrollTop: $('.payment-methods').offset().top - 20
    }, 500);
    
    return false;
  }
  
  // Limpiar estilos si está seleccionado
  $('.payment-methods').removeClass('border border-warning');
  $('.payment-option').removeClass('text-warning');
  return true;
},

  // Genera datos de pago para el pedido
getPaymentDetails() {
  const method = $('input[name="payment-method"]:checked').val();
  if (!method) return null;

  // Mapear los métodos de efectivo a "efectivo" para el backend
  const backendMethod = method.includes('efectivo') ? 'efectivo' : method;

  const baseDetails = {
    method: backendMethod, // Usamos el nombre mapeado
    name: this.paymentMethods[method].name,
    icon: this.paymentMethods[method].icon,
    reference: $('#payment-reference').val() || `REF-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
  };

  // Agregar detalles específicos
  switch(method) {
    case 'transferencia':
      return {
        ...baseDetails,
        amount: $('#payment-amount').val(),
        date: $('#payment-date').val(),
        ...this.paymentMethods.transferencia.details
      };
    
    case 'pago_movil':
      return {
        ...baseDetails,
        from_phone: $('#movil-phone').val(),
        ...this.paymentMethods.pago_movil.details
      };
    
    case 'zelle':
      return {
        ...baseDetails,
        from_email: $('#zelle-email').val(),
        ...this.paymentMethods.zelle.details
      };
    
    case 'efectivo_internacional':
      return {
        ...baseDetails,
        exchange_rate: $('#exchange-rate').val() || 'N/A',
        tipo_efectivo: 'internacional' // Añadimos tipo para diferenciar
      };
    
    case 'efectivo_nacional':
      return {
        ...baseDetails,
        tipo_efectivo: 'nacional' // Añadimos tipo para diferenciar
      };
    
    default:
      return baseDetails;
  }
},

  // En CheckoutPayments, mejora la función validatePaymentDetails
// En CheckoutPayments
validatePaymentDetails() {
  // Validar que se haya seleccionado un método
  const method = $('input[name="payment-method"]:checked').val();
  if (!method) {
    return false;
  }

  // Validar referencia de pago (requerida para todos)
  if (!$('#payment-reference').val().trim()) {
    $('#payment-reference').addClass('is-invalid');
    $('#payment-reference').after('<div class="invalid-feedback">Ingresa la referencia de pago</div>');
    return false;
  }

  // Limpiar validaciones anteriores
  $('.is-invalid').removeClass('is-invalid');
  $('.invalid-feedback').remove();

  return true;
}
};