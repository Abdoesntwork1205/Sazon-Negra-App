$(document).ready(function() {
    /**************************************
     * 1. INICIALIZACIÓN Y CONFIGURACIÓN  *
     **************************************/
    
    // Variables globales
    let elementosSeleccionados = [];
    let currentSearchType = 'categorias';
    let select2Instance = null;

    // Inicialización principal
    const init = function() {
        initModalPromociones();
        initEventListeners();
        cargarPromocionesActivas();
        cargarHistorialPromociones();
    };

    // Inicialización de eventos
    const initEventListeners = function() {
        // Botón para abrir modal de nueva promoción
        $('body').on('click', '[data-bs-target="#nuevaPromocionModal"]', function() {
            resetFormularioPromocion();
        });

        // Botón para refrescar promociones activas
        $('#refreshPromocionesBtn').click(cargarPromocionesActivas);

        // Botón para refrescar historial
        $('#refreshHistorialBtn').click(cargarHistorialPromociones);
    };

    // Configura ToastAlert usando SweetAlert2
const ToastAlert = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

  

    /**************************************
     * 2. CONFIGURACIÓN DE MODALES        *
     **************************************/

    // Inicialización del modal de promociones
    const initModalPromociones = function() {
        // Configuración de Flatpickr para fechas
        $('.datetimepicker').flatpickr({
            locale: 'es',
            enableTime: true,
            dateFormat: 'd/m/Y H:i',
            time_24hr: true
        });

        // Inicializar Select2
        initSelect2();
        
        // Evento para cambio de tipo de aplicación
        $('input[name="aplicacionPromocion"]').change(function() {
            currentSearchType = $(this).val();
            resetSelect2();
        });

        // Evento para cambio de tipo de descuento
        $('#promocionTipo').change(actualizarCampoDescuento);
        
        // Evento para guardar promoción
        $('#guardarPromocion').click(guardarPromocion);
        
        // Limpiar modal al cerrar
        $('#nuevaPromocionModal').on('hidden.bs.modal', function() {
            resetFormularioPromocion();
        });
    };

    // Inicializar Select2
    const initSelect2 = function() {
        const placeholder = currentSearchType === 'categorias' 
            ? 'Buscar categorías...' 
            : 'Buscar productos...';
        
        $('#selectorLabel').text(currentSearchType === 'categorias' 
            ? 'Seleccionar categorías:' 
            : 'Seleccionar productos:');

        select2Instance = $('#elementosSearch').select2({
            theme: 'bootstrap-5',
            dropdownParent: $('#nuevaPromocionModal'),
            placeholder: placeholder,
            allowClear: true,
            width: '100%',
            minimumInputLength: 0,
            ajax: {
                url: currentSearchType === 'categorias' 
                    ? '../../Database/configuraciones/promociones/obtener_categorias.php'
                    : '../../Database/configuraciones/promociones/obtener_menu.php',
                dataType: 'json',
                delay: 300,
                data: function(params) {
                    return { search: params.term };
                },
                processResults: function(response) {
                    let data = Array.isArray(response) ? response : (response.data || []);
                    return {
                        results: data.map(item => ({
                            id: item.id,
                            text: currentSearchType === 'categorias' 
                                ? item.nombre 
                                : `${item.titulo || item.nombre} ($${item.precio ? Number(item.precio).toFixed(2) : '0.00'})`
                        }))
                    };
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error('Error en la solicitud AJAX:', textStatus, errorThrown);
                    const $results = $('.select2-results');
                    $results.html('<li class="select2-results__option text-danger">Error al cargar los datos</li>');
                },
                cache: true
            }
        }).on('select2:select', function(e) {
            const data = e.params.data;
            agregarElementoSeleccionado(data.id, data.text, currentSearchType);
            $(this).val(null).trigger('change');
        });
    };

    /**************************************
     * 3. FUNCIONES PARA TABLAS          *
     **************************************/

    // Cargar promociones activas en la tabla
    const cargarPromocionesActivas = function() {
        $.ajax({
            url: '../../Database/configuraciones/promociones/obtener_promociones_activas.php',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    actualizarTablaPromociones('#promocionesTableBody', response.data);
                } else {
                    console.error('Error al cargar promociones:', response.message);
                }
            },
            error: function(xhr, status, error) {
                console.error('Error en la conexión:', error);
            }
        });
    };

    // Cargar historial de promociones
    const cargarHistorialPromociones = function() {
        $.ajax({
            url: '../../Database/configuraciones/promociones/obtener_historial_promociones.php',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    actualizarTablaPromociones('#historialPromocionesTableBody', response.data);
                } else {
                    console.error('Error al cargar historial:', response.message);
                }
            },
            error: function(xhr, status, error) {
                console.error('Error en la conexión:', error);
            }
        });
    };

    // Actualizar tabla de promociones
    const actualizarTablaPromociones = function(selector, data) {
        const tbody = $(selector);
        tbody.empty();

        if (data.length === 0) {
            tbody.append('<tr><td colspan="6" class="text-center text-muted py-3">No hay registros</td></tr>');
            return;
        }

        data.forEach((promocion, index) => {
            tbody.append(`
                <tr>
                    <td>${promocion.nombre}</td>
                    <td><span class="badge ${getBadgeClass(promocion.tipo)}">${formatTipo(promocion.tipo)}</span></td>
                    <td>${formatDescuento(promocion)}</td>
                    <td>${promocion.fecha_inicio} - ${promocion.fecha_fin}</td>
                    <td>${promocion.aplicacion}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="verDetallePromocion(${promocion.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="eliminarPromocion(${promocion.id})">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `);
        });
    };

    // Actualizar tabla de resumen en el modal
    const actualizarTablaResumen = function() {
        const tbody = $('#tablaResumenSeleccion tbody');
        tbody.empty();

        if (elementosSeleccionados.length === 0) {
            tbody.append('<tr><td colspan="4" class="text-center text-muted py-3">No hay elementos seleccionados</td></tr>');
            return;
        }

        elementosSeleccionados.forEach((item, index) => {
            tbody.append(`
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.text}</td>
                    <td><span class="badge ${item.tipo === 'categorias' ? 'bg-info' : 'bg-success'}">
                        ${item.tipo === 'categorias' ? 'Categoría' : 'Producto'}
                    </span></td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-danger" onclick="eliminarElementoSeleccionado(${item.id})">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `);
        });
    };

    /**************************************
     * 4. FUNCIONES DE UTILIDAD          *
     **************************************/

    // Reiniciar Select2
    const resetSelect2 = function() {
        if ($('#elementosSearch').hasClass('select2-hidden-accessible')) {
            $('#elementosSearch').select2('destroy');
        }
        initSelect2();
    };

    // Resetear formulario de promoción
    const resetFormularioPromocion = function() {
    $('#promocionForm')[0].reset();
    elementosSeleccionados = [];
    actualizarTablaResumen();
    resetSelect2();
    // Restablecer el tipo de aplicación a categorías por defecto
    $('input[name="aplicacionPromocion"][value="categorias"]').prop('checked', true);
    currentSearchType = 'categorias';
    $('#selectorLabel').text('Seleccionar categorías:');
};

    // Actualizar campo de descuento según tipo
    const actualizarCampoDescuento = function() {
        const tipo = $('#promocionTipo').val();
        const $container = $('#descuentoContainer');
        const $input = $('#promocionValor');
        
        if (tipo === 'porcentaje' || tipo === 'monto_fijo') {
            $('#valorDescuentoLabel').text(tipo === 'porcentaje' ? 'Porcentaje (%)' : 'Monto fijo ($)');
            $container.removeClass('d-none');
            $input.prop('required', true);
        } else {
            $input.val('');
            $container.addClass('d-none');
            $input.prop('required', false);
        }
    };

    // Agregar elemento seleccionado
    const agregarElementoSeleccionado = function(id, texto, tipo) {
    // Verificar que no se mezclen tipos
    if (elementosSeleccionados.length > 0 && elementosSeleccionados[0].tipo !== tipo) {
        ToastAlert.fire({
            icon: 'error',
            title: 'Error',
            text: 'No puedes mezclar categorías y productos en la misma promoción'
        });
        return;
    }
    
    if (!elementosSeleccionados.some(item => item.id == id)) {
        elementosSeleccionados.push({ id, text: texto, tipo });
        actualizarTablaResumen();
    }
};

    // Eliminar elemento seleccionado
    const eliminarElementoSeleccionado = function(id) {
        elementosSeleccionados = elementosSeleccionados.filter(item => item.id != id);
        actualizarTablaResumen();
    };

    // Formatear tipo de descuento
    const formatTipo = function(tipo) {
        const tipos = {
            'porcentaje': 'Porcentaje',
            'monto_fijo': 'Monto Fijo',
            '2x1': '2x1',
            '3x2': '3x2'
        };
        return tipos[tipo] || tipo;
    };

    // Obtener clase CSS para el badge según tipo
    const getBadgeClass = function(tipo) {
        const clases = {
            'porcentaje': 'bg-success',
            'monto_fijo': 'bg-primary',
            '2x1': 'bg-warning text-dark',
            '3x2': 'bg-warning text-dark'
        };
        return clases[tipo] || 'bg-secondary';
    };

    // Formatear valor de descuento para mostrar
    const formatDescuento = function(promocion) {
        switch(promocion.tipo) {
            case 'porcentaje': return `${promocion.valor_descuento}%`;
            case 'monto_fijo': return `$${promocion.valor_descuento}`;
            case '2x1': return '2x1';
            case '3x2': return '3x2';
            default: return promocion.valor_descuento;
        }
    };

    /**************************************
     * 5. FUNCIONES PRINCIPALES          *
     **************************************/

// Guardar promoción
const guardarPromocion = function() {
      if (elementosSeleccionados.length > 0) {
        const tipoElementos = elementosSeleccionados[0].tipo;
        const tipoAplicacion = currentSearchType === 'categorias' ? 'categorias' : 'productos';
        
        if (tipoElementos !== tipoAplicacion) {
            ToastAlert.fire({
                icon: 'error',
                title: 'Error',
                text: 'Los elementos seleccionados no coinciden con el tipo de aplicación'
            });
            return;
        }
    }
    // Función para formatear fecha de d/m/Y H:i a Y-m-d H:i:s
    const formatDateForBackend = (dateStr) => {
        const [datePart, timePart] = dateStr.split(' ');
        const [day, month, year] = datePart.split('/');
        return `${year}-${month}-${day} ${timePart}:00`;
    };

   const promocionData = {
        nombre: $('#promocionNombre').val(),
        tipo: $('#promocionTipo').val(),
        valor: $('#promocionValor').val() || null,
        fecha_inicio: formatDateForBackend($('#promocionInicio').val()),
        fecha_fin: formatDateForBackend($('#promocionFin').val()),
        elementos: elementosSeleccionados.map(item => ({ id: item.id })),
        aplicacion: currentSearchType === 'categorias' ? 'categorias' : 'productos'
    };

    $.ajax({
        url: '../../Database/configuraciones/promociones/guardar_promociones.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(promocionData),
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                ToastAlert.fire({
                    icon: 'success',
                    title: 'Promoción guardada',
                    text: `ID: ${response.promocion_id}`
                });
                $('#nuevaPromocionModal').modal('hide');
                cargarPromocionesActivas();
            } else {
                ToastAlert.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message
                });
            }
        },
        error: function(xhr) {
            ToastAlert.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error en la conexión: ' + xhr.statusText
            });
        }
    });
};

// Función validarFormulario actualizada
const validarFormulario = function() {
    if (!$('#promocionNombre').val()) {
        ToastAlert.fire({
            icon: 'error',
            title: 'Debe ingresar un nombre para la promoción'
        });
        return false;
    }

    if (!$('#promocionTipo').val()) {
        ToastAlert.fire({
            icon: 'error',
            title: 'Debe seleccionar un tipo de descuento'
        });
        return false;
    }

    const tipo = $('#promocionTipo').val();
    if ((tipo === 'porcentaje' || tipo === 'monto_fijo') && !$('#promocionValor').val()) {
        ToastAlert.fire({
            icon: 'error',
            title: 'Debe ingresar un valor de descuento'
        });
        return false;
    }

    if (!$('#promocionInicio').val() || !$('#promocionFin').val()) {
        ToastAlert.fire({
            icon: 'error',
            title: 'Debe especificar fechas de inicio y fin'
        });
        return false;
    }

    if (elementosSeleccionados.length === 0) {
        ToastAlert.fire({
            icon: 'error',
            title: 'Debe seleccionar al menos un elemento'
        });
        return false;
    }

    return true;
};

/**************************************
 * 6. FUNCIONES GLOBALES             *
 **************************************/

// Hacer funciones disponibles globalmente
window.eliminarElementoSeleccionado = eliminarElementoSeleccionado;
window.verDetallePromocion = function(id) {
    $.ajax({
        url: '../../Database/configuraciones/promociones/obtener_detalle_promocion.php',
        type: 'GET',
        data: { id: id },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                mostrarDetallePromocion(response.data);
            } else {
                ToastAlert.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message || 'No se pudo cargar la promoción'
                });
            }
        },
        error: function() {
            ToastAlert.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error de conexión al cargar detalles'
            });
        }
    });
};

// Mostrar detalles en el modal
const mostrarDetallePromocion = function(promocion) {
    $('#detalleNombre').text(promocion.nombre);
    $('#detalleTipo').html(`<span class="badge ${getBadgeClass(promocion.tipo)}">${formatTipo(promocion.tipo)}</span>`);
    $('#detalleDescuento').text(formatDescuento(promocion));
    $('#detalleFechas').text(`${promocion.fecha_inicio} - ${promocion.fecha_fin}`);
    
    // Determinar estado
    const ahora = new Date();
    const inicio = new Date(promocion.fecha_inicio);
    const fin = new Date(promocion.fecha_fin);
    
    let estado = '';
    if (ahora < inicio) {
        estado = '<span class="badge bg-info">Programada</span>';
    } else if (ahora > fin) {
        estado = '<span class="badge bg-secondary">Finalizada</span>';
    } else {
        estado = '<span class="badge bg-success">Activa</span>';
    }
    $('#detalleEstado').html(estado);
    
    // Mostrar elementos
    const tbody = $('#tablaElementosPromocion tbody');
    tbody.empty();
    
    promocion.elementos.forEach((item, index) => {
        tbody.append(`
            <tr>
                <td>${index + 1}</td>
                <td>${item.nombre}</td>
                <td><span class="badge ${promocion.aplicacion === 'categorias' ? 'bg-info' : 'bg-primary'}">
                    ${promocion.aplicacion === 'categorias' ? 'Categoría' : 'Producto'}
                </span></td>
            </tr>
        `);
    });
    
    $('#detalleCantidad').text(promocion.elementos.length);
    $('#detallePromocionModal').modal('show');
};

window.eliminarPromocion = function(id) {
    Swal.fire({
        title: '¿Eliminar promoción?',
        text: "Esta acción no se puede deshacer",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '../../Database/configuraciones/promociones/eliminar_promocion.php',
                type: 'POST',
                data: { id: id },
                dataType: 'json',
                success: function(response) {
                    if (response.success) {
                        ToastAlert.fire({
                            icon: 'success',
                            title: 'Eliminada!',
                            text: 'La promoción ha sido eliminada.'
                        });
                        cargarPromocionesActivas();
                    } else {
                        ToastAlert.fire({
                            icon: 'error',
                            title: 'Error',
                            text: response.message || 'Error al eliminar'
                        });
                    }
                },
                error: function() {
                    ToastAlert.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Error de conexión'
                    });
                }
            });
        }
    });
};

/**************************************
 * 7. INICIAR APLICACIÓN             *
 **************************************/

init();
});