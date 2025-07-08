// cart.js - Sistema de Carrito Global con jQuery

const Cart = {
    STORAGE_KEY: 'retroBurgerCart',
    cart: [],
    exchangeRate: 36.50, // Valor por defecto

    
    // Inicializar el carrito
    // Inicialización asíncrona
    // Inicialización
    init: function() {
        this.loadCart();
        this.loadExchangeRate();
        this.updateCartCount();
        this.setupGlobalListeners();
    },

    // Método para limpiar completamente el carrito
    clearCart: function() {
        this.cart = []; // Vacía el array del carrito
        this.saveCart(); // Guarda el carrito vacío en localStorage
        this.updateCartCount(); // Actualiza el contador visual
        this.renderSidebar(); // Actualiza la vista del sidebar
        
        // Opcional: Cierra el sidebar si está abierto
        this.closeSidebar();
        
        console.log('Carrito limpiado exitosamente');
    },
    
    // Cargar carrito desde localStorage
    loadCart() {
        const cartData = localStorage.getItem(this.STORAGE_KEY);
        this.cart = cartData ? JSON.parse(cartData) : [];
        console.log('Carrito cargado:', this.cart);
        
        // Renderizar sidebar si existe
        if ($('#orderSidebar').length) {
            this.renderSidebar();
        }
    },
    
    // Guardar carrito en localStorage
    saveCart() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cart));
        console.log('Carrito guardado:', this.cart);
        this.updateCartCount();
        
        // Renderizar sidebar si existe
        if ($('#orderSidebar').length) {
            this.renderSidebar();
        }
    },


    // Cargar tasa de cambio con jQuery AJAX
    // Método optimizado para obtener la tasa
    loadExchangeRate: function() {
        const self = this;
        
        $.ajax({
            url: '../Database/configuraciones/crear-orden/obtener_tasa.php',
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                if (data.success) {
                    self.exchangeRate = data.rate;
                    console.log('Tasa obtenida:', self.exchangeRate);
                    
                    // Actualizar vista si es necesario
                    if ($('#orderSidebar').hasClass('show')) {
                        self.renderSidebar();
                    }
                } else {
                    console.error('Error en respuesta:', data.error);
                    self.useDefaultRate();
                }
            },
            error: function(xhr, status, error) {
                console.error('Error en la solicitud:', error);
                self.useDefaultRate();
            }
        });
    },

    

    // Función para calcular total en Bs
    calculateBsAmount(usdAmount) {
        return (usdAmount * this.exchangeRate).toFixed(2);
    },
    
    
    
    
    // Añadir producto al carrito (con objeto producto)
    addProduct(product) {
    const existingItem = this.cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        this.cart.push({
            ...product,
            quantity: 1,
            addedAt: new Date().toISOString(),
            bebida: null,  // Mantenemos solo bebida
            notas: ''     // y notas
            // Eliminamos extras: [] y acompanantes: []
        });
    }
    
    this.saveCart();
    this.showSuccessAlert('¡Añadido!', `${product.nombre} se agregó al carrito`);
    
    if ($('#orderSidebar').length) {
        this.openSidebar();
    }
},
    
    // Configurar listeners globales para botones "Añadir al carrito"
    setupGlobalListeners() {
        $(document).on('click', '[data-add-to-cart], .btn-add-to-cart, [data-id]', function() {
            const userData = JSON.parse(sessionStorage.getItem('userData'))
            console.log("Usuario en CartManager:", userData);
            if(
                !userData ||
                (Array.isArray(userData) && userData.length === 0) ||
                (typeof userData === 'object' && Object.keys(userData).length === 0)
            ) {
                window.location.href = '../VIEWS/Auth/login.php';
                return;
            }
        const $btn = $(this);
        const productId = $btn.data('id') || $btn.data('add-to-cart');
        
        // Verificar si es un botón de añadir (puede tener clase o atributo)
        const isAddButton = $btn.is('[data-add-to-cart]') || 
                          $btn.hasClass('btn-add-to-cart') || 
                          $btn.closest('.product-card, .product-card-container').length > 0;
        
        if (productId && isAddButton) {
            // Prevenir doble clic
            if ($btn.hasClass('adding')) return;
            $btn.addClass('adding');
            
            // Animación de feedback
            $btn.html('<i class="fas fa-spinner fa-spin"></i>');
            
            // Obtener los datos del producto desde los atributos data o del HTML
            const productData = {
                id: productId,
                nombre: $btn.data('name') || $btn.closest('.product-card, .product-card-container').find('.product-title, .product-title-container').text(),
                precio: parseFloat($btn.data('price') || $btn.closest('.product-card, .product-card-container').find('.product-price, .product-price-container').text().replace('$', '')),
                imagen: $btn.data('image') || $btn.closest('.product-card, .product-card-container').find('img').attr('src'),
                descripcion: $btn.data('description') || $btn.closest('.product-card, .product-card-container').find('.product-desc, .product-desc-container').text()
            };
            
            // Añadir al carrito
            setTimeout(() => {
                Cart.addProduct(productData);
                $btn.removeClass('adding');
                $btn.html('<i class="fas fa-plus"></i> Añadir');
            }, 500);
        }
    });
    
    },
    
    // Renderizar la sidebar del carrito
    renderSidebar() {
        
        const sidebarBody = $('.order-sidebar-body');

        // Si no tenemos tasa, la cargamos
        

        
        if (this.cart.length === 0) {
            sidebarBody.html(`
                <div class="text-center py-5">
                    <i class="fas fa-shopping-cart fa-3x mb-3" style="color: #6c757d;"></i>
                    <h5>Tu carrito está vacío</h5>
                    <p class="text-muted">Añade productos para comenzar tu pedido</p>
                </div>
            `);
            return;
        }
        
        let html = '';
        let subtotal = 0;
        
        // Renderizar cada producto sin la sección de notas
        this.cart.forEach((item) => {
            subtotal += item.precio * item.quantity;
            
            html += `
                <div class="order-item" data-id="${item.id}">
                    <div class="order-item-main">
                        <img src="${item.imagen || 'https://via.placeholder.com/300x200/ff6b00/ffffff?text=Producto'}" 
                            alt="${item.nombre}" class="order-item-img">
                        <div class="order-item-content">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6>${item.nombre}</h6>
                                    <small class="text-muted">${item.descripcion || ''}</small>
                                </div>
                                <div class="text-end">
                                    <div>$${(item.precio * item.quantity).toFixed(2)}</div>
                                    <button class="btn btn-sm btn-link text-danger p-0 btn-trash" data-id="${item.id}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="order-item-controls mt-2">
                                <button class="btn btn-sm btn-outline-secondary btn-decrease" data-id="${item.id}">-</button>
                                <span class="order-item-qty">${item.quantity}</span>
                                <button class="btn btn-sm btn-outline-secondary btn-increase" data-id="${item.id}">+</button>
                            </div>
                            
                            <!-- Sección de bebidas con tarjetas 
                            <div class="bebidas-card mt-2">
                                <div class="bebidas-header collapsed" data-toggle="bebidas">
                                    <span>Elige tu bebida</span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <div class="bebidas-body">
                                    <div class="bebida-option">
                                        <input type="radio" name="bebida_${item.id}" id="bebida_${item.id}_1" value="Coca-Cola" 
                                            ${item.bebida === 'Coca-Cola' ? 'checked' : ''} data-id="${item.id}">
                                        <label for="bebida_${item.id}_1">Coca-Cola</label>
                                        <span class="bebida-price">+$1.50</span>
                                    </div>
                                    <div class="bebida-option">
                                        <input type="radio" name="bebida_${item.id}" id="bebida_${item.id}_2" value="Sprite" 
                                            ${item.bebida === 'Sprite' ? 'checked' : ''} data-id="${item.id}">
                                        <label for="bebida_${item.id}_2">Sprite</label>
                                        <span class="bebida-price">+$1.50</span>
                                    </div>
                                    <div class="bebida-option">
                                        <input type="radio" name="bebida_${item.id}" id="bebida_${item.id}_3" value="Fanta" 
                                            ${item.bebida === 'Fanta' ? 'checked' : ''} data-id="${item.id}">
                                        <label for="bebida_${item.id}_3">Fanta</label>
                                        <span class="bebida-price">+$1.50</span>
                                    </div>
                                    <div class="bebida-option">
                                        <input type="radio" name="bebida_${item.id}" id="bebida_${item.id}_4" value="Agua" 
                                            ${item.bebida === 'Agua' ? 'checked' : ''} data-id="${item.id}">
                                        <label for="bebida_${item.id}_4">Agua Mineral</label>
                                        <span class="bebida-price">+$1.00</span>
                                    </div>
                                    <div class="bebida-option">
                                        <input type="radio" name="bebida_${item.id}" id="bebida_${item.id}_5" value="Jugo" 
                                            ${item.bebida === 'Jugo' ? 'checked' : ''} data-id="${item.id}">
                                        <label for="bebida_${item.id}_5">Jugo Natural</label>
                                        <span class="bebida-price">+$2.00</span>
                                    </div>
                                </div>
                            </div>-->
                        </div>
                    </div>
                </div>
            `;
        });
        
        // Agregar la sección de notas generales antes de los totales
        html += `
            <div class="notas-card mt-3">
                <div class="notas-header" data-toggle="notas">
                    <span>Notas especiales para tu pedido</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="notas-body">
                    <textarea class="form-control notas-textarea" 
                            placeholder="Ej: Sin cebolla, sin tomate, bien cocida, instrucciones especiales, etc." 
                            rows="3" id="general-notes">${this.getGeneralNotes()}</textarea>
                </div>
            </div>
        `;
        
        // Calcular totales
       const envio = 0; // Inicialmente 0 hasta que seleccionen
        const total = subtotal + envio;

         html += `
            <div class="order-total mt-3">
                <div class="d-flex justify-content-between">
                    <span>Subtotal:</span>
                    <span>
                        $${subtotal.toFixed(2)} 
                        <small class="text-muted">(Bs ${this.calculateBsAmount(subtotal)})</small>
                    </span>
                </div>
                <div class="d-flex justify-content-between">
                    <span>Envío:</span>
                    <span>
                        $${envio.toFixed(2)} 
                        <small class="text-muted">(Bs ${this.calculateBsAmount(envio)})</small>
                    </span>
                </div>
                <div class="d-flex justify-content-between mt-2 fw-bold">
                    <span>Total:</span>
                    <span>
                        $${total.toFixed(2)} 
                        <small class="text-muted">(Bs ${this.calculateBsAmount(total)})</small>
                    </span>
                </div>
                <div class="text-end small text-muted mt-1">
                    Tasa: 1 USD = ${this.exchangeRate.toFixed(2)} Bs
                </div>
            </div>
        `;
        
        sidebarBody.html(html);
        this.setupSidebarEvents();
    },

    // Nuevo método para obtener las notas generales
    getGeneralNotes() {
        // Buscamos si hay algún producto con notas y las usamos como generales
        const itemWithNotes = this.cart.find(item => item.notas && item.notas.trim() !== '');
        return itemWithNotes ? itemWithNotes.notas : '';
    },
    // Configurar eventos de la sidebar
    setupSidebarEvents() {
        const self = this;
        
        // Botón eliminar
        $('.btn-trash').on('click', function() {
            const productId = $(this).data('id');
            self.removeProduct(productId);
        });
        
        // Botón incrementar
        $('.btn-increase').on('click', function() {
            const productId = $(this).data('id');
            const item = self.cart.find(item => item.id === productId);
            if (item) {
                self.updateQuantity(productId, item.quantity + 1);
            }
        });
        
        // Botón decrementar
        $('.btn-decrease').on('click', function() {
            const productId = $(this).data('id');
            const item = self.cart.find(item => item.id === productId);
            if (item && item.quantity > 1) {
                self.updateQuantity(productId, item.quantity - 1);
            }
        });
        
        $('#general-notes').on('change', function() {
            $('#order-notes').val($(this).val()); // Sincroniza con el modal
            Cart.saveCart(); // Opcional: guarda en localStorage si lo necesitas
            });
        
        // Toggle notas
        $('[data-toggle="notas"]').on('click', function() {
            const card = $(this).parent();
            card.toggleClass('expanded');
            $(this).toggleClass('collapsed');
        });

        $('[data-toggle="bebidas"]').on('click', function() {
            const card = $(this).parent();
            card.toggleClass('expanded');
            $(this).toggleClass('collapsed');
        });

        // Selección de bebida con tarjetas
        $('.bebidas-body input[type="radio"]').on('change', function() {
            const productId = $(this).data('id');
            const bebidaValue = $(this).val();
            
            const item = self.cart.find(item => item.id === productId);
            if (item) {
                item.bebida = bebidaValue;
                self.saveCart();
            }
        });
    },


    // Añade este método a tu objeto Cart
    async updateShippingCost(showShipping) {
    const envio = showShipping ? 5.00 : 0;
    const subtotal = this.cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    const total = subtotal + envio;
    
    $('.order-total').html(`
        <div class="d-flex justify-content-between">
            <span>Subtotal:</span>
            <span>
                $${subtotal.toFixed(2)} 
                <small class="text-muted">(Bs ${this.calculateBsAmount(subtotal)})</small>
            </span>
        </div>
        <div class="d-flex justify-content-between">
            <span>Envío:</span>
            <span>
                $${envio.toFixed(2)} 
                <small class="text-muted">(Bs ${this.calculateBsAmount(envio)})</small>
            </span>
        </div>
        <div class="d-flex justify-content-between mt-2 fw-bold">
            <span>Total:</span>
            <span>
                $${total.toFixed(2)} 
                <small class="text-muted">(Bs ${this.calculateBsAmount(total)})</small>
            </span>
        </div>
        <div class="text-end small text-muted mt-1">
            Tasa: 1 USD = ${this.exchangeRate.toFixed(2)} Bs
        </div>
    `);
},
    
    // Eliminar producto del carrito
    removeProduct(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.showSuccessAlert('Eliminado', 'Producto removido del carrito');
    },
    
    // Actualizar cantidad de un producto
    updateQuantity(productId, newQuantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.saveCart();
        }
    },
    
    // Abrir sidebar
    openSidebar() {
        $('#orderSidebar, #sidebarOverlay').addClass('show');
        $('body').addClass('sidebar-open');
    },
    
    // Cerrar sidebar
    closeSidebar() {
        $('#orderSidebar, #sidebarOverlay').removeClass('show');
        $('body').removeClass('sidebar-open');
    },
    
    // Mostrar loader
    showLoader() {
        // Implementar según tu diseño
        $('.preloader').show();
    },
    
    // Ocultar loader
    hideLoader() {
        $('.preloader').hide();
    },
    
    // Mostrar alerta de éxito
   showSuccessAlert(title, text) {

    $('.cart-btn').addClass('pulse');
    setTimeout(() => $('.cart-btn').removeClass('pulse'), 500);
    console.log('Mostrando alerta:', title, text); // Verifica que esto se ejecute
    try {
        Swal.fire({
            icon: 'success',
            title: title,
            text: text,
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 3000
        });
    } catch (e) {
        console.error('Error con SweetAlert:', e);
        alert(title + ': ' + text); // Fallback básico
    }
},
    
    // Mostrar alerta de error
    showErrorAlert(title, text) {
        Swal.fire({
            icon: 'error',
            title: title,
            text: text,
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    },
    
    // Actualizar el contador visual del carrito
    updateCartCount() {
        const count = this.cart.reduce((total, item) => total + item.quantity, 0);
        const $badge = $('.order-badge, .cart-btn .badge');
        
        $badge.text(count).attr('data-count', count);
        
        // Efecto especial cuando hay items
        if (count > 0) {
            $badge.addClass('highlight');
            setTimeout(() => $badge.removeClass('highlight'), 1500);
            
            // También puedes añadir la clase notification
            $badge.addClass('badge-notification');
            setTimeout(() => $badge.removeClass('badge-notification'), 500);
        }
    }
};

// Inicializar el carrito cuando se carga la página
$(document).ready(function() {
    Cart.init();
});