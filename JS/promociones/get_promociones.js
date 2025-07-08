$(document).ready(function() {
    
    let promoCarousel = null;
    
    function initCarousel() {
        const carouselElement = $('#promoCarousel');
        
        // Destruir instancia anterior si existe
        if (promoCarousel) {
            const carousel = bootstrap.Carousel.getInstance(carouselElement[0]);
            if (carousel) {
                carousel.dispose();
            }
        }
        
        // Inicializar nuevo carrusel
        promoCarousel = new bootstrap.Carousel(carouselElement[0], {
            interval: 5000,
            wrap: true,
            keyboard: true,
            touch: true
        });
        
       
        
        // Configurar evento para actualizar indicadores
        carouselElement.off('slid.bs.carousel').on('slid.bs.carousel', function(e) {
            updateIndicators(e.to);
        });
    }
    
    function updateIndicators(activeIndex) {
        $('.multi-promo-indicators .indicator').removeClass('active');
        $('.multi-promo-indicators .indicator').eq(activeIndex).addClass('active');
    }
    
    function mostrarPromociones(promociones) {

        const $promoContainer = $('#promoCarousel .carousel-inner');
        $promoContainer.empty();

        
        
        if (promociones.length === 0) {
            $promoContainer.append(`
                <div class="carousel-item active">
                    <div class="row justify-content-center">
                        <div class="col-12 text-center py-5">
                            <i class="fas fa-tag fa-3x text-muted mb-3"></i>
                            <h5 class="text-muted">No hay promociones activas en este momento</h5>
                        </div>
                    </div>
                </div>
            `);
            $('.multi-promo-indicators').empty();
            initCarousel();
            return;
        }
        
        // Primero recolectamos TODOS los productos a mostrar
        let todosProductos = [];
        
        promociones.forEach(promocion => {
            if (promocion.tipo_promocion === 'categoria' && promocion.productos && promocion.productos.length > 0) {
                // Para promociones de categoría, añadimos todos sus productos
                promocion.productos.forEach(producto => {
                    todosProductos.push({
                        tipo: 'categoria',
                        producto: producto,
                        promocion: promocion
                    });
                });
            } else if (promocion.tipo_promocion === 'producto') {
                // Para promociones de producto directo
                todosProductos.push({
                    tipo: 'producto',
                    promocion: promocion
                });
            }
        });
        
        
        // Si no hay productos, mostrar mensaje
        if (todosProductos.length === 0) {
            $promoContainer.append(`
                <div class="carousel-item active">
                    <div class="row justify-content-center">
                        <div class="col-12 text-center py-5">
                            <i class="fas fa-tag fa-3x text-muted mb-3"></i>
                            <h5 class="text-muted">No hay productos en promoción actualmente</h5>
                        </div>
                    </div>
                </div>
            `);
            $('.multi-promo-indicators').empty();
            initCarousel();
            return;
        }
        
        // Ahora agrupamos en grupos de 4
        const grupos = [];
        for (let i = 0; i < todosProductos.length; i += 4) {
            grupos.push(todosProductos.slice(i, i + 4));
        }
        
        
        // Crear slides para cada grupo
        grupos.forEach((grupo, index) => {
            const $slide = $(`
                <div class="carousel-item ${index === 0 ? 'active' : ''}">
                    <div class="row"></div>
                </div>
            `);
            
            const $row = $slide.find('.row');
            
            // Añadir cada producto al slide
            grupo.forEach(item => {
                if (item.tipo === 'categoria') {
                    const producto = item.producto;
                    const promocion = item.promocion;
                    const precioOriginal = parseFloat(producto.precio);
                    const descuento = parseFloat(promocion.valor_descuento);
                    const precioDescuento = precioOriginal * (1 - descuento/100);
                    
                    $row.append(crearCardPromocion(
                        producto.titulo,
                        `Descuento en ${promocion.nombre_categoria}`,
                        precioOriginal,
                        precioDescuento,
                        descuento,
                        promocion.fecha_fin,
                        producto.id,
                        producto.imagen
                    ));
                } else if (item.tipo === 'producto') {
                    const promocion = item.promocion;
                    const precioOriginal = parseFloat(promocion.precio_producto);
                    const descuento = parseFloat(promocion.valor_descuento);
                    const precioDescuento = precioOriginal * (1 - descuento/100);
                    
                    $row.append(crearCardPromocion(
                        promocion.nombre_producto,
                        promocion.descripcion || 'Oferta especial',
                        precioOriginal,
                        precioDescuento,
                        descuento,
                        promocion.fecha_fin,
                        promocion.menu_id,
                        promocion.imagen_producto
                    ));
                }
            });
            
            $promoContainer.append($slide);
        });
        
        // Actualizar indicadores
        actualizarIndicadores(grupos.length);
        
        // Reiniciar el carrusel
        initCarousel();
        
        // Verificar controles del carrusel
        setTimeout(() => {
            console.log('Verificando controles del carrusel...');
            const carousel = bootstrap.Carousel.getInstance($('#promoCarousel')[0]);
            if (carousel) {
        
                
                // Verificar funcionalidad de controles
                $('[data-bs-slide="prev"]').on('click', () => console.log('Click en anterior'));
                $('[data-bs-slide="next"]').on('click', () => console.log('Click en siguiente'));
                $('.multi-promo-indicators .indicator').on('click', function() {
                });
            }
        }, 500);
    }
    
    function crearCardPromocion(titulo, descripcion, precioOriginal, precioDescuento, descuento, fechaFin, productoId, imagen) {
        const fechaFinFormateada = new Date(fechaFin).toLocaleDateString('es-ES', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
        
        let badgeClass = 'bg-warning';
        if (descuento >= 30) badgeClass = 'bg-danger';
        else if (descuento >= 50) badgeClass = 'bg-primary';
        
        let imagenSrc = 'https://via.placeholder.com/300x200/ff6b00/ffffff?text=' + encodeURIComponent(titulo);
        if (imagen) {
            imagenSrc = imagen;
        }
        
        return `
        <div class="col-md-6 col-lg-4 col-xl-3 mb-4">
            <div class="product-card promo-card h-100">
                <div class="product-badge ${badgeClass}">-${descuento}%</div>
                <div class="product-img">
                    <img src="${imagenSrc}" alt="${titulo}" class="img-fluid">
                </div>
                <div class="product-body">
                    <h5 class="product-title">${titulo}</h5>
                    <p class="product-desc">${descripcion}</p>
                    <div class="promo-validity mb-2">
                        <small class="text-muted">Válido hasta: ${fechaFinFormateada}</small>
                    </div>
                    <div class="product-footer">
                        <span class="product-price">
                            <del>$${precioOriginal.toFixed(2)}</del> 
                            $${precioDescuento.toFixed(2)}
                        </span>
                        <button class="btn btn-sm btn-primary btn-add-to-cart" 
                                 data-id="${productoId}"
                                data-name="${titulo}"
                                data-price="${precioDescuento.toFixed(2)}"
                                data-image="${imagenSrc}"
                                data-description="${descripcion}">
                                <i class="fas fa-plus"></i> Añadir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    }
    
    function actualizarIndicadores(numSlides) {
        const $indicators = $('.multi-promo-indicators');
        $indicators.empty();
        
        for (let i = 0; i < numSlides; i++) {
            $indicators.append(`
                <button type="button" data-bs-target="#promoCarousel" 
                        data-bs-slide-to="${i}" 
                        class="indicator ${i === 0 ? 'active' : ''}"></button>
            `);
        }
        
    }
    
    function cargarPromocionesActivas() {
        const $promoContainer = $('#promoCarousel .carousel-inner');
        $promoContainer.html(`
            <div class="carousel-item active">
                <div class="row justify-content-center">
                    <div class="col-12 text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                        <p class="mt-2">Cargando promociones...</p>
                    </div>
                </div>
            </div>
        `);
        
        $.ajax({
            url: '../Database/promociones/get_promociones.php',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    mostrarPromociones(response.promociones);
                } else {
                    mostrarPromociones([]);
                }
            },
            error: function(xhr, status, error) {
                mostrarPromociones([]);
            }
        });
    }
    
    // Inicializar al cargar la página
    if ($('body[data-view="inicio"]').length) {
        cargarPromocionesActivas();
    }
    
    // Manejar evento de cambio de vista
    document.addEventListener('spa-view-changed', function(e) {
        if (e.detail.view === 'inicio') {
            setTimeout(cargarPromocionesActivas, 100);
        }
    });
    
    // Manejar clic en botón "Añadir"
    $(document).on('click', '.product-card .btn-primary', function() {
        const productId = $(this).data('id');
        // Aquí puedes implementar la lógica para añadir al carrito
    });


    // Agrega esto al final de tu archivo JavaScript, dentro del $(document).ready()

    // Manejar clic en el botón del banner promocional
    $(document).on('click', '.promo-btn', function(e) {
        e.preventDefault();
        
        // Disparar el mismo evento que usan los enlaces del navbar
        const viewChangedEvent = new CustomEvent('spa-view-changed', {
            detail: { view: 'menu' }
        });
        document.dispatchEvent(viewChangedEvent);
        
        // Actualizar la URL usando history.pushState
        history.pushState({ view: 'menu' }, '', '?view=menu');
        
        // Forzar la carga de la vista (similar a lo que hace loadView)
        $('body').attr('data-view', 'menu');
        loadView('menu');
        
        // Desplazarse al inicio de la página
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });




    
});