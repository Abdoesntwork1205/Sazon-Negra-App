import CartCore from './cart-core.js';
import CartStorage from './cart-storage.js';
import CartUI from './cart-ui.js';
import CartSidebar from './cart-sidebar.js';

const Cart = {
    // Inicializar el carrito
    init() {
        this.cart = CartStorage.load() || [];
        CartUI.setupGlobalListeners(this);
        this.updateCartCount();
        
        if ($('#orderSidebar').length) {
            CartSidebar.render(this.cart, this);
        }
        
        console.log('Carrito inicializado', this.cart);
    },
    
    // Métodos públicos
    addProduct(product) {
        CartCore.addProduct.call(this, product);
        CartStorage.save(this.cart);
        CartUI.showAddToCartAnimation($('[data-add-to-cart="'+product.id+'"]'));
        this.showSuccessAlert('¡Añadido!', `${product.nombre} se agregó al carrito`);
        this.updateCartCount();
        
        if ($('#orderSidebar').length) {
            CartSidebar.render(this.cart, this);
            CartSidebar.open();
        }
    },
    
    removeProduct(productId) {
        CartCore.removeProduct.call(this, productId);
        CartStorage.save(this.cart);
        this.showSuccessAlert('Eliminado', 'Producto removido del carrito');
        this.updateCartCount();
        
        if ($('#orderSidebar').length) {
            CartSidebar.render(this.cart, this);
        }
    },
    
    updateQuantity(productId, newQuantity) {
        CartCore.updateQuantity.call(this, productId, newQuantity);
        CartStorage.save(this.cart);
        this.updateCartCount();
    },
    
    updateCartCount() {
        const count = CartCore.getTotalItems.call(this);
        CartUI.updateCartCount(count);
    },
    
    openSidebar() {
        CartSidebar.open();
    },
    
    closeSidebar() {
        CartSidebar.close();
    },
    
    showSuccessAlert(title, text) {
        CartUI.showSuccessAlert(title, text);
    },
    
    showErrorAlert(title, text) {
        CartUI.showErrorAlert(title, text);
    },
    
    // Métodos de ayuda
    getTotalItems() {
        return CartCore.getTotalItems.call(this);
    },
    
    getSubtotal() {
        return CartCore.getSubtotal.call(this);
    },
    
    clearCart() {
        this.cart = [];
        CartStorage.clear();
        this.updateCartCount();
        if ($('#orderSidebar').length) {
            CartSidebar.render(this.cart, this);
        }
    },
    
    // Para checkout
    getCartForCheckout() {
        return {
            items: [...this.cart],
            subtotal: this.getSubtotal(),
            total: this.getSubtotal(), // Puede añadirse envío después
            notes: $('#general-notes').val() || ''
        };
    }
};

// Inicialización automática cuando el DOM está listo
$(document).ready(() => {
    if (typeof Cart !== 'undefined') {
        Cart.init();
    }
});

export default Cart;