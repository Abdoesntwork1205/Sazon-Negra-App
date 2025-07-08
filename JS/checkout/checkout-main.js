/**
 * MÓDULO PRINCIPAL DEL CHECKOUT - VERSIÓN CORREGIDA
 */
const CheckoutModal = {
  currentStep: 1,
  modalLoaded: false,
  modalRequested: false,
  
  // Inicialización principal
  init: function() {
    this.setupCheckoutButtons();
    this.preloadModal();
    this.setupGlobalListeners();
  },

  // Precarga el modal en segundo plano
  preloadModal: function() {
    if (this.modalLoaded || $('#checkoutModal').length > 0) return;
    
    $.get('../includes/checkout-modal.php')
      .done((data) => {
        $('body').append(data);
        this.modalLoaded = true;
        this.initDependentModules();
        if (this.modalRequested) this.showModal();
      })
      .fail((error) => {
        console.error('Error al cargar el modal:', error);
        if (typeof Cart !== 'undefined') {
          Cart.showErrorAlert('Error', 'No se pudo cargar el formulario de pago');
        }
      });
  },

  // Inicializa módulos dependientes
  initDependentModules: function() {
    this.setupModalListeners();
    if (typeof CheckoutGeo !== 'undefined') CheckoutGeo.init();
    if (typeof CheckoutPayments !== 'undefined') CheckoutPayments.init();
    if (typeof CheckoutSteps !== 'undefined') CheckoutSteps.init();
  },

  // Configura listeners globales
  setupGlobalListeners: function() {
    $(document).on('click', '.btn-checkout', (e) => this.handleCheckoutClick(e));
  },

  // Configura listeners del modal
  setupModalListeners: function() {
    $('#checkoutModal')
      .on('shown.bs.modal', () => this.handleModalShown())
      .on('hidden.bs.modal', () => this.handleModalHidden());
  },

  // Configura botones de checkout
  setupCheckoutButtons: function() {
    $(document).on('click', '.btn-checkout', (e) => {
      e.preventDefault();
      this.handleCheckoutClick(e);
    });
  },

  // Maneja el clic para mostrar el modal
  handleCheckoutClick: function(e) {
    e.preventDefault();
    
    if (typeof Cart === 'undefined' || Cart.cart.length === 0) {
      if (typeof Cart !== 'undefined') {
        Cart.showErrorAlert('Carrito vacío', 'Añade productos antes de pagar');
      }
      return;
    }
    
    if (this.modalLoaded) {
      this.showModal();
    } else {
      this.modalRequested = true;
      this.preloadModal();
      this.ensureModalShows();
    }
  },

  // Garantiza que el modal se muestre
  ensureModalShows: function() {
    const maxAttempts = 3;
    let attempts = 0;
    
    const tryShowModal = setInterval(() => {
      attempts++;
      
      if (this.modalLoaded) {
        clearInterval(tryShowModal);
        this.showModal();
      } else if (attempts >= maxAttempts) {
        clearInterval(tryShowModal);
        this.fallbackModalShow();
        console.warn('Modal cargado mediante método alternativo');
      }
    }, 500);
  },

  // Muestra el modal con control de errores
  showModal: function() {
    try {
      $('#checkoutModal').modal('show');
      
      setTimeout(() => {
        if ($('#checkoutModal').is(':hidden')) {
          this.fallbackModalShow();
        }
      }, 300);
      
      this.resetToFirstStep();
    } catch (e) {
      console.error('Error al mostrar modal:', e);
      this.fallbackModalShow();
    }
  },

  // Método alternativo para mostrar el modal
  fallbackModalShow: function() {
    $('#checkoutModal')
      .css({
        'display': 'block',
        'padding-right': '17px',
        'background': 'rgba(0,0,0,0.5)'
      })
      .addClass('show');
    
    $('<div class="modal-backdrop fade show"></div>').appendTo('body');
    $('body').addClass('modal-open');
    
    this.resetToFirstStep();
  },

  // Reset al primer paso
  resetToFirstStep: function() {
    this.currentStep = 1;
    $('.checkout-step').removeClass('active').find('.step-content').hide();
    $('.checkout-step[data-step="1"]').addClass('active').find('.step-content').show();
    this.updateStepControls();
  },

  // Maneja cuando el modal se muestra
  handleModalShown: function() {
    this.resetToFirstStep();
    $('#payment-details-container, .payment-details').hide();
  },

  // Maneja cuando el modal se oculta
  handleModalHidden: function() {
    $('input[name="payment-method"]').prop('checked', false);
    $('.payment-option input').removeClass('is-invalid');
  },

  // Actualiza controles de navegación
  updateStepControls: function() {
    const deliveryType = $('input[name="tipo-entrega"]:checked').val();
    
    $('.btn-prev')
      .prop('disabled', this.currentStep === 1)
      .toggle(this.currentStep > 1);
    
    $('.btn-next')
      .toggle(this.currentStep < 4)
      .toggle(!(this.currentStep === 1 && deliveryType === 'recoger'));
    
    $('.btn-confirm')
      .toggle(this.currentStep === 4)
      .prop('disabled', !$('#accept-terms').is(':checked'));
  }
};

// Inicialización con protección completa
$(document).ready(() => {
  // Verificar dependencias mínimas
  if (typeof $ === 'undefined') {
    console.error('Error: jQuery no está cargado');
    return;
  }

  // Polyfill para modal() si Bootstrap no está cargado
  if (typeof $.fn.modal === 'undefined') {
    $.fn.modal = function() {
      this.css('display', 'block');
      return this;
    };
    console.warn('Bootstrap Modal no encontrado, usando polyfill básico');
  }

  // Iniciar módulo
  CheckoutModal.init();
});