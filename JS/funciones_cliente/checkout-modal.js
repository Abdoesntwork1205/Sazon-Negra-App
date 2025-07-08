
// checkout-modal.js - Versión mejorada
const CheckoutModal = {
  currentStep: 1,
  modalLoaded: false,
  
  init() {
    this.loadModal();
    this.setupCheckoutButtons();
    this.setupGeolocation(); // <-- Añade esta línea

  },


  

  loadModal() {
    if (!this.modalLoaded && $('#checkoutModal').length === 0) {
      $.get('../includes/checkout-modal.php', (data) => {
        $('body').append(data);
        this.setupEventListeners();
        this.modalLoaded = true;
      }).fail(() => {
        console.error('Error al cargar el modal de checkout');
      });
    }
  },

  setupCheckoutButtons() {
    $(document).on('click', '.btn-checkout', (e) => {
      e.preventDefault();
      this.handleCheckoutClick();
    });
  },


    setupGeolocation() {
  // Verificamos primero si el modal está cargado
  if (!this.modalLoaded) {
    console.log('Modal no cargado, reintentando en 500ms...');
    setTimeout(() => this.setupGeolocation(), 500);
    return;
  }

  const $btn = $('#btn-geolocalizacion');
  
  if ($btn.length === 0) {
    console.error('Error: Botón de geolocalización no encontrado');
    return;
  }

  console.log('Registrando evento de geolocalización...'); // Debug

  $btn.off('click').on('click', () => { // Elimina cualquier evento previo
    console.log('Click en geolocalización detectado'); // Debug
    
    if (!navigator.geolocation) {
      const errorMsg = 'Tu navegador no soporta geolocalización';
      console.error(errorMsg);
      Cart.showErrorAlert('Error', errorMsg);
      return;
    }

    console.log('Solicitando permisos de ubicación...'); // Debug
    
    $btn.html('<i class="fas fa-spinner fa-spin me-1"></i> Detectando...').prop('disabled', true);

    const options = {
      enableHighAccuracy: true,
      timeout: 15000, // 15 segundos
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        console.log('Ubicación obtenida:', { lat, lng }); // Debug
        
        $('#direccion-latitud').val(lat);
        $('#direccion-longitud').val(lng);
        
        // Actualiza la dirección automáticamente si es posible
        if (!$('#direccion-completa').val()) {
          $('#direccion-completa').val(`Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
        
        $btn.html('<i class="fas fa-check-circle me-1"></i> Ubicación obtenida')
            .prop('disabled', false);
            
        alert(`Ubicación obtenida correctamente!\nLatitud: ${lat}\nLongitud: ${lng}`);
      },
      (error) => {
        console.error('Error de geolocalización:', error); // Debug
        let errorMsg = 'Error al obtener ubicación: ';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += 'Permiso denegado. Por favor habilita la ubicación en tu navegador.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += 'La información de ubicación no está disponible.';
            break;
          case error.TIMEOUT:
            errorMsg += 'La solicitud de ubicación ha tardado demasiado.';
            break;
          default:
            errorMsg += 'Error desconocido.';
        }
        
        $btn.html('<i class="fas fa-map-marker-alt me-1"></i> Usar ubicación')
            .prop('disabled', false);
            
        Cart.showErrorAlert('Error de ubicación', errorMsg);
      },
      options
    );
  });
  
  console.log('Evento de geolocalización registrado correctamente'); // Debug
},

  handleCheckoutClick() {
    if (Cart.cart.length === 0) {
      Cart.showErrorAlert('Carrito vacío', 'Añade productos antes de pagar');
      return;
    }
    
    if (!this.modalLoaded) {
      this.loadModal();
      setTimeout(() => $('#checkoutModal').modal('show'), 300);
    } else {
      $('#checkoutModal').modal('show');
    }
  },

  setupEventListeners() {
  // Navegación entre pasos
  $(document).on('click', '.btn-next', () => {
    if(this.validateStep(this.currentStep)) {
      this.goToStep(this.currentStep + 1);
    }
  });
  
  $(document).on('click', '.btn-prev', () => {
    this.goToStep(this.currentStep - 1);
  });
  
  // Confirmación de pedido
  $(document).on('click', '.btn-confirm', () => {
    if($('#accept-terms').is(':checked')) {
      this.processOrder();
    } else {
      Cart.showErrorAlert('Error', 'Debes aceptar los términos y condiciones');
    }
  });
  
  // Manejo del tipo de entrega
  $(document).on('change', 'input[name="tipo-entrega"]', () => {
    if ($('input[name="tipo-entrega"]:checked').val() === 'recoger') {
      // Si selecciona recoger, saltar a paso 3 (pago) si estamos en paso 1
      if (this.currentStep === 1) {
        this.goToStep(3);
      }
    }
    this.updateStepControls();
  });
  
  // Mostrar detalles específicos según método de pago
  $(document).on('change', 'input[name="payment-method"]', function() {
    $('#payment-details-container').hide();
    $('.payment-details').hide();
      $('.payment-confirm-details').hide();

    
    const method = $(this).val();
    if (method === 'transferencia') {
      $('#transferencia-details').show();
      $('#payment-details-container').show();
    } else if (method === 'pago_movil') {
      $('#pago-movil-details').show();
      $('#payment-details-container').show();
    } else if (method === 'zelle') {
      $('#zelle-details').show();
      $('#payment-details-container').show();
    }
    

    
    
    // Actualizar controles para habilitar confirmación si hay método seleccionado
    CheckoutModal.updateStepControls();
  });
  
  // Validar términos y condiciones en tiempo real
  $(document).on('change', '#accept-terms', () => {
    $('.btn-confirm').prop('disabled', !$('#accept-terms').is(':checked'));
  });
  
  // Inicialización del modal
  $('#checkoutModal').on('shown.bs.modal', () => {
    this.goToStep(1);
    // Resetear detalles de pago al mostrar el modal
    $('#payment-details-container').hide();
    $('.payment-details').hide();
  });
  
  // Evento para cerrar modal
  $('#checkoutModal').on('hidden.bs.modal', () => {
    // Resetear selección de métodos de pago
    $('input[name="payment-method"]').prop('checked', false);
    $('.payment-option input').removeClass('is-invalid');
  });
  
  // Evento para geolocalización (si ya no está en setupGeolocation)
  $(document).on('click', '#btn-geolocalizacion', this.handleGeolocation.bind(this));
},

  goToStep(step) {
  // Validar límites del paso (1-4)
  if (step < 1 || step > 4) return;
  
  // Lógica para saltar la dirección si es recoger en local
  if (step === 2 && $('input[name="tipo-entrega"]:checked').val() === 'recoger') {
    step = 3;
  }
  
  // Ocultar paso actual
  $(`.checkout-step[data-step="${this.currentStep}"]`).removeClass('active');
  $(`.checkout-step[data-step="${this.currentStep}"] .step-content`).removeClass('active').hide();
  
  // Actualizar stepper visual (los círculos numerados)
  $(`.step[data-step="${this.currentStep}"]`).removeClass('active');
  
  // Establecer nuevo paso
  this.currentStep = step;
  
  // Mostrar nuevo paso con animación
  $(`.checkout-step[data-step="${this.currentStep}"]`).addClass('active');
  $(`.checkout-step[data-step="${this.currentStep}"] .step-content`)
    .addClass('active')
    .show()
    .addClass('animated fadeIn');
  
  // Actualizar stepper visual
  $(`.step[data-step="${this.currentStep}"]`).addClass('active');
  
  // Actualizar controles de navegación (botones anterior/siguiente/confirmar)
  this.updateStepControls();
  
  // Si llegamos al paso 4 (confirmación), cargar el resumen del pedido
  if (this.currentStep === 4) {
    this.loadOrderSummary();
  }
  
  // Scroll al inicio del paso para mejor experiencia de usuario
  $('.checkout-modal').animate({
    scrollTop: 0
  }, 200);
},

  updateStepControls() {
  // Botón Anterior
  $('.btn-prev')
    .prop('disabled', this.currentStep === 1)
    .toggle(this.currentStep > 1);
  
  // Botón Siguiente
  $('.btn-next').toggle(this.currentStep < 4);
  
  // Ocultar siguiente si estamos en paso 1 y es recoger en local
  if (this.currentStep === 1 && $('input[name="tipo-entrega"]:checked').val() === 'recoger') {
    $('.btn-next').hide();
  }
  
  // Botón Confirmar
  $('.btn-confirm')
    .toggle(this.currentStep === 4)
    .prop('disabled', !$('#accept-terms').is(':checked'));
  
  // Actualizar estado de los términos si estamos en el paso 4
  if (this.currentStep === 4) {
    $('#accept-terms').on('change', () => {
      $('.btn-confirm').prop('disabled', !$('#accept-terms').is(':checked'));
    });
  }
},

 validateStep(step) {
  let isValid = true;
  const deliveryType = $('input[name="tipo-entrega"]:checked').val();
  
  // Validación del Paso 1: Datos Personales
  if (step === 1) {
    // Validar campos obligatorios
    ['#nombre', '#cedula', '#email', '#telefono'].forEach(selector => {
      const $field = $(selector);
      if (!$field.val().trim()) {
        $field.addClass('is-invalid');
        isValid = false;
        
        // Agregar mensaje de error si no existe
        if (!$field.next('.invalid-feedback').length) {
          $field.after('<div class="invalid-feedback">Este campo es requerido</div>');
        }
      } else {
        $field.removeClass('is-invalid');
        $field.next('.invalid-feedback').remove();
      }
    });
    
    // Validar que se haya seleccionado tipo de entrega
    if (!deliveryType) {
      isValid = false;
      $('.form-check-input[name="tipo-entrega"]').addClass('is-invalid');
    } else {
      $('.form-check-input[name="tipo-entrega"]').removeClass('is-invalid');
    }
  }
  
  // Validación del Paso 2: Dirección (solo si es delivery)
  else if (step === 2 && deliveryType === 'delivery') {
    // Validar dirección completa
    if (!$('#direccion-completa').val().trim()) {
      $('#direccion-completa').addClass('is-invalid');
      isValid = false;
      
      if (!$('#direccion-completa').next('.invalid-feedback').length) {
        $('#direccion-completa').after('<div class="invalid-feedback">Por favor ingresa tu dirección</div>');
      }
    } else {
      $('#direccion-completa').removeClass('is-invalid');
      $('#direccion-completa').next('.invalid-feedback').remove();
    }
  }
  
  // Validación del Paso 3: Método de Pago
  else if (step === 3) {
    // Validar que se haya seleccionado método de pago
    if (!$('input[name="payment-method"]:checked').val()) {
      isValid = false;
      $('.payment-option input').addClass('is-invalid');
      
      // Mostrar mensaje de error
      if (!$('.payment-methods').next('.invalid-feedback').length) {
        $('.payment-methods').after('<div class="invalid-feedback text-center">Selecciona un método de pago</div>');
      }
    } else {
      $('.payment-option input').removeClass('is-invalid');
      $('.payment-methods').next('.invalid-feedback').remove();
    }
  }
  
  // Mostrar mensaje de error general si hay problemas
  if (!isValid) {
    Cart.showErrorAlert('Error', 'Por favor completa todos los campos requeridos');
    
    // Scroll al primer error encontrado
    const $firstError = $('.is-invalid').first();
    if ($firstError.length) {
      $('.checkout-modal').animate({
        scrollTop: $firstError.offset().top - 20
      }, 200);
    }
  }
  
  return isValid;
},

  loadOrderSummary() {

    const personalData = `
    <strong>${$('#nombre').val()}</strong><br>
    <small>Cédula: ${$('#cedula').val()}</small><br>
    <small>Tel: ${$('#telefono').val()} | Email: ${$('#email').val()}</small>
  `;
  $('#summary-personal').html(personalData);
  
  // Generar resumen de entrega
  const deliveryType = $('input[name="tipo-entrega"]:checked').val();
  let deliveryText = '';
  
  if (deliveryType === 'recoger') {
    deliveryText = '<i class="fas fa-store"></i> Recoger en el local';
  } else {
    deliveryText = `
      <i class="fas fa-truck"></i> Delivery a:<br>
      ${$('#direccion-calle').val()}, ${$('#direccion-colonia').val()}<br>
      ${$('#direccion-ciudad').val()}, ${$('#direccion-estado').val()} ${$('#direccion-cp').val() || ''}<br>
      <small class="text-muted">${$('#direccion-referencias').val() || 'Sin referencias adicionales'}</small>
    `;
  }
  $('#summary-delivery').html(deliveryText);
    // Generar resumen de dirección
    const address = `
      ${$('#direccion-calle').val()}, ${$('#direccion-colonia').val()}<br>
      ${$('#direccion-ciudad').val()}, ${$('#direccion-estado').val()} ${$('#direccion-cp').val()}<br>
      <small class="text-muted">${$('#direccion-referencias').val() || 'Sin referencias adicionales'}</small>
    `;
    $('#summary-address').html(address);
    
     const paymentMethod = $('input[name="payment-method"]:checked').val();
  let paymentText = '';
  
  switch(paymentMethod) {
    case 'efectivo_nacional':
      paymentText = '<i class="fas fa-money-bill-wave"></i> Efectivo Nacional (Moneda Local)';
      break;
    case 'efectivo_internacional':
      paymentText = '<i class="fas fa-dollar-sign"></i> Efectivo Internacional (USD)';
      break;
    case 'transferencia':
      paymentText = '<i class="fas fa-university"></i> Transferencia Bancaria';
      break;
    case 'pago_movil':
      paymentText = '<i class="fas fa-mobile-alt"></i> Pago Móvil';
      break;
    case 'tarjeta':
      paymentText = '<i class="fas fa-credit-card"></i> Tarjeta Crédito/Débito';
      break;
    case 'zelle':
      paymentText = '<i class="fas fa-exchange-alt"></i> Zelle';
      break;
  }
  $('#summary-payment').html(paymentText);
    
    // Generar resumen de productos
    let itemsHTML = '';
    Cart.cart.forEach(item => {
      itemsHTML += `
        <div class="summary-item">
          <div>
            <strong>${item.nombre}</strong> x${item.quantity}
            ${item.bebida ? `<div class="text-muted small">+ ${item.bebida}</div>` : ''}
          </div>
          <div>$${(item.precio * item.quantity).toFixed(2)}</div>
        </div>
      `;
    });
    $('#summary-items').html(itemsHTML);
    
    // Calcular totales
    const subtotal = Cart.cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    const shipping = 2.50;
    const total = subtotal + shipping;
    
    $('#summary-subtotal').text(`$${subtotal.toFixed(2)}`);
    $('#summary-total').text(`$${total.toFixed(2)}`);
  },

  processOrder() {
    const paymentMethod = $('input[name="payment-method"]:checked').val();
  let paymentDetails = {};
  
  // Agregar detalles específicos según el método
  switch(paymentMethod) {
    case 'transferencia':
      paymentDetails = {
        instrucciones: "Realizar transferencia a los datos proporcionados",
        referencia: "Ref: PED-" + Math.floor(Math.random() * 10000)
      };
      break;
    case 'pago_movil':
      paymentDetails = {
        telefono: "0412-1234567",
        referencia: "Ref: PM-" + Math.floor(Math.random() * 10000)
      };
      break;
    case 'zelle':
      paymentDetails = {
        email: "pagos@tuempresa.com",
        referencia: "Ref: ZELLE-" + Math.floor(Math.random() * 10000)
      };
      break;
    default:
      paymentDetails = {};
  }
    const orderData = {
    cliente: {
      nombre: $('#nombre').val(),
      cedula: $('#cedula').val(),
      email: $('#email').val(),
      telefono: $('#telefono').val()
    },
    entrega: {
      tipo: $('input[name="tipo-entrega"]:checked').val(),
      direccion: $('input[name="tipo-entrega"]:checked').val() === 'delivery' ? {
        texto: $('#direccion-completa').val(),
        referencias: $('#direccion-referencias').val(),
        latitud: $('#direccion-latitud').val() || null,
        longitud: $('#direccion-longitud').val() || null
      } : null
    },
    pago: {
      metodo: paymentMethod,
      detalles: paymentDetails
    },
    pago: $('input[name="payment-method"]:checked').attr('id').replace('pago-', ''),
    productos: Cart.cart,
    total: this.calculateTotal(),
    fecha: new Date().toISOString()
  };
    
    console.log('Pedido a procesar:', orderData);
    
    // Aquí iría tu AJAX para enviar el pedido
    $('#checkoutModal').modal('hide');
    Cart.showSuccessAlert('¡Pedido confirmado!', 'Gracias por tu compra');
    Cart.cart = [];
    Cart.saveCart();
  },

  calculateTotal() {
    const subtotal = Cart.cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    return subtotal + 2.50; // + envío
  }
};



// Inicialización
$(document).ready(() => {
  if (typeof Cart !== 'undefined') {
    CheckoutModal.init();
  } else {
    console.error('Cart no está definido');
  }
});


