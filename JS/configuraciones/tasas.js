$(document).ready(function() {
    // Cargar tasas al iniciar
    loadRates();

    // Configurar evento para el botón de refrescar
    $('#refreshBtn').click(function() {
        loadRates();
    });

    // Configurar evento para guardar nueva tasa
    $('#saveRateBtn').click(function() {
        saveRate();
    });
});

function loadRates() {
    $('#ratesTableBody').html(`
        <tr>
            <td colspan="7" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
            </td>
        </tr>
    `);

    $.ajax({
        url: '../../Database/Configuraciones/tasas/traer_tasa_tabla.php',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                renderRatesTable(response.data);
            } else {
                showToast('Error', response.message, 'danger');
            }
        },
        error: function(xhr, status, error) {
            showToast('Error', 'No se pudieron cargar las tasas', 'danger');
        }
    });
}

function renderRatesTable(rates) {
    let html = '';
    
    if (rates.length === 0) {
        html = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    No se encontraron tasas de cambio registradas
                </td>
            </tr>
        `;
    } else {
        // Filtrar solo tasas USD → VES
        const usdToVesRates = rates.filter(rate => 
            rate.moneda_origen === 'USD' && rate.moneda_destino === 'VES'
        );

        if (usdToVesRates.length === 0) {
            html = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        No hay tasas USD → VES registradas
                    </td>
                </tr>
            `;
        } else {
            usdToVesRates.forEach(rate => {
                const fecha = new Date(rate.fecha_actualizacion);
                const fechaFormateada = fecha.toLocaleString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
                
                // CAMBIO IMPORTANTE: Usar rate.usuario_nombre en lugar de rate.usuario_id
                html += `
                    <tr>
                        <td>${rate.id}</td>
                        <td><span class="currency-badge bg-usd">${rate.moneda_origen}</span></td>
                        <td><span class="currency-badge bg-ves">${rate.moneda_destino}</span></td>
                        <td class="rate-value">${parseFloat(rate.tasa).toFixed(6)}</td>
                        <td>${fechaFormateada}</td>
                        <td>${rate.usuario_nombre || 'Sistema'}</td>
                        <td class="text-end">
                            <div class="btn-group">
                                <button class="btn btn-sm btn-outline-primary edit-rate" data-id="${rate.id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger delete-rate" data-id="${rate.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
        }
    }
    
    $('#ratesTableBody').html(html);
    
    // Configurar eventos para los botones de editar/eliminar
    $('.edit-rate').click(function() {
        const rateId = $(this).data('id');
        editRate(rateId);
    });
    
    $('.delete-rate').click(function() {
        const rateId = $(this).data('id');
        deleteRate(rateId);
    });
}

function saveRate() {
    const tasa = parseFloat($('#rateValue').val());
    
    if (isNaN(tasa) || tasa <= 0) {
        showToast('Error', 'Ingrese una tasa válida', 'danger');
        return;
    }

    const formData = {
        moneda_origen: 'USD',
        moneda_destino: 'VES',
        tasa: tasa
    };

    $.ajax({
        url: '../../Database/configuraciones/tasas/crear_tasa.php',
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(formData),
        success: function(response) {
            if (response.success) {
                showToast('Éxito', 'Tasa creada correctamente', 'success', 'success');
                $('#addRateModal').modal('hide');
                loadRates();
                $('#rateValue').val('');
            } else {
                showToast('Error', response.message, 'danger', 'error');
            }
        },
        error: function(xhr) {
            const errorMsg = xhr.responseJSON?.message || 'Error de conexión';
            showToast('Error', errorMsg, 'danger', 'error');
        }
    });
}

function editRate(rateId) {
    $.ajax({
        url: `../../Database/configuraciones/tasas/tasa_especifica.php?id=${rateId}`,
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                const rate = response.data;
                
                $('#editRateModal .modal-content').html(`
                    <div class="modal-header">
                        <h5 class="modal-title">Editar Tasa USD → VES</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editRateForm">
                            <div class="mb-3">
                                <label class="form-label">Tasa de Cambio (1 USD = ? VES)</label>
                                <div class="input-group">
                                    <span class="input-group-text">1 USD =</span>
                                    <input type="number" class="form-control" id="editRateValue" 
                                        value="${rate.tasa}" step="0.000001" min="0" required>
                                    <span class="input-group-text">VES</span>
                                </div>
                            </div>
                            <input type="hidden" id="editRateId" value="${rate.id}">
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="updateRateBtn">Actualizar Tasa</button>
                    </div>
                `);
                
                $('#editRateModal').modal('show');
                
                $('#updateRateBtn').click(function() {
                    updateRate(rate.id);
                });
            } else {
                showToast('Error', response.message, 'danger', 'error');
            }
        },
        error: function(xhr, status, error) {
            showToast('Error', 'Error al cargar la tasa', 'danger', 'error');
        }
    });
}

function updateRate(rateId) {
    const tasa = parseFloat($('#editRateValue').val());
    
    if (isNaN(tasa) || tasa <= 0) {
        showToast('Error', 'Ingrese una tasa válida', 'danger', 'error');
        return;
    }

    const formData = {
        id: rateId,
        tasa: tasa
    };

    $.ajax({
        url: '../../Database/configuraciones/tasas/actualizar_tasa.php',
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(formData),
        success: function(response) {
            if (response.success) {
                showToast('Éxito', 'Tasa actualizada correctamente', 'success', 'success');
                $('#editRateModal').modal('hide');
                loadRates();
            } else {
                showToast('Error', response.message, 'danger', 'error');
            }
        },
        error: function(xhr, status, error) {
            showToast('Error', 'Error al actualizar la tasa', 'danger', 'error');
        }
    });
}

function deleteRate(rateId) {
    Swal.fire({
        title: '¿Está seguro?',
        text: "Esta acción no se puede deshacer",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `../../Database/configuraciones/tasas/eliminar_tasa.php?id=${rateId}`,
                type: 'POST',
                dataType: 'json',
                success: function(response) {
                    if (response.success) {
                        showToast('Éxito', 'Tasa eliminada correctamente', 'success', 'success');
                        loadRates();
                    } else {
                        showToast('Error', response.message, 'danger', 'error');
                    }
                },
                error: function(xhr, status, error) {
                    showToast('Error', 'Error al eliminar la tasa', 'danger', 'error');
                }
            });
        }
    });
}

function showToast(title, text, type, icon) {
    Swal.fire({
        icon: icon,
        title: title,
        text: text,
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: 'var(--card-bg)',
        color: 'var(--text-dark)',
        customClass: {
            popup: 'shadow-lg'
        }
    });
}