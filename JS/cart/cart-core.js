// Módulo principal del carrito (funcionalidad básica)
const CartCore = {
    STORAGE_KEY: 'retroBurgerCart',
    cart: [],
    exchangeRate: 36.50,

    // Métodos básicos del carrito
    loadCart() {
        const cartData = localStorage.getItem(this.STORAGE_KEY);
        this.cart = cartData ? JSON.parse(cartData) : [];
        return this;
    },

    saveCart() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cart));
        return this;
    },

    clearCart() {
        this.cart = [];
        this.saveCart();
        return this;
    },

    addProduct(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                ...product,
                quantity: 1,
                addedAt: new Date().toISOString(),
                bebida: null,
                notas: ''
            });
        }
        
        this.saveCart();
        return this;
    },

    removeProduct(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        return this;
    },

    updateQuantity(productId, newQuantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.saveCart();
        }
        return this;
    },

    getGeneralNotes() {
        const itemWithNotes = this.cart.find(item => item.notas && item.notas.trim() !== '');
        return itemWithNotes ? itemWithNotes.notas : '';
    },

    calculateBsAmount(usdAmount) {
        return (usdAmount * this.exchangeRate).toFixed(2);
    },

    loadExchangeRate() {
        const self = this;
        
        return $.ajax({
            url: '../Database/configuraciones/crear-orden/obtener_tasa.php',
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                if (data && data.success) {
                    self.exchangeRate = data.rate;
                }
            },
            error: function() {
                console.log('Usando tasa por defecto:', self.exchangeRate);
            }
        });
    }
};