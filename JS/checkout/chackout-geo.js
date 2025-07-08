/**
 * MÓDULO DE GEOLOCALIZACIÓN
 * - Detección de ubicación
 * - Manejo de permisos
 * - Mapeo de coordenadas
 */
const CheckoutGeo = {
  // Estado del botón
  btnElement: null,
  isProcessing: false,

  init() {
    this.cacheElements();
    this.setupGeolocation();
  },

  // Cachear elementos DOM
  cacheElements() {
    this.btnElement = $('#btn-geolocalizacion');
  },

  // Configura el botón de geolocalización
  setupGeolocation() {
    if (!this.btnElement.length) return;
    this.btnElement.off('click').on('click', () => {
      if (!this.isProcessing) this.handleGeolocation();
    });
  },

  // Maneja la obtención de coordenadas
   handleGeolocation() {
    if (!navigator.geolocation) {
      return Cart.showErrorAlert(
        'Geolocalización no soportada', 
        'Tu navegador no soporta esta funcionalidad'
      );
    }

    this.setLoadingState(true);

    navigator.geolocation.getCurrentPosition(
      position => this.onGeoSuccess(position),
      error => this.onGeoError(error),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  },

  // Éxito al obtener ubicación
 onGeoSuccess(position) {
  const { latitude: lat, longitude: lng } = position.coords;
  
  // Actualiza solo los campos de coordenadas
  $('#direccion-latitud').val(lat.toFixed(6));
  $('#direccion-longitud').val(lng.toFixed(6));
  
  // Verifica si el campo de dirección existe y tiene valor antes de hacer trim()
  const direccionExacta = $('#direccion-exacta');
  if (direccionExacta.length && (!direccionExacta.val() || direccionExacta.val().trim() === '')) {
    direccionExacta.val(`Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
  }

  this.setSuccessState();
  Cart.showSuccessAlert(
    'Coordenadas obtenidas', 
    `Latitud: ${lat.toFixed(6)}\nLongitud: ${lng.toFixed(6)}`
  );
},

  // Error al obtener ubicación
  onGeoError(error) {
    let errorMessage = 'Error al obtener ubicación: ';
    
    switch(error.code) {
      case error.PERMISSION_DENIED:
        errorMessage += 'Permiso denegado. Por favor habilita la ubicación en tu navegador.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage += 'La información de ubicación no está disponible.';
        break;
      case error.TIMEOUT:
        errorMessage += 'La solicitud ha tardado demasiado. Intenta nuevamente en un área con mejor señal.';
        break;
      case error.UNKNOWN_ERROR:
      default:
        errorMessage += 'Ocurrió un error inesperado.';
    }

    this.setErrorState(errorMessage);
    Cart.showErrorAlert('Error de geolocalización', errorMessage);
  },

  // Establece estado de carga
  setLoadingState() {
    this.isProcessing = true;
    this.btnElement
      .html('<i class="fas fa-spinner fa-spin me-1"></i> Detectando ubicación...')
      .prop('disabled', true)
      .removeClass('btn-outline-success btn-outline-danger')
      .addClass('btn-outline-primary');
  },

  // Establece estado de éxito
  setSuccessState() {
    this.isProcessing = false;
    this.btnElement
      .html('<i class="fas fa-check-circle me-1"></i> Ubicación obtenida')
      .prop('disabled', false)
      .removeClass('btn-outline-primary btn-outline-danger')
      .addClass('btn-outline-success');
  },

  // Establece estado de error
  setErrorState(message) {
    this.isProcessing = false;
    this.btnElement
      .html('<i class="fas fa-exclamation-circle me-1"></i> Intentar nuevamente')
      .prop('disabled', false)
      .removeClass('btn-outline-primary btn-outline-success')
      .addClass('btn-outline-danger')
      .attr('title', message);
  }
};