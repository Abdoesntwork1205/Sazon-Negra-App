<?php
// Incluir el archivo de verificación de sesión
require_once '../../Database/auth/check_session.php';
?>

<!DOCTYPE html>
<html lang="es" data-bs-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>El Sazón de la Negra - Generar Orden</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <!-- Google Fonts (Poppins) -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <!-- Select2 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/select2-bootstrap-5-theme@1.3.0/dist/select2-bootstrap-5-theme.min.css" />
    <!-- CSS Personalizado -->
    <link rel="stylesheet" href="../../CSS/configuraciones/dashboard.css">
    <link rel="stylesheet" href="../../CSS/configuraciones/sidebar.css">
    <link rel="stylesheet" href="../../CSS/configuraciones/crear-orden.css">
    <link rel="stylesheet" href="../../CSS/notificaciones/notificaciones.css">
</head>
<body>
    <!-- Preloader -->

    <!-- Include Sidebar -->
    <?php include '../sidebar/sidebar.php'; ?>

    <!-- Main Content -->
    <div id="content">
        <!-- Top Bar -->
        <nav class="navbar top-bar">
            <div class="container-fluid">
                <button id="sidebarCollapse" class="btn">
                    <i class="fas fa-bars"></i>
                </button>
                <div class="d-flex align-items-center">
                    <!-- Theme Switcher -->
                    <div class="theme-switcher me-3">
                        <input type="checkbox" id="themeToggle" class="d-none">
                        <label for="themeToggle" class="toggle-label">
                            <i class="fas fa-sun"></i>
                            <i class="fas fa-moon"></i>
                            <span class="toggle-ball"></span>
                        </label>
                    </div>
                    
                    <!-- Notifications -->
                    <div class="notifications me-3 dropdown">
                        <button class="btn btn-link dropdown-toggle p-0" type="button" id="notificationsDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                            <div class="notification-icon-wrapper border border-light">
                                <i class="fas fa-bell notification-icon"></i>
                                <span class="badge bg-danger notification-badge" id="notificationCount">0</span>
                            </div>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end notification-dropdown" aria-labelledby="notificationsDropdown" id="notificationsList">
                            <li><h6 class="dropdown-header">Pedidos por confirmar</h6></li>
                            <li><div class="dropdown-item text-center py-3">Cargando notificaciones...</div></li>
                        </ul>
                    </div>
                    
                    <!-- User Dropdown -->
                    <div class="user-dropdown dropdown">
                        
                    </div>
                </div>
            </div>
        </nav>

        <!-- Contenido Principal - Generación de Órdenes -->
        <div class="container-fluid">
            <!-- Breadcrumb -->
            <div class="row mb-4">
                <nav aria-label="breadcrumb"></nav>
            </div>

            <!-- Contenido de la interfaz de generación de órdenes -->
            <div class="row">
                <!-- Sección izquierda - Datos del cliente y productos -->
                <div class="col-lg-8">
                    <!-- Datos del cliente -->
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="mb-0"><i class="fas fa-user me-2"></i>Datos del Cliente</h5>
                        </div>
                        <div class="card-body">
                            <div class="row g-3">
                                <!-- Campo de cédula -->
                                <div class="col-md-6">
                                    <label for="clientId" class="form-label">Cédula/Identificación</label>
                                    <div class="input-group">
                                        <input type="text" class="form-control" id="clientId" 
                                            placeholder="Número de cédula"
                                            required
                                            autocomplete="off">
                                        <button class="btn btn-outline-secondary" type="button" id="searchClientBtn">
                                            <i class="fas fa-search"></i> Buscar
                                        </button>
                                    </div>
                                    <div class="invalid-feedback">
                                        La cédula debe contener solo números (7-10 dígitos).
                                    </div>
                                </div>
                                
                                <!-- Nombre -->
                                <div class="col-md-6">
                                    <label for="clientName" class="form-label">Nombre del Cliente</label>
                                    <input type="text" class="form-control" id="clientName" 
                                        placeholder="Nombre completo"
                                        required 
                                        autocomplete="off">
                                    <div class="invalid-feedback">
                                        Solo se permiten letras y espacios en el nombre.
                                    </div>
                                </div>
                                
                                <!-- Teléfono -->
                                <div class="col-md-6">
                                    <label for="clientPhone" class="form-label">Teléfono</label>
                                    <input type="tel" class="form-control" id="clientPhone" 
                                        placeholder="Número de contacto"
                                        required
                                        autocomplete="off">
                                    <div class="invalid-feedback">
                                        El teléfono debe contener solo números (7-20 dígitos).
                                    </div>
                                </div>
                                
                                <!-- Correo electrónico -->
                                <div class="col-md-6">
                                    <label for="clientEmail" class="form-label">Correo Electrónico</label>
                                    <input type="email" class="form-control" id="clientEmail" 
                                        placeholder="correo@ejemplo.com"
                                        required
                                        autocomplete="off">
                                    <div class="invalid-feedback">
                                        Por favor ingrese un correo electrónico válido.
                                    </div>
                                </div>
                                
                                <!-- Dirección -->
                                <div class="col-md-12">
                                    <label for="clientAddress" class="form-label">Dirección de Entrega</label>
                                    <textarea class="form-control" id="clientAddress" rows="2" 
                                            placeholder="Dirección completa" 
                                            required 
                                            autocomplete="off"></textarea>
                                    <div class="invalid-feedback">
                                        La dirección es requerida.
                                    </div>
                                </div>
                                
                                <!-- Coordenadas -->
                                <div class="col-md-6">
                                    <label for="clientLat" class="form-label">Latitud</label>
                                    <input type="text" class="form-control" id="clientLat" readonly autocomplete="off">
                                </div>
                                <div class="col-md-6">
                                    <label for="clientLng" class="form-label">Longitud</label>
                                    <input type="text" class="form-control" id="clientLng" readonly autocomplete="off">
                                </div>
                                <div class="col-md-12">
                                    <button class="btn btn-sm btn-outline-primary" id="locateClient">
                                        <i class="fas fa-map-marker-alt me-1"></i> Obtener Ubicación
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Selección de productos -->
                    <div class="card mb-4">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0"><i class="fas fa-utensils me-2"></i>Productos del Pedido</h5>
                            <button class="btn btn-sm btn-primary" id="addProductBtn">
                                <i class="fas fa-plus me-1"></i> Agregar
                            </button>
                        </div>
                        <div class="card-body">
                            <!-- Buscador de productos -->
                            <div class="row mb-3">
                                <div class="col-md-12">
                                    <select class="form-select select2-product-search" id="productSearch">
                                        <option></option> <!-- Opción vacía para Select2 -->
                                    </select>
                                </div>
                            </div>

                            <!-- Lista de productos seleccionados -->
                            <div class="table-responsive">
                                <table class="table table-hover" id="selectedProductsTable">
                                    <thead>
                                        <tr>
                                            <th width="5%">#</th>
                                            <th width="40%">Producto</th>
                                            <th width="15%">Precio</th>
                                            <th width="15%">Cantidad</th>
                                            <th width="15%">Subtotal</th>
                                            <th width="10%"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <!-- Los productos se agregarán dinámicamente aquí -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sección derecha - Resumen y opciones -->
                <div class="col-lg-4">
                    <!-- Resumen del pedido -->
                    <div class="card mb-4 sticky-top" style="top: 20px;">
                        <div class="card-header">
                            <h5 class="mb-0"><i class="fas fa-receipt me-2"></i>Resumen del Pedido</h5>
                        </div>
                        <div class="card-body">
                            <!-- Notas del pedido -->
                            <div class="mb-3">
                                <label for="orderNotes" class="form-label">Notas del Pedido</label>
                                <textarea class="form-control" id="orderNotes" rows="2" 
                                          placeholder="Instrucciones especiales..." required></textarea>
                                <div class="invalid-feedback">
                                    Las notas del pedido son requeridas.
                                </div>
                            </div>

                            <!-- Método de entrega -->
                            <div class="mb-3">
                                <label class="form-label">Método de Entrega</label>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="deliveryMethod" id="deliveryYes" value="1" checked>
                                    <label class="form-check-label" for="deliveryYes">Delivery</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="deliveryMethod" id="deliveryNo" value="0">
                                    <label class="form-check-label" for="deliveryNo">Recoger en Local</label>
                                </div>
                                
                                <!-- Campo para ingresar el monto de delivery -->
                                <div class="input-group mt-2" id="deliveryAmountInputGroup">
                                    <span class="input-group-text">$</span>
                                    <input type="number" class="form-control" id="deliveryCostInput" placeholder="Monto de delivery" value="5.00" step="0.01" min="0">
                                </div>
                            </div>

                            <!-- Método de pago -->
                            <div class="mb-3">
                                <label for="paymentMethod" class="form-label">Método de Pago</label>
                                <select class="form-select" id="paymentMethod" name="paymentMethod">
                                    <option value="efectivo">Efectivo Bolivares</option>
                                    <option value="efectivo_internacional">Efectivo Internacional</option>
                                    <option value="transferencia">Transferencia</option>
                                    <option value="tarjeta">Tarjeta</option>
                                    <option value="pago_movil">Pago Móvil</option>
                                    <option value="zelle">Zelle</option>
                                </select>
                            </div>

                            <!-- Campos condicionales para pago -->
                            <div id="internationalPaymentFields" class="mb-3 d-none">
                                <div class="mb-3">
                                    <label class="form-label">Moneda de Pago</label>
                                    <select class="form-select" id="internationalCurrency">
                                        <option value="USD">Dólares (USD)</option>
                                        <option value="EUR">Euros (EUR)</option>
                                        <option value="COP">Pesos Colombianos (COP)</option>
                                    </select>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="internationalPaymentDescription" class="form-label">Descripción del Pago</label>
                                    <textarea class="form-control" id="internationalPaymentDescription" rows="2" 
                                              placeholder="Ej: Recibido 100 Euros. Tasa EUR a USD: 1.08"></textarea>
                                </div>
                            </div>

                            <div id="paymentReferenceField" class="mb-3 d-none">
                                <label for="paymentReference" class="form-label">Referencia de Pago</label>
                                <input type="text" class="form-control" id="paymentReference" placeholder="Número de referencia">
                            </div>

                            <div id="voucherUploadField" class="mb-3 d-none">
                                <label for="voucherUpload" class="form-label">Comprobante</label>
                                <input type="file" class="form-control" id="voucherUpload">
                            </div>

                            <!-- Totales -->
                            <div class="border-top pt-3 mt-3">
                                <div class="d-flex justify-content-between mb-2">
                                    <span>Subtotal:</span>
                                    <span id="subtotalAmount">$0.00</span>
                                </div>
                                <div class="d-flex justify-content-between mb-2">
                                    <span>Costo de Envío:</span>
                                    <span id="deliveryAmount">$5.00</span>
                                </div>
                                <div class="d-flex justify-content-between fw-bold fs-5">
                                    <span>Total:</span>
                                    <span id="totalAmount">$5.00</span>
                                </div>
                                
                                <!-- Monto en Bs (calculado automáticamente) -->
                                <div class="d-flex justify-content-between mt-2">
                                    <span>Total en Bs:</span>
                                    <span id="totalAmountBs">0.00 Bs</span>
                                </div>
                            </div>

                            <!-- Botón de confirmación -->
                            <button class="btn btn-primary w-100 mt-3" id="confirmOrderBtn">
                                <i class="fas fa-check-circle me-2"></i> Confirmar Pedido
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal para confirmar pedido -->
    <div class="modal fade" id="confirmOrderModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">Finalizar Pedido</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3 text-center">
                        <h4>Total a Pagar: <span id="modalFinalTotalAmount" class="fw-bold">$0.00</span></h4>
                        <h5 class="text-muted">Equivalente: <span id="modalFinalTotalAmountBs" class="fw-bold">0.00 Bs</span></h5>
                    </div>
                    <hr>
                    <div class="mb-3">
                        <label class="form-label fw-bold">Seleccione el Estado del Pedido/Pago:</label>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="paymentStatus" id="paymentConfirmed" value="confirmado" checked>
                            <label class="form-check-label text-success" for="paymentConfirmed">
                                <i class="fas fa-check-circle me-1"></i> Confirmado (Pagado)
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="paymentStatus" id="paymentPending" value="por_confirmar">
                            <label class="form-check-label text-warning" for="paymentPending">
                                <i class="fas fa-clock me-1"></i> Por Confirmar (Pendiente)
                            </label>
                        </div>
                    </div>
                </div>
                <div class="modal-footer justify-content-between">
                    <button type="button" class="btn btn-danger" id="anularPedidoModalBtn">
                        <i class="fas fa-times-circle me-1"></i> Anular Pedido
                    </button>
                    <div>
                        <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="finalConfirmOrderBtn">
                            <i class="fas fa-save me-1"></i> Guardar Pedido
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <!-- Bootstrap JS Bundle con Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Select2 JS -->
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
    <!-- Toastr JS -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script>
        // Hacer jsPDF disponible globalmente
        window.jsPDF = window.jspdf.jsPDF;
    </script>
    <!-- Script Personalizado -->
    <script src="../../JS/configuraciones/sidebar.js"></script>
    <script src="../../JS/configuraciones/crear-orden.js"></script>
    <script src="../../JS/configuraciones/generar-factura.js"></script>
    <script src="../../JS/configuraciones/validaciones.js"></script>
    <script src="../../JS/configuraciones/ordenes.js"></script>
    <script src="../../JS/notificaciones/notificaciones.js"></script>
    <script src="../../JS/notificaciones/handlers.js"></script>
    <script src="../../JS/configuraciones/tasa-de-cambio.js"></script>

   
</body>
</html>