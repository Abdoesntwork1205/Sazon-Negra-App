// Módulo principal que coordina todo
const CartManager = {
    init() {
        // Inicializar módulos
        CartCore.loadCart();
        
        // Cargar tasa de cambio
        CartCore.loadExchangeRate().then(() => {
            if ($('#orderSidebar').hasClass('show')) {
                CartUI.renderSidebar();
            }
        });
        
        // Configurar listeners
        this.setupGlobalListeners();
        CartUI.updateCartCount();
        
        return this;
    },

    setupGlobalListeners() {
        $(document).on('click', '[data-add-to-cart], .btn-add-to-cart, [data-id]', (e) => {
            const $btn = $(e.currentTarget);
            const productId = $btn.data('id') || $btn.data('add-to-cart');
            
            const isAddButton = $btn.is('[data-add-to-cart]') || 
                              $btn.hasClass('btn-add-to-cart') || 
                              $btn.closest('.product-card, .product-card-container').length > 0;
            
            if (productId && isAddButton) {
                if ($btn.hasClass('adding')) return;
                $btn.addClass('adding');
                $btn.html('<i class="fas fa-spinner fa-spin"></i>');
                
                const productData = this.getProductData($btn);
                
                setTimeout(() => {
                    CartCore.addProduct(productData).saveCart();
                    CartUI
                        .updateCartCount()
                        .showSuccessAlert('¡Añadido!', `${productData.nombre} se agregó al carrito`)
                        .openSidebar();
                    
                    $btn.removeClass('adding');
                    $btn.html('<i class="fas fa-plus"></i> Añadir');
                }, 500);
            }
        });
    },

    getProductData($btn) {
        return {
            id: $btn.data('id') || $btn.data('add-to-cart'),
            nombre: $btn.data('name') || $btn.closest('.product-card, .product-card-container').find('.product-title, .product-title-container').text(),
            precio: parseFloat($btn.data('price') || $btn.closest('.product-card, .product-card-container').find('.product-price, .product-price-container').text().replace('$', '')),
            imagen: $btn.data('image') || $btn.closest('.product-card, .product-card-container').find('img').attr('src'),
            descripcion: $btn.data('description') || $btn.closest('.product-card, .product-card-container').find('.product-desc, .product-desc-container').text()
        };
    }
};

// Inicializar cuando el DOM esté listo
$(document).ready(() => CartManager.init());