<!-- Contenido Principal -->
    <div class="container-fluid" id="content-client">
        <!-- Breadcrumb -->
        <div class="row mb-4">
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="#" data-view="inicio"><i class="fas fa-home"></i></a></li>
                    <li class="breadcrumb-item active" aria-current="page">Inicio</li>
                </ol>
            </nav>
        </div>

        <!-- Banner Promocional (Solo en Inicio) -->
        <div class="container my-5">
            <div class="col-12">
                <div class="promo-banner">
                    <div class="promo-content">
                        <h2>¡Disfruta de nuestro menú!</h2>
                        <p>Descubre nuestras deliciosas opciones</p>
                        <button class="btn btn-light promo-btn">Ver Menú Completo</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Productos Destacados -->
        <div class="container my-5" id="productos-destacados">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h4 class="section-title mb-0">Productos Destacados</h4>
                    <a href="#" data-view="menu" class="btn btn-sm btn-outline-primary">Ver Menú Completo</a>
                </div>
                
                <div class="row">
                    <!-- Los productos se cargarán aquí dinámicamente -->
                    <div class="col-12 text-center py-4">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                        <p class="mt-2">Cargando productos destacados...</p>
                    </div>
                </div>
            </div>
        </div>


       <div class="container my-5">
            <h4 class="section-title mb-4">Promociones Especiales</h4>
            <div id="promoCarousel" class="carousel slide" data-bs-ride="carousel">
                <!-- Contenedor de slides -->
                <div class="carousel-inner"></div>
                
                <!-- Controles de navegación -->
                <button class="carousel-control-prev" type="button" data-bs-target="#promoCarousel" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Anterior</span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#promoCarousel" data-bs-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Siguiente</span>
                </button>
                
                <!-- Indicadores -->
                <div class="multi-promo-indicators carousel-indicators"></div>
            </div>
        </div>