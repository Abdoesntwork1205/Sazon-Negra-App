<div class="container-fluid">
    <div class="row mb-4">
        <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="#" data-view="inicio"><i class="fas fa-home"></i></a></li>
                <li class="breadcrumb-item active" aria-current="page">Menú</li>
            </ol>
        </nav>
    </div>

    <!-- Categorías -->
    <div class="row mb-4">
        <div class="col-12">
            <h4 class="section-title mb-3">Categorías</h4>
            <div class="categories-scroller" id="categories-container">
                <!-- Las categorías se cargarán aquí dinámicamente -->
            </div>
        </div>
    </div>

    <!-- Contenedor principal de filtros y productos -->
    <div class="row">
        <!-- Columna de Filtros (izquierda) -->
        <div class="col-lg-3 col-md-4">
            <!-- Card de Filtros (Desplegable) -->
            <div class="filter-card card mb-3">
                <div class="card-header d-flex justify-content-between align-items-center" data-toggle="collapse" href="#filterCollapse">
                    <h5 class="mb-0">
                        <i class="fas fa-filter mr-2"></i>Filtrar
                    </h5>
                    <i class="fas fa-chevron-down toggle-icon"></i>
                </div>
                <div id="filterCollapse" class="collapse show">
                    <div class="card-body">
                        <h6 class="font-weight-bold mb-3">Categorías</h6>
                        <div class="filter-categories" id="filter-categories-container">
                            <!-- Los filtros de categoría se cargarán aquí dinámicamente -->
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="filterCategory" id="filterAll" checked>
                                <label class="form-check-label" for="filterAll">
                                    <i class="fas fa-utensils mr-2"></i>Todas las categorías
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Card de Ordenar (Desplegable) -->
            <div class="sort-card card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center" data-toggle="collapse" href="#sortCollapse">
                    <h5 class="mb-0">
                        <i class="fas fa-sort mr-2"></i>Ordenar
                    </h5>
                    <i class="fas fa-chevron-down toggle-icon"></i>
                </div>
                <div id="sortCollapse" class="collapse show">
                    <div class="card-body">
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="sortOption" id="sortRelevant" checked>
                            <label class="form-check-label" for="sortRelevant">
                                Más relevantes
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="sortOption" id="sortPriceHigh">
                            <label class="form-check-label" for="sortPriceHigh">
                                Precio: Mayor a menor
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="sortOption" id="sortPriceLow">
                            <label class="form-check-label" for="sortPriceLow">
                                Precio: Menor a mayor
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Columna de Productos (derecha) -->
        <div class="col-lg-9 col-md-8">
            <div class="row" id="productos-container">

            
                <!-- Aquí se cargarán dinámicamente las cards de productos -->
                <!-- Ejemplo de card de producto -->
                <div class="col-md-6 col-lg-4 col-xl-3 mb-4">
                    <div class="product-card-container">
                        <div class="product-badge">TOP</div>
                        <div class="product-img-container">
                            <img src="imagen.jpg" alt="Producto">
                        </div>
                        <div class="product-body-container">
                            <h5 class="product-title-container">Nombre Producto</h5>
                            <p class="product-desc-container">Descripción</p>
                            <div class="product-footer-container">
                                <span class="product-price-container">$10.99</span>
                                <button class="btn btn-sm btn-primary">Añadir</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Más cards de producto -->
                <div class="col-md-6 col-lg-4 col-xl-3 mb-4">
                    <div class="product-card-container">
                        <div class="product-badge">TOP</div>
                        <div class="product-img-container">
                            <img src="imagen.jpg" alt="Producto">
                        </div>
                        <div class="product-body-container">
                            <h5 class="product-title-container">Nombre Producto</h5>
                            <p class="product-desc-container">Descripción</p>
                            <div class="product-footer-container">
                                <span class="product-price-container">$10.99</span>
                                <button class="btn btn-sm btn-primary">Añadir</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Puedes agregar más productos aquí -->

                <!-- Más cards de producto -->
                <div class="col-md-6 col-lg-4 col-xl-3 mb-4">
                    <div class="product-card-container">
                        <div class="product-badge">TOP</div>
                        <div class="product-img-container">
                            <img src="imagen.jpg" alt="Producto">
                        </div>
                        <div class="product-body-container">
                            <h5 class="product-title-container">Nombre Producto</h5>
                            <p class="product-desc-container">Descripción</p>
                            <div class="product-footer-container">
                                <span class="product-price-container">$10.99</span>
                                <button class="btn btn-sm btn-primary">Añadir</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-6 col-lg-4 col-xl-3 mb-4">
                    <div class="product-card-container">
                        <div class="product-badge">TOP</div>
                        <div class="product-img-container">
                            <img src="imagen.jpg" alt="Producto">
                        </div>
                        <div class="product-body-container">
                            <h5 class="product-title-container">Nombre Producto</h5>
                            <p class="product-desc-container">Descripción</p>
                            <div class="product-footer-container">
                                <span class="product-price-container">$10.99</span>
                                <button class="btn btn-sm btn-primary">Añadir</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-6 col-lg-4 col-xl-3 mb-4">
                    <div class="product-card-container">
                        <div class="product-badge">TOP</div>
                        <div class="product-img-container">
                            <img src="imagen.jpg" alt="Producto">
                        </div>
                        <div class="product-body-container">
                            <h5 class="product-title-container">Nombre Producto</h5>
                            <p class="product-desc-container">Descripción</p>
                            <div class="product-footer-container">
                                <span class="product-price-container">$10.99</span>
                                <button class="btn btn-sm btn-primary">Añadir</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Dentro de tu columna de productos (después del div con id="productos-container") -->
            <div class="row mt-4">
                <div class="col-12 d-flex flex-column align-items-center">
                    <nav aria-label="Page navigation" class="w-100">
                        <ul class="pagination justify-content-center mb-2 w-100" id="pagination-container">
                            <!-- La paginación se cargará aquí dinámicamente -->
                        </ul>
                    </nav>
                    <div class="text-muted" id="product-count">
                        <!-- El conteo de productos se actualizará aquí -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>