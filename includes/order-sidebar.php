<!-- Barra lateral del pedido mejorada -->
<div class="order-sidebar" id="orderSidebar">
    <div class="order-sidebar-header">
        <h5 class="mb-0">Tu Pedido Actual</h5>
        <button type="button" class="btn-close btn-close-white" id="closeSidebar"></button>
    </div>
    <div class="order-sidebar-body">
        <!-- Producto 1 con imagen y opciones -->
        <div class="order-item">
            <div class="order-item-main">
                <img src="https://via.placeholder.com/300x200/ff6b00/ffffff?text=Bacon+Deluxe" 
                     alt="Bacon Deluxe" class="order-item-img">
                <div class="order-item-content">
                    <div class="d-flex justify-content-between">
                        <div>
                            <h6>Bacon Deluxe</h6>
                            <small class="text-muted">Doble carne, bacon, queso cheddar</small>
                        </div>
                        <div class="text-end">
                            <div>$8.99</div>
                            <button class="btn btn-sm btn-link text-danger p-0 btn-trash">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="order-item-controls mt-2">
                        <button class="btn btn-sm btn-outline-secondary">-</button>
                        <span class="order-item-qty">1</span>
                        <button class="btn btn-sm btn-outline-secondary">+</button>
                    </div>
                    
                    <!-- Sección de acompañantes -->
                    <div class="acompanantes-card">
                        <div class="acompanantes-header collapsed" data-toggle="acompanantes">
                            <span>Elige tus acompañantes</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="acompanantes-body">
                            <div class="acompanante-option">
                                <input type="checkbox" id="acomp1-1" checked>
                                <label for="acomp1-1">Papas fritas estándar</label>
                                <span class="acompanante-price">+$0.00</span>
                            </div>
                            <div class="acompanante-option">
                                <input type="checkbox" id="acomp1-2">
                                <label for="acomp1-2">Papas deluxe (con toppings)</label>
                                <span class="acompanante-price">+$1.50</span>
                            </div>
                            <div class="acompanante-option">
                                <input type="checkbox" id="acomp1-3">
                                <label for="acomp1-3">Aros de cebolla</label>
                                <span class="acompanante-price">+$1.80</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Sección de extras -->
                    <div class="extras-card">
                        <div class="extras-header collapsed" data-toggle="extras">
                            <span>Elige tus extras</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="extras-body">
                            <div class="extra-option">
                                <input type="checkbox" id="extra1-1">
                                <label for="extra1-1">Extra queso</label>
                                <span class="extra-price">+$0.75</span>
                            </div>
                            <div class="extra-option">
                                <input type="checkbox" id="extra1-2">
                                <label for="extra1-2">Doble carne</label>
                                <span class="extra-price">+$2.50</span>
                            </div>
                            <div class="extra-option">
                                <input type="checkbox" id="extra1-3">
                                <label for="extra1-3">Bacon extra</label>
                                <span class="extra-price">+$1.25</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Sección de bebidas -->
                    <div class="bebidas-card">
                        <div class="bebidas-header collapsed" data-toggle="bebidas">
                            <span>Elige tu bebida</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="bebidas-body">
                            <div class="bebida-option">
                                <input type="radio" name="bebida1" id="bebida1-1" checked>
                                <label for="bebida1-1">Refresco mediano</label>
                                <span class="bebida-price">+$1.50</span>
                            </div>
                            <div class="bebida-option">
                                <input type="radio" name="bebida1" id="bebida1-2">
                                <label for="bebida1-2">Jugo natural</label>
                                <span class="bebida-price">+$2.00</span>
                            </div>
                            <div class="bebida-option">
                                <input type="radio" name="bebida1" id="bebida1-3">
                                <label for="bebida1-3">Agua mineral</label>
                                <span class="bebida-price">+$1.00</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Campo para notas especiales -->
                    <div class="notas-card mt-2">
                        <div class="notas-header collapsed" data-toggle="notas">
                            <span>Notas especiales</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="notas-body">
                            <textarea class="form-control notas-textarea" 
                                      placeholder="Ej: Sin cebolla, sin tomate, bien cocida, etc." 
                                      rows="2"></textarea>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Producto 2 con imagen y opciones -->
        <div class="order-item">
            <div class="order-item-main">
                <img src="https://via.placeholder.com/300x200/ff6b00/ffffff?text=Clasica" 
                     alt="Clásica Retro" class="order-item-img">
                <div class="order-item-content">
                    <div class="d-flex justify-content-between">
                        <div>
                            <h6>Clásica Retro</h6>
                            <small class="text-muted">Lechuga, tomate, salsa especial</small>
                        </div>
                        <div class="text-end">
                            <div>$6.50</div>
                            <button class="btn btn-sm btn-link text-danger p-0 btn-trash">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="order-item-controls mt-2">
                        <button class="btn btn-sm btn-outline-secondary">-</button>
                        <span class="order-item-qty">1</span>
                        <button class="btn btn-sm btn-outline-secondary">+</button>
                    </div>
                    
                    <!-- Secciones para el segundo producto -->
                    <div class="acompanantes-card">
                        <!-- Contenido similar al primer producto -->
                    </div>
                    
                    <div class="extras-card">
                        <!-- Contenido similar al primer producto -->
                    </div>
                    
                    <div class="bebidas-card">
                        <!-- Contenido similar al primer producto -->
                    </div>
                    
                    <div class="notas-card mt-2">
                        <!-- Contenido similar al primer producto -->
                    </div>
                </div>
            </div>
        </div>
        
        <div class="order-total">
            Subtotal: $15.49<br>
            Acompañantes: $3.30<br>
            Extras: $3.50<br>
            Bebidas: $3.00<br>
            Envío: $2.50<br>
            <strong>Total: $27.79</strong>
        </div>
    </div>
    <div class="order-sidebar-footer">
        <button type="button" class="btn btn-outline-secondary w-100 mb-2" id="continueShopping">
            <i class="fas fa-arrow-left me-2"></i> Seguir Comprando
        </button>
        <button type="button" class="btn btn-primary w-100 btn-checkout">
            <i class="fas fa-credit-card me-2"></i> Pagar Ahora
        </button>
    </div>
</div>

<!-- Overlay para la sidebar -->
<div class="sidebar-overlay" id="sidebarOverlay"></div>