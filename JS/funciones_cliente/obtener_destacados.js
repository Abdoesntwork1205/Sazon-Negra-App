document.addEventListener('DOMContentLoaded', function() {
    cargarProductosDestacados();
});

function cargarProductosDestacados() {
    fetch('../Database/menu/obtener_destacados.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                mostrarProductosDestacados(data.data);
            } else {
                console.error('Error:', data.message);
                mostrarErrorProductos();
            }
        })
        .catch(error => {
            console.error('Error al cargar productos:', error);
            mostrarErrorProductos();
        });
}

function mostrarProductosDestacados(productos) {
    const $contenedor = document.querySelector('#productos-destacados .row');
    
    // Verificar si el contenedor existe
    if (!$contenedor) {
        console.error('No se encontró el contenedor de productos destacados');
        return;
    }

    $contenedor.innerHTML = ''; // Limpiar contenedor

    if (productos.length === 0) {
        $contenedor.innerHTML = `
            <div class="col-12 text-center py-4">
                <i class="fas fa-info-circle fa-2x text-info mb-3"></i>
                <p class="text-muted">No hay productos destacados disponibles en este momento.</p>
            </div>
        `;
        return;
    }

    productos.forEach(producto => {
        $contenedor.innerHTML += `
            <div class="product-card-click-event col-md-6 col-lg-4 col-xl-3 mb-4">
                <div class="product-card-modal">
                    <div class="product-card modal-content">
                        <button class="product-card-modal-btn-close">
                            <i class="fas fa-xmark"></i>
                        </button>
                        ${producto.destacado ? '<div class="product-badge">DESTACADO</div>' : ''}
                        ${producto.mas_vendido ? '<div class="product-badge bg-success">MÁS VENDIDO</div>' : ''}
                        <div class="product-img">
                            <img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.src='img/default-food.jpg'">
                        </div>
                        <div class="product-body">
                            <h5 class="product-title">${producto.nombre}</h5>
                            <p class="product-desc">${producto.descripcion}</p>
                            <div class="product-footer">
                                <span class="product-price">$${producto.precio.toFixed(2)}</span>
                                <button class="btn btn-sm btn-primary btn-add-to-cart" 
                                        data-id="${producto.id}"
                                        data-name="${producto.nombre}"
                                        data-price="${producto.precio}"
                                        data-image="${producto.imagen}"
                                        data-description="${producto.descripcion}">
                                    <i class="fas fa-plus"></i> Añadir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>


                    <div class="product-card">
                        ${producto.destacado ? '<div class="product-badge">DESTACADO</div>' : ''}
                        ${producto.mas_vendido ? '<div class="product-badge bg-success">MÁS VENDIDO</div>' : ''}
                        <div class="product-img">
                            <img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.src='img/default-food.jpg'">
                        </div>
                        <div class="product-body">
                            <h5 class="product-title">${producto.nombre}</h5>
                            <p class="product-desc">${producto.descripcion}</p>
                            <div class="product-footer">
                                <span class="product-price">$${producto.precio.toFixed(2)}</span>
                                <button class="btn btn-sm btn-primary btn-add-to-cart" 
                                        data-id="${producto.id}"
                                        data-name="${producto.nombre}"
                                        data-price="${producto.precio}"
                                        data-image="${producto.imagen}"
                                        data-description="${producto.descripcion}">
                                    <i class="fas fa-plus"></i> Añadir
                                </button>
                            </div>
                        </div>
                    </div>
            </div>
        `;
    });

    // Inicializar carrito si está definido
    if (typeof Cart !== 'undefined' && typeof Cart.init === 'function') {
        Cart.init();
    }
}

function mostrarErrorProductos() {
    const contenedor = document.querySelector('#productos-destacados .row');
    contenedor.innerHTML = `
        <div class="col-12 text-center py-4">
            <i class="fas fa-exclamation-triangle fa-2x text-warning mb-3"></i>
            <p class="text-muted">No se pudieron cargar los productos destacados. Por favor intenta nuevamente.</p>
            <button class="btn btn-sm btn-outline-primary" onclick="cargarProductosDestacados()">
                <i class="fas fa-sync-alt"></i> Reintentar
            </button>
        </div>
    `;
}

