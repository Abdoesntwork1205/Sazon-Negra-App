<!-- checkout-modal.php -->
<div class="modal fade" id="checkoutModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content checkout-modal">
      <!-- Header con stepper -->
      <div class="modal-header checkout-header">
        <div class="checkout-stepper">
            <div class="step active" data-step="1">
                <div class="step-circle">1</div>
                <div class="step-label">Datos</div>
            </div>
            <div class="step" data-step="2">
                <div class="step-circle">2</div>
                <div class="step-label">Dirección</div>
            </div>
            <div class="step" data-step="3">
                <div class="step-circle">3</div>
                <div class="step-label">Pago</div>
            </div>
            <div class="step" data-step="4">
                <div class="step-circle">4</div>
                <div class="step-label">Confirmar</div>
            </div>
            <div class="step-connector"></div>
        </div>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
      </div>
      
      <div class="modal-body">
        <form id="checkoutForm">
            <div class="checkout-step active" data-step="1">
  <div class="step-content animated fadeIn">
    <h5 class="step-title"><i class="fas fa-user me-2"></i>Datos Personales</h5>
    
    <div class="row g-3">
      <div class="col-md-6">
    <div class="form-floating">
      <input type="text" class="form-control" id="checkout_nombre" name="checkout_nombre" placeholder="Nombre completo" required>
      <label for="checkout_nombre">Nombre completo</label>
    </div>
  </div>
  <div class="col-md-6">
    <div class="input-group">
      <select class="form-select" id="checkout_nacionalidad" style="max-width: 80px;">
        <option value="V">V</option>
        <option value="E">E</option>
      </select>
      <div class="form-floating" style="flex-grow: 1;">
        <input type="text" class="form-control" id="checkout_cedula" placeholder="Cédula" required>
        <label for="checkout_cedula">Cédula</label>
      </div>
    </div>
  </div>
  <div class="col-md-6">
    <div class="form-floating">
      <input type="email" class="form-control" id="checkout_email" placeholder="Correo electrónico" required>
      <label for="checkout_email">Correo electrónico</label>
    </div>
  </div>
  <div class="col-md-6">
    <div class="form-floating">
      <input type="tel" class="form-control" id="checkout_telefono" placeholder="Teléfono" required>
      <label for="checkout_telefono">Teléfono/Celular</label>
    </div>
  </div>
      
      <div class="col-12 mt-3">
        <div class="form-check">
          <input class="form-check-input" type="radio" name="tipo-entrega" id="recoger-local" value="recoger" checked>
          <label class="form-check-label" for="recoger-local">
            <i class="fas fa-store me-2"></i>Recoger en el local
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="radio" name="tipo-entrega" id="delivery" value="delivery">
          <label class="form-check-label" for="delivery">
            <i class="fas fa-truck me-2"></i>Enviar a domicilio (Delivery)
          </label>
        </div>
      </div>
    </div>
  </div>
</div>
<!-- Paso 2: Dirección -->
<div class="checkout-step" data-step="2">
  <div class="step-content animated fadeIn">
    <h5 class="step-title"><i class="fas fa-map-marker-alt me-2"></i>Dirección de Entrega</h5>
    
    <div class="row g-3">

    
      <!-- Campo principal de dirección -->
      <div class="col-12">
        <div class="form-floating">
          <textarea class="form-control" placeholder="Dirección exacta" id="direccion-exacta" name="direccion_exacta" required style="height: 120px;"></textarea>          <label for="direccion-exacta">Dirección exacta *</label>
          <small class="text-muted">Ej: Prolongación Av. Principal #123, Casa #45, Urbanización Las Palmas, Maracaibo</small>
        </div>
      </div>
      
      <!-- Campos para coordenadas (opcionales) -->
      <div class="col-md-6">
        <div class="form-floating">
          <input type="text" class="form-control" id="direccion-latitud" placeholder="Latitud">
          <label for="direccion-latitud">Latitud (opcional)</label>
        </div>
      </div>
      <div class="col-md-6">
        <div class="form-floating">
          <input type="text" class="form-control" id="direccion-longitud" placeholder="Longitud">
          <label for="direccion-longitud">Longitud (opcional)</label>
        </div>
      </div>
      
      <!-- Botón de geolocalización -->
      <div class="col-12">
        <button type="button" class="btn btn-outline-primary btn-sm" id="btn-geolocalizacion">
          <i class="fas fa-map-marker-alt me-1"></i> Obtener coordenadas automáticamente
        </button>
        <small class="text-muted ms-2">(Opcional para ubicación más precisa)</small>
      </div>
    </div>
  </div>
</div>
          
         <!-- Paso 3: Método de Pago - Versión ampliada -->
<div class="checkout-step" data-step="3">
  <div class="step-content animated fadeIn">
    <h5 class="step-title"><i class="fas fa-credit-card me-2"></i>Método de pago</h5>
    
    <div class="payment-methods">
      <!-- Efectivo Nacional -->
      <div class="payment-option">
        <input type="radio" name="payment-method" id="pago-efectivo-nacional" value="efectivo_nacional">
        <label for="pago-efectivo-nacional">
          <div class="payment-card">
            <div class="payment-icon">
              <i class="fas fa-money-bill-wave"></i>
            </div>
            <div class="payment-info">
              <h6>Efectivo Nacional</h6>
              <small>Pago en moneda local al recibir</small>
            </div>
          </div>
        </label>
      </div>
      
      <!-- Efectivo Internacional -->
      <div class="payment-option">
        <input type="radio" name="payment-method" id="pago-efectivo-internacional" value="efectivo_internacional">
        <label for="pago-efectivo-internacional">
          <div class="payment-card">
            <div class="payment-icon">
              <i class="fas fa-dollar-sign"></i>
            </div>
            <div class="payment-info">
              <h6>Efectivo Internacional</h6>
              <small>Pago en dólares al recibir</small>
            </div>
          </div>
        </label>
      </div>
      
      <!-- Transferencia Bancaria -->
      <div class="payment-option">
        <input type="radio" name="payment-method" id="pago-transferencia" value="transferencia">
        <label for="pago-transferencia">
          <div class="payment-card">
            <div class="payment-icon">
              <i class="fas fa-university"></i>
            </div>
            <div class="payment-info">
              <h6>Transferencia Bancaria</h6>
              <small>Depósito directo a nuestra cuenta</small>
            </div>
          </div>
        </label>
      </div>
      
      <!-- Pago Móvil -->
      <div class="payment-option">
        <input type="radio" name="payment-method" id="pago-movil" value="pago_movil">
        <label for="pago-movil">
          <div class="payment-card">
            <div class="payment-icon">
              <i class="fas fa-mobile-alt"></i>
            </div>
            <div class="payment-info">
              <h6>Pago Móvil</h6>
              <small>Pago a través de tu banca móvil</small>
            </div>
          </div>
        </label>
      </div>
      
      <!-- Tarjeta de Crédito/Débito -->
      <div class="payment-option">
        <input type="radio" name="payment-method" id="pago-tarjeta" value="tarjeta">
        <label for="pago-tarjeta">
          <div class="payment-card">
            <div class="payment-icon">
              <i class="fas fa-credit-card"></i>
            </div>
            <div class="payment-info">
              <h6>Tarjeta Crédito/Débito</h6>
              <small>Pago seguro con Stripe/PayPal</small>
            </div>
          </div>
        </label>
      </div>
      
      <!-- Zelle -->
      <div class="payment-option">
        <input type="radio" name="payment-method" id="pago-zelle" value="zelle">
        <label for="pago-zelle">
          <div class="payment-card">
            <div class="payment-icon">
              <i class="fas fa-exchange-alt"></i>
            </div>
            <div class="payment-info">
              <h6>Zelle</h6>
              <small>Transferencia desde bancos internacionales</small>
            </div>
          </div>
        </label>
      </div>
    </div>
    
    <!-- Contenedor para detalles adicionales de pago -->
    <div id="payment-details-container" class="mt-3" style="display: none;">
      <div id="transferencia-details" class="payment-details">
        <h6 class="mb-2">Datos para Transferencia Bancaria:</h6>
        <p>Banco: <strong>Tu Banco</strong><br>
        Tipo de Cuenta: <strong>Corriente</strong><br>
        Número: <strong>1234-5678-9012-3456</strong><br>
        Titular: <strong>Tu Empresa S.A.</strong><br>
        RIF: <strong>J-123456789</strong></p>
      </div>
      
    <div id="pago_movil-details" class="payment-details">
        <h6 class="mb-2">Datos para Pago Móvil:</h6>
        <p>Teléfono: <strong>0412-1234567</strong><br>
        Cédula/RIF: <strong>V-12345678</strong><br>
        Banco: <strong>Banco Nacional</strong></p>
      </div>
      
      <div id="zelle-details" class="payment-details">
        <h6 class="mb-2">Datos para Zelle:</h6>
        <p>Email: <strong>pagos@tuempresa.com</strong><br>
        Nombre: <strong>Tu Empresa S.A.</strong></p>
      </div>
    </div>
  </div>
</div>
          
          


      <!-- Paso 4: Confirmación -->
<div class="checkout-step" data-step="4">
  <div class="step-content animated fadeIn">
    <h5 class="step-title"><i class="fas fa-clipboard-check me-2"></i>Resumen del pedido</h5>
    
    <div class="order-summary">
                <div class="summary-header">
                  <div class="delivery-info">
                    <h6><i class="fas fa-truck"></i> Información de entrega</h6>
                    <div id="summary-address"></div>
                  </div>
                  <div class="payment-selected">
                    <h6><i class="fas fa-credit-card"></i> Método de pago</h6>
                    <div id="summary-payment"></div>
                  </div>
                </div>
                
                <div class="summary-items" id="summary-items">
                  <!-- Aquí se inyectarán los productos -->
                </div>
                
                <div class="summary-total">
  <div class="total-row">
    <span>Subtotal:</span>
    <span id="summary-subtotal">$0.00 <small class="text-muted">(Bs 0,00)</small></span>
  </div>
  <div class="total-row">
    <span>Envío:</span>
    <span id="summary-shipping">$0.00 <small class="text-muted">(Bs 0,00)</small></span>
  </div>
  <div class="total-row grand-total">
    <span>Total:</span>
    <span id="summary-total">$0.00 <small class="text-muted">(Bs 0,00)</small></span>
  </div>
  
</div>
              </div>
    
    <!-- Sección de confirmación de pago -->
    <div id="payment-confirmation-section" class="mt-4">
      <h6 class="mb-3"><i class="fas fa-receipt me-2"></i>Confirmación de Pago</h6>
      
      <!-- Campos comunes para todos los métodos -->
      <div class="mb-3">
        <label for="payment-reference" class="form-label">Número de Referencia/Transacción</label>
        <input type="text" class="form-control" id="payment-reference" placeholder="Ingresa el número de referencia">
      </div>
      
      <!-- Campos específicos por método de pago 
      <div id="transferencia-confirm" class="payment-confirm-details" style="display:none;">
        <div class="mb-3">
          <label for="payment-amount" class="form-label">Monto Transferido</label>
          <input type="text" class="form-control" id="payment-amount" placeholder="Ej: 100.00">
        </div>
        <div class="mb-3">
          <label for="payment-date" class="form-label">Fecha de Transferencia</label>
          <input type="date" class="form-control" id="payment-date">
        </div>
      </div>
      
      <div id="movil-confirm" class="payment-confirm-details" style="display:none;">
        <div class="mb-3">
          <label for="movil-phone" class="form-label">Teléfono desde el que realizaste el Pago Móvil</label>
          <input type="tel" class="form-control" id="movil-phone" placeholder="Ej: 04121234567">
        </div>
      </div>
      
      <div id="zelle-confirm" class="payment-confirm-details" style="display:none;">
        <div class="mb-3">
          <label for="zelle-email" class="form-label">Email asociado a tu cuenta Zelle</label>
          <input type="email" class="form-control" id="zelle-email" placeholder="tu@email.com">
        </div>
      </div>
      
      <div id="internacional-confirm" class="payment-confirm-details" style="display:none;">
        <div class="mb-3">
          <label for="exchange-rate" class="form-label">Tasa de cambio utilizada (opcional)</label>
          <input type="text" class="form-control" id="exchange-rate" placeholder="Ej: 4.50">
        </div>
      </div>-->
      
      <!-- Campo para adjuntar comprobante -->
      <div class="mb-3">
        <label for="payment-proof" class="form-label">Comprobante de Pago (Opcional)</label>
        <input type="file" class="form-control" id="payment-proof" accept="image/*,.pdf">
        <small class="text-muted">Puedes subir una imagen o PDF del comprobante (máx. 5MB)</small>
      </div>
      
      <div class="mb-3">
        <label for="payment-notes" class="form-label">Notas adicionales</label>
        <textarea class="form-control" id="payment-notes" name="payment_notes" rows="2" placeholder="Ej: Sin cebolla, entregar después de las 5pm..."></textarea>      </div>
    </div>
    
    <!-- Términos y condiciones -->
    <div class="form-check terms-check">
      <input class="form-check-input" type="checkbox" id="accept-terms" required>
      <label class="form-check-label" for="accept-terms">
        Acepto los <a href="#" class="text-primary">términos y condiciones</a> y políticas de privacidad
      </label>
    </div>
  </div>
</div>
      
      <div class="modal-footer checkout-footer">
        <button type="button" class="btn btn-outline-secondary btn-prev" disabled>
          <i class="fas fa-arrow-left me-2"></i> Anterior
        </button>
        <button type="button" class="btn btn-primary btn-next">
          Siguiente <i class="fas fa-arrow-right ms-2"></i>
        </button>
        <button type="button" class="btn btn-success btn-confirm" style="display:none;">
          <i class="fas fa-check-circle me-2"></i> Confirmar Pedido
        </button>
      </div>
    </div>
  </div>
</div>
</div>