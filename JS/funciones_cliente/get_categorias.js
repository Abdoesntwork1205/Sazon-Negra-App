function initMenuPage() {
    // Variables globales para la página de menú
    const menuState = {
        currentCategory: 'all',
        currentPage: 1,
        productsPerPage: 8
    };
    
    // Cargar categorías y productos
    loadCategories(menuState);
    
    
    // Función para cargar categorías
    function loadCategories(state) {
        $.ajax({
            url: '../Database/categoria/get_categorias.php',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    renderCategories(response.data);
                    loadProducts(state);
                }
            },
            error: function(xhr, status, error) {
                console.error('Error al cargar categorías:', error);
                showError('Error al cargar las categorías');
            }
        });
    }
    
    
    // Función para obtener el ícono según la categoría
    function getCategoryIcon(categoryName) {
        const icons = {
            'hamburguesa': 'fa-hamburger',
            'pizza': 'fa-pizza-slice',
            'hot dog': 'fa-hotdog',
            'postre': 'fa-ice-cream',
            'bebida': 'fa-glass-whiskey',
            'ensalada': 'fa-leaf',
            'desayuno': 'fa-coffee',
            'asado': 'fa-drumstick-bite',
            'marisco': 'fa-fish',
            'vegetariano': 'fa-seedling',
            'sopas': 'fa-utensil-spoon',
            'sandwich': 'fa-bread-slice',
            'tacos': 'fa-pepper-hot',
            'italiana': 'fa-pasta',
            'mexicana': 'fa-pepper-hot',
            'asiática': 'fa-utensils',
            'promociones': 'fa-tags'        // Opción 1 para promociones

        };
        
        categoryName = categoryName.toLowerCase();
        for (const [key, value] of Object.entries(icons)) {
            if (categoryName.includes(key)) {
                return value;
            }
        }
        
        return 'fa-utensils'; // Icono por defecto
    }
    
     function loadProducts(state) {
        // Mostrar spinner por 2 segundos mínimo
        state.loading = true;
        $('#productos-container').html(`
            <div class="col-12 text-center py-5">
                <i class="fas fa-spinner fa-spin fa-3x" style="color: #ff6b6b;"></i>
                <p class="mt-3">Cargando deliciosas opciones...</p>
            </div>
        `);
        
        const params = {
            pagina: state.currentPage,
            porPagina: state.productsPerPage
        };
        
        if (state.currentCategory !== 'all') {
            params.categoria_id = state.currentCategory;
        }
        
        // Guardar el tiempo de inicio
        const startTime = new Date().getTime();
        
        $.ajax({
            url: '../Database/menu/get_productos.php',
            type: 'GET',
            dataType: 'json',
            data: params,
            success: function(response) {
                // Calcular tiempo restante para completar 2 segundos
                const elapsed = new Date().getTime() - startTime;
                const remaining = Math.max(0, 2000 - elapsed);
                
                setTimeout(() => {
                    state.loading = false;
                    if (response.success) {
                        renderProducts(response.data.productos);
                        renderPagination(response.data, state);
                        updateProductCount(response.data);
                    } else {
                        showError(response.message || 'Error al cargar productos');
                    }
                }, remaining);
            },
            error: function(xhr, status, error) {
                state.loading = false;
                console.error('Error al cargar productos:', error);
                showError('Error al cargar los productos');
            }
        });
    }
    
    // Función para renderizar productos
    function renderCategories(categories) {
        // Limpiar contenedores
        $('#categories-container').html('');
        $('#filter-categories-container').html('');
        
        // Agregar opción "Todas"
        $('#categories-container').append(`
            <div class="category-item active" data-category="all">
                <div class="category-icon">
                    <i class="fas fa-utensils"></i>
                </div>
                <span>Todas</span>
            </div>
        `);
        
        $('#filter-categories-container').append(`
            <div class="form-check">
                <input class="form-check-input" type="radio" name="filterCategory" id="filterAll" checked>
                <label class="form-check-label" for="filterAll">
                    <i class="fas fa-utensils mr-2"></i>Todas las categorías
                </label>
            </div>
        `);
        
        // Agregar cada categoría
        categories.forEach(category => {
            $('#categories-container').append(`
                <div class="category-item" data-category="${category.id}">
                    <div class="category-icon">
                        <i class="fas ${getCategoryIcon(category.nombre)}"></i>
                    </div>
                    <span>${category.nombre}</span>
                </div>
            `);
            
            $('#filter-categories-container').append(`
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="filterCategory" id="filterCat${category.id}">
                    <label class="form-check-label" for="filterCat${category.id}">
                        <i class="fas ${getCategoryIcon(category.nombre)} mr-2"></i>${category.nombre}
                    </label>
                </div>
            `);
        });
        
        // Eventos para categorías
        $('.category-item').on('click', function() {
            $('.category-item').removeClass('active');
            $(this).addClass('active');
            menuState.currentCategory = $(this).data('category');
            menuState.currentPage = 1;
            loadProducts(menuState);
        });
        
        $('input[name="filterCategory"]').on('change', function() {
            const categoryId = $(this).attr('id').replace('filterCat', '');
            menuState.currentCategory = categoryId === 'All' ? 'all' : categoryId;
            menuState.currentPage = 1;
            loadProducts(menuState);
            
            // Actualizar categoría activa en el scroller
            $('.category-item').removeClass('active');
            if (menuState.currentCategory === 'all') {
                $('.category-item[data-category="all"]').addClass('active');
            } else {
                $(`.category-item[data-category="${menuState.currentCategory}"]`).addClass('active');
            }
        });
    }
    
   function renderPagination(data, state) {
        const { total, paginas, mostrandoInicio, mostrandoFin } = data;
        $('#pagination-container').html('');
        
        if (paginas <= 1) return;
        
        // Botón Anterior
        $('#pagination-container').append(`
            <li class="page-item ${state.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${state.currentPage - 1}">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `);
        
        // Mostrar páginas cercanas a la actual
        const startPage = Math.max(1, state.currentPage - 2);
        const endPage = Math.min(paginas, state.currentPage + 2);
        
        // Primera página y elipsis si es necesario
        if (startPage > 1) {
            $('#pagination-container').append(`
                <li class="page-item">
                    <a class="page-link" href="#" data-page="1">1</a>
                </li>
                ${startPage > 2 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
            `);
        }
        
        // Páginas intermedias
        for (let i = startPage; i <= endPage; i++) {
            $('#pagination-container').append(`
                <li class="page-item ${i === state.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `);
        }
        
        // Última página y elipsis si es necesario
        if (endPage < paginas) {
            $('#pagination-container').append(`
                ${endPage < paginas - 1 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
                <li class="page-item">
                    <a class="page-link" href="#" data-page="${paginas}">${paginas}</a>
                </li>
            `);
        }
        
        // Botón Siguiente
        $('#pagination-container').append(`
            <li class="page-item ${state.currentPage === paginas ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${state.currentPage + 1}">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `);
        
        // Eventos para paginación
        $('.page-link[data-page]').on('click', function(e) {
            e.preventDefault();
            const page = parseInt($(this).data('page'));
            if (page >= 1 && page <= paginas && !state.loading) {
                state.currentPage = page;
                loadProducts(state);
                $('html, body').animate({ scrollTop: $('#productos-container').offset().top - 20 }, 300);
            }
        });
    }
    
    function updateProductCount(data) {
        const { mostrandoInicio, mostrandoFin, total } = data;
        $('#product-count').html(`
            Mostrando <strong>${mostrandoInicio}-${mostrandoFin}</strong> de 
            <strong>${total}</strong> productos
            ${menuState.currentCategory !== 'all' ? 'en esta categoría' : ''}
        `);
    }
    
    function renderProducts(productos) {
        $('#productos-container').html('');
        
        if (productos.length === 0) {
            $('#productos-container').html(`
                <div class="col-12 text-center py-5">
                    <i class="fas fa-box-open fa-3x mb-3"></i>
                    <h4>No hay productos disponibles</h4>
                </div>
            `);
            return;
        }
        
        productos.forEach(producto => {
            const precioOriginal = producto.en_promocion ? producto.precio_original : producto.precio;
            
            // Generar los badges dinámicamente
            const badgesHTML = producto.badges.map(badge => 
                `<div class="product-badge ${badge.clase}">${badge.texto}</div>`
            ).join('');
            
            $('#productos-container').append(`
                <div class="col-md-6 col-lg-4 col-xl-3 mb-4">
                    <div class="product-card-container">
                        ${badgesHTML}
                        <div class="product-img-container">
                            <img src="${producto.imagen || 'img/default-food.jpg'}" alt="${producto.nombre}">
                        </div>
                        <div class="product-body-container">
                            <h5 class="product-title-container">${producto.nombre}</h5>
                            <p class="product-desc-container">${producto.descripcion || 'Delicioso platillo'}</p>
                            <div class="product-footer-container">
                                <span class="product-price-container">
                                    ${producto.en_promocion ? 
                                        `<del class="text-muted small">$${precioOriginal.toFixed(2)}</del><br>` : ''}
                                    $${producto.precio.toFixed(2)}
                                </span>
                                <button class="btn btn-sm btn-primary btn-add-to-cart" 
                                        data-id="${producto.id}"
                                        data-name="${producto.nombre}"
                                        data-price="${producto.precio}"
                                        data-image="${producto.imagen || 'img/default-food.jpg'}"
                                        data-description="${producto.descripcion || 'Delicioso platillo'}">
                                    <i class="fas fa-plus"></i> Añadir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `);
        });
    }
    // Función para mostrar errores
    function showError(message) {
        $('#productos-container').html(`
            <div class="col-12 text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                <h4>${message}</h4>
                <button class="btn btn-primary mt-3" onclick="loadProducts()">
                    <i class="fas fa-sync-alt"></i> Reintentar
                </button>
            </div>
        `);
    }
    
    // Función para mostrar notificaciones
    function showToast(message, type = 'success') {
        const toast = $(`
            <div class="toast align-items-center text-white bg-${type} border-0 position-fixed bottom-0 end-0 m-3" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `);
        
        $('body').append(toast);
        const toastInstance = new bootstrap.Toast(toast[0]);
        toastInstance.show();
        
        toast.on('hidden.bs.toast', function() {
            toast.remove();
        });
    }
};