/**
 * MANEJO DE PASOS DEL CHECKOUT
 * - Navegación entre pasos
 * - Validación de formularios
 * - Control de botones
 */
const CheckoutSteps = {
  currentStep: 1,
    deliveryType: null, // Trackear el tipo de entrega actual


  init() {
    this.setupNavigation();
    this.setupModalEvents();
    this.setupTermsCheckbox();
    this.setupUserDataAutofill(); // Nueva función

    $(document).on('change', 'input[name="tipo-entrega"]', function() {
    const isDelivery = $(this).val() === 'delivery';
    $('#address-options').toggle(isDelivery);
    
    if (isDelivery && userSessionData?.direccion) {
      $('#use-profile-address').prop('checked', true);
      $('#direccion-exacta').val(userSessionData.direccion).prop('disabled', true);
    } else {
      $('#direccion-exacta').prop('disabled', false);
    }
  });

  $(document).on('change', '#use-profile-address', function() {
    if ($(this).is(':checked') && userSessionData?.direccion) {
      $('#direccion-exacta').val(userSessionData.direccion).prop('disabled', true);
    } else {
      $('#direccion-exacta').prop('disabled', false).val('');
    }
  });


    


    // Eliminamos el listener de cambio en tipo-entrega ya que no necesitamos reacción inmediata
  },


  

   // Configurar el checkbox de términos y condiciones
    setupTermsCheckbox() {
      $('#accept-terms').on('change', () => {
          if (this.currentStep === 4) {
              $('.btn-confirm').prop('disabled', !$('#accept-terms').is(':checked'));
          }
      });
  },

 // En CheckoutSteps.js - Modificar la función setupUserDataAutofill
setupUserDataAutofill() {
  $('#checkoutModal').on('shown.bs.modal', () => {
    // Usar userData como fuente primaria, con fallback a userSessionData
    const sourceData = userData || userSessionData;
    
    if (sourceData && sourceData.nombre) {
      const checkoutFields = {
        '#checkout_nombre': `${sourceData.nombre} ${sourceData.apellido || ''}`.trim(),
        '#checkout_email': sourceData.correo || '',
        '#checkout_telefono': sourceData.telefono || '',
        '#checkout_cedula': sourceData.Cedula || '',
        '#checkout_nacionalidad': sourceData.Nacionalidad || 'V'
      };

      Object.entries(checkoutFields).forEach(([selector, value]) => {
        const $field = $(selector);
        $field.val(value)
          .prop('disabled', true)
          .addClass('bg-light')
          .attr('title', 'Para modificar estos datos, actualiza tu perfil');
        
        // Asegurar que los campos estén validados
        $field.removeClass('is-invalid')
          .next('.invalid-feedback').remove();
      });

      this.showProfileMessage();
    }
  });
},

showProfileMessage() {
  if ($('#profile-message-container').length === 0) {
    const message = `
      <div id="profile-message-container" class="alert alert-info mt-3">
        <i class="fas fa-info-circle me-2"></i>
        Tus datos personales están protegidos. Para modificarlos, 
        <a href="/mi-perfil" class="alert-link">actualiza tu perfil</a>.
      </div>
    `;
    $('#telefono').closest('.row').after(message);
  }
},
  // Configura eventos de navegación
  setupNavigation() {
    $(document)
      .on('click', '.btn-next', (e) => {
        e.preventDefault();
        this.validateAndProceed();
      })
      .on('click', '.btn-prev', (e) => {
        e.preventDefault();
        this.handlePrevious();
      })
      .on('click', '.btn-confirm', (e) => {
        e.preventDefault();
        this.handleOrderConfirmation();
      })
      .on('change', 'input[name="tipo-entrega"]', () => {
        this.deliveryType = $('input[name="tipo-entrega"]:checked').val();
        this.updateStepperVisual();
      });

    // En setupNavigation(), añade este evento:
  $(document).on('change', 'input[name="tipo-entrega"]', () => {
    this.deliveryType = $('input[name="tipo-entrega"]:checked').val();
    this.updateStepperVisual();
    
    // Actualizar sidebar en tiempo real
    if ($('#orderSidebar').hasClass('show')) {
      const isDelivery = this.deliveryType === 'delivery';
      Cart.updateShippingCost(isDelivery);
    }
  });
  },

  // Maneja el botón anterior correctamente
  handlePrevious() {
    let prevStep = this.currentStep - 1;
    
    // Mapeo correcto de pasos al retroceder
    if (this.deliveryType === 'recoger') {
      if (this.currentStep === 3) prevStep = 1; // Del pago volvemos a datos
      if (this.currentStep === 4) prevStep = 3; // De confirmación volvemos a pago
    } else {
      // Flujo normal para delivery
      if (this.currentStep === 4) prevStep = 3;
      if (this.currentStep === 3) prevStep = 2;
      if (this.currentStep === 2) prevStep = 1;
    }
    
    this.goToStep(prevStep);
  },

  // Configura eventos del modal
  setupModalEvents() {
  $('#checkoutModal')
    .on('shown.bs.modal', () => {
      // Verificar si hay datos actualizados
      if (userData && userSessionData) {
        $.extend(userSessionData, {
          nombre: userData.nombre,
          apellido: userData.apellido,
          telefono: userData.telefono,
          correo: userData.correo,
          Cedula: userData.Cedula,
          Nacionalidad: userData.Nacionalidad,
        });
      }
      this.handleModalShown();
    })
    .on('hidden.bs.modal', () => this.handleModalHidden());
},

  // Valida y avanza al siguiente paso

validateAndProceed() {
  if (this.currentStep === 3) {
    // Validar SOLO la selección del método
    if (!$('input[name="payment-method"]:checked').val()) {
      CheckoutPayments.validatePaymentSelection();
      return;
    }
  }
  
  if (this.validateStep(this.currentStep)) {
    let nextStep = this.currentStep + 1;
    
    if (this.deliveryType === 'recoger' && this.currentStep === 1) {
      nextStep = 3;
    }
    
    this.goToStep(nextStep);
  }
},

  

  // Navegación entre pasos
  goToStep(step) {
    if (step < 1 || step > 4) return;

    // Actualizar paso actual
    $(`.checkout-step[data-step="${this.currentStep}"]`).removeClass('active');
    $(`.checkout-step[data-step="${this.currentStep}"] .step-content`).hide();
    
    this.currentStep = step;
    
    // Mostrar nuevo paso
    $(`.checkout-step[data-step="${this.currentStep}"]`).addClass('active');
    $(`.checkout-step[data-step="${this.currentStep}"] .step-content`)
      .show()
      .addClass('animated fadeIn');

    // Actualizar UI
    this.updateStepperVisual();
    this.updateStepControls();

    if (this.currentStep === 4) {
      CheckoutSummary.loadOrderSummary();
    }

    $('.checkout-modal').animate({ scrollTop: 0 }, 200);
  },
  // Actualiza el stepper visual
  updateStepperVisual() {
    // Obtener tipo de entrega actual
    this.deliveryType = $('input[name="tipo-entrega"]:checked').val();
    
    // Resetear todos los steps
    $('.step').removeClass('active completed current skipped');
    
    // Marcar steps anteriores como completados
    for (let i = 1; i < this.currentStep; i++) {
      // Saltar paso 2 si es recoger
      if (!(this.deliveryType === 'recoger' && i === 2)) {
        $(`.step[data-step="${i}"]`).addClass('completed');
      }
    }
    
    // Marcar current step
    $(`.step[data-step="${this.currentStep}"]`).addClass('active current');
    
    // Manejar paso saltado (dirección)
    if (this.deliveryType === 'recoger') {
      $('.step[data-step="2"]').addClass('skipped');
      
      // Si estamos en pago o confirmación, marcar dirección como completada (pero saltada)
      if (this.currentStep >= 3) {
        $('.step[data-step="2"]').addClass('completed');
      }
    }
  },

  // Validación de campos por paso
  // Actualizar validación del paso 1
validateStep(step) {
  let isValid = true;
  const deliveryType = $('input[name="tipo-entrega"]:checked').val();

  if (step === 1) {
    // Validar solo campos de checkout (con prefijo)
    ['#checkout_nombre', '#checkout_cedula', '#checkout_email', '#checkout_telefono'].forEach(selector => {
      const $field = $(selector);
      
      if ($field.length && $field.prop('disabled')) {
        // Si está deshabilitado (datos de perfil), se considera válido
        $field.removeClass('is-invalid');
        return;
      }

      if (!$field.val().trim()) {
        $field.addClass('is-invalid');
        $field.next('.invalid-feedback').remove();
        $field.after('<div class="invalid-feedback">Este campo es requerido</div>');
        isValid = false;
      } else {
        $field.removeClass('is-invalid');
      }
    });

    // Validación especial para email
    const $email = $('#checkout_email');
    if ($email.length && !$email.prop('disabled')) {
      const email = $email.val();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        $email.addClass('is-invalid');
        $email.next('.invalid-feedback').remove();
        $email.after('<div class="invalid-feedback">Ingrese un correo válido</div>');
        isValid = false;
      }
    }


    // Validar tipo de entrega
    if (!deliveryType) {
      $('.form-check-input[name="tipo-entrega"]').addClass('is-invalid');
      isValid = false;
    } else {
      $('.form-check-input[name="tipo-entrega"]').removeClass('is-invalid');
    }
  }

    else if (step === 2 && deliveryType === 'delivery') {
  if (!$('#direccion-exacta').val().trim()) {
    $('#direccion-exacta')
      .addClass('is-invalid')
      .next('.invalid-feedback').remove()
      .after('<div class="invalid-feedback">Por favor ingresa tu dirección exacta</div>');
    isValid = false;
  } else {
    $('#direccion-exacta').removeClass('is-invalid');
  }
  
  // Las coordenadas son opcionales, no se validan
}

// Paso 3: Pago (nuevas validaciones)
  // En CheckoutSteps - Modifica solo la parte del paso 3
else if (step === 3) {
  // Validar únicamente que se haya seleccionado un método de pago
  if (!$('input[name="payment-method"]:checked').val()) {
    $('.payment-methods').addClass('border border-warning rounded p-2');
    $('.payment-methods').after('<div class="invalid-feedback d-block text-center mb-2">Por favor selecciona un método de pago</div>');
    
    // Mostrar SweetAlert
    Cart.showErrorAlert(
      'Método de pago requerido', 
      'Por favor selecciona cómo deseas pagar para continuar',
      'warning'
    );
    
    // Efectos visuales
    $('.payment-methods').css('animation', 'shake 0.5s');
    setTimeout(() => $('.payment-methods').css('animation', ''), 500);
    
    // Desplazamiento al área de pago
    $('.checkout-modal').animate({
      scrollTop: $('.payment-methods').offset().top - 20
    }, 500);
    
    isValid = false;
  } else {
    $('.payment-methods').removeClass('border border-warning');
    $('.payment-methods').next('.invalid-feedback').remove();
  }
  
}

    // Mostrar error general si hay problemas
    if (!isValid) {
      Cart.showErrorAlert('Error', 'Por favor completa todos los campos requeridos');
      const $firstError = $('.is-invalid').first();
      if ($firstError.length) {
        $('.checkout-modal').animate({ scrollTop: $firstError.offset().top - 20 }, 200);
      }
    }

    return isValid;
  },

  // Actualiza estado de botones (SIMPLIFICADO)
  updateStepControls() {
    const deliveryType = $('input[name="tipo-entrega"]:checked').val();
    
    // Botón Anterior
    $('.btn-prev')
        .prop('disabled', this.currentStep === 1)
        .toggle(this.currentStep > 1);
    
    // Botón Siguiente - solo visible si no es el último paso
    $('.btn-next').toggle(this.currentStep < 4);
    
    // Botón Confirmar - solo visible en el último paso
    $('.btn-confirm').toggle(this.currentStep === 4);
    
    // Estado del botón Confirmar (depende de los términos)
    if (this.currentStep === 4) {
        $('.btn-confirm')
            .prop('disabled', !$('#accept-terms').is(':checked'))
            .show(); // Forzar mostrar en paso 4
    } else {
        $('.btn-confirm').hide(); // Asegurar que está oculto en otros pasos
    }
},

  handleOrderConfirmation() {
    if ($('#accept-terms').is(':checked')) {
      CheckoutAPI.processOrder(); // Cambiamos esto para usar nuestro nuevo módulo
    } else {
      Cart.showErrorAlert('Error', 'Debes aceptar los términos y condiciones');
    }
  },

  // Maneja cuando se muestra el modal
  handleModalShown() {
    this.goToStep(1); // Siempre comenzar en paso 1
    $('#payment-details-container, .payment-details').hide();
  },

  // Maneja cuando se oculta el modal
  handleModalHidden() {
    $('input[name="payment-method"]').prop('checked', false);
    $('.payment-option input').removeClass('is-invalid');
  }

  
};