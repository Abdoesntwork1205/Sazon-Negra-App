<div class="container-fluid">
    <!-- Breadcrumb -->
    <div class="row mb-4">
        <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="#" data-view="inicio"><i class="fas fa-home"></i></a></li>
                <li class="breadcrumb-item active" aria-current="page">Historial de Pedidos</li>
            </ol>
        </nav>
    </div>

    <!-- Contenido principal del historial -->
    <div class="historial-container">
        <div class="historial-header">
            <h2 class="historial-title">Tus Pedidos Anteriores</h2>
            <div class="historial-filter">
                <select id="filterEstado" class="form-select form-select-sm" style="width: 150px;">
                    <option value="all" selected>Todos los estados</option>
                    <option value="confirmado">Confirmados</option>
                    <option value="por_confirmar">Por confirmar</option>
                    <option value="cancelado">Cancelados</option>
                </select>
                <select id="filterOrden" class="form-select form-select-sm" style="width: 150px;">
                    <option value="recientes" selected>Más recientes</option>
                    <option value="antiguos">Más antiguos</option>
                </select>
            </div>
        </div>

        <div class="table-responsive">
            <table class="historial-table">
                <thead>
                    <tr>
                        <th>Pedido #</th>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th>Método de pago</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="historial-body">
                    <!-- Los pedidos se cargarán aquí dinámicamente -->
                    <tr>
                        <td colspan="6" class="text-center">
                            <div class="spinner-border text-primary my-4" role="status">
                                <span class="visually-hidden">Cargando...</span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Mensaje cuando no hay pedidos -->
        <div id="no-pedidos" class="text-center py-4" style="display: none;">
            <i class="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">No tienes pedidos registrados</h5>
            <p>Realiza tu primer pedido y aparecerá aquí.</p>
            <button class="btn btn-primary" data-view="menu">Ver menú</button>
        </div>
    </div>
</div>


<!-- Modal para detalles de pedido -->
    <div class="modal fade" id="detallesPedidoModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-light">
                    <h5 class="modal-title">Detalles del Pedido</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="text-center py-4">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                        <p class="mt-2">Cargando detalles del pedido...</p>
                    </div>
                </div>
                <div class="modal-footer bg-light">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="fas fa-times me-1"></i> Cerrar
                    </button>
                    <!--<button type="button" class="btn btn-primary btn-repetir-pedido">
                        <i class="fas fa-redo me-1"></i> Repetir Pedido
                    </button>-->
                </div>
            </div>
        </div>
    </div>

    <!-- Modal para mostrar voucher -->
    <div class="modal fade" id="voucherModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-light">
                    <h5 class="modal-title">Comprobante de Pago</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center">
                    <!-- Contenido dinámico se cargará aquí -->
                </div>
                <div class="modal-footer bg-light">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="fas fa-times me-1"></i> Cerrar
                    </button>
                    <button type="button" class="btn btn-primary" id="descargarVoucher">
                        <i class="fas fa-download me-1"></i> Descargar
                    </button>
                </div>
            </div>
        </div>
    </div>
