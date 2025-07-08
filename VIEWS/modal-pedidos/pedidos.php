
<div class="modal fade" id="pedidoModal" tabindex="-1" aria-labelledby="pedidoModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
            <div class="modal-header bg-dark text-light">
                <h5 class="modal-title" id="pedidoModalLabel">Tu Pedido Actual</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div id="pedido-vacio" class="text-center py-4">
                    <i class="fas fa-clipboard-list fa-4x mb-3 text-muted"></i>
                    <h5 class="text-muted">No hay productos en tu pedido</h5>
                    <p class="text-muted">Selecciona productos del menú</p>
                </div>
                <div id="pedido-contenido" style="display: none;">
                    <!-- Contenido dinámico se cargará aquí -->
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Seguir Comprando</button>
                <button id="confirmar-pedido-btn" type="button" class="btn btn-primary" disabled>Confirmar Pedido</button>
            </div>
        </div>
    </div>
</div>