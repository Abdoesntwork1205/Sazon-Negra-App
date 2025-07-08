$(document).ready(function() {
    // Inicializar Select2
    $('.select2').select2({
        placeholder: "Seleccione una categoría",
        allowClear: true
    });

    // Cargar categorías en el select
    loadCategories();
    // Cargar productos
    loadProducts();

    // Configurar formulario de agregar
    $('#addProductForm').submit(function(e) {
        e.preventDefault();
        addProduct();
    });

    // Botón de refrescar
    $('#refreshBtn').click(function() {
        loadProducts();
        showAlert('success', 'Datos actualizados');
    });

    // Función para cargar categorías en el select
    function loadCategories() {
        $.ajax({
            url: '../../Database/configuraciones/productos/obtener_categorias.php',
            type: 'GET',
            success: function(response) {
                if(response.success) {
                    $('#productCategory').empty().append('<option value="">Seleccionar categoría</option>');
                    response.data.forEach(category => {
                        $('#productCategory').append(`<option value="${category.id}">${category.nombre}</option>`);
                    });
                } else {
                    showAlert('error', 'No se pudieron cargar las categorías');
                }
            },
            error: function() {
                showAlert('error', 'Error de conexión al cargar categorías');
            }
        });
    }

    // Función para cargar productos
    function loadProducts(page = 1) {
        $.ajax({
            url: `../../Database/configuraciones/productos/obtener_producto.php?page=${page}`,
            type: 'GET',
            beforeSend: function() {
                $('#productsTable tbody').html(`
                    <tr>
                        <td colspan="8" class="text-center py-4">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Cargando...</span>
                            </div>
                        </td>
                    </tr>
                `);
            },
            success: function(response) {
                if(response.success) {
                    renderTable(response.data);
                    renderPagination(response.pagination);
                } else {
                    $('#productsTable tbody').html(`
                        <tr>
                            <td colspan="8" class="text-center py-4 text-danger">
                                ${response.error || 'Error al cargar los productos'}
                            </td>
                        </tr>
                    `);
                    showAlert('error', response.error || 'Error al cargar productos');
                }
            },
            error: function() {
                $('#productsTable tbody').html(`
                    <tr>
                        <td colspan="8" class="text-center py-4 text-danger">
                            Error de conexión con el servidor
                        </td>
                    </tr>
                `);
                showAlert('error', 'Error de conexión con el servidor');
            }
        });
    }

    // Función para agregar producto
   // Función para agregar producto
            function addProduct() {
                // Validar campos requeridos antes de enviar
                let isValid = true;
                $('#addProductForm [required]').each(function() {
                    if (!$(this).val()) {
                        $(this).addClass('is-invalid');
                        isValid = false;
                    } else {
                        $(this).removeClass('is-invalid');
                    }
                });

                if (!isValid) {
                    showAlert('error', 'Por favor complete todos los campos requeridos');
                    return;
                }

                const formData = new FormData($('#addProductForm')[0]);
                
                // Agregar manualmente los campos de los checkboxes si no están presentes
                if (!$('#productAvailable').is(':checked')) {
                    formData.append('disponible', '0');
                }
                if ($('#productFeatured').is(':checked')) {
                    formData.append('destacado', '1');
                }
                
                // Mostrar carga mientras se procesa
                const submitBtn = $('#addProductForm').find('button[type="submit"]');
                submitBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Procesando...');

                $.ajax({
                    url: '../../Database/configuraciones/productos/agregar_producto.php',
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function(response) {
                        if(response.success) {
                            showAlert('success', 'Producto agregado');
                            $('#addProductForm')[0].reset();
                            $('#productCategory').val(null).trigger('change');
                            loadProducts();
                        } else {
                            showAlert('error', response.error || 'Error al agregar producto');
                        }
                    },
                    error: function(xhr, status, error) {
                        showAlert('error', 'Error de conexión: ' + error);
                    },
                    complete: function() {
                        submitBtn.prop('disabled', false).html('<i class="fas fa-plus"></i> Agregar');
                    }
                });
            }

    // Cargar modal de edición
    function loadEditModal(id) {
        $.ajax({
            url: `../../Database/configuraciones/productos/formulario_edicion.php?id=${id}`,
            type: 'GET',
            beforeSend: function() {
                $('#editProductModal .modal-content').html(`
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">Cargando...</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body text-center py-4">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                    </div>
                `);
                $('#editProductModal').modal('show');
            },
            success: function(response) {
                $('#editProductModal .modal-content').html(response);
                
                // Inicializar Select2 en el modal
                $('.select2-modal').select2({
                    placeholder: "Seleccione una categoría",
                    allowClear: true,
                    dropdownParent: $('#editProductModal')
                });
                
                // Preview de imagen
                $('#editProductImage').change(function() {
                    const file = this.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            $('#imagePreview').attr('src', e.target.result).show();
                        }
                        reader.readAsDataURL(file);
                    }
                });
                
                // Manejar envío del formulario de edición
                $('#editProductForm').submit(function(e) {
                    e.preventDefault();
                    updateProduct(id);
                });
            },
            error: function() {
                $('#editProductModal').modal('hide');
                showAlert('error', 'Error al cargar el formulario de edición');
            }
        });
    }

    // Actualizar producto
    function updateProduct(id) {
        const formData = new FormData($('#editProductForm')[0]);
        formData.append('id', id);

        $.ajax({
            url: '../../Database/configuraciones/productos/actualizar_producto.php',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if(response.success) {
                    showAlert('success', 'Producto actualizado');
                    $('#editProductModal').modal('hide');
                    loadProducts();
                } else {
                    showAlert('error', response.error || 'Error al actualizar producto');
                }
            },
            error: function() {
                showAlert('error', 'Error de conexión');
            }
        });
    }

    // Confirmar y eliminar producto
    function confirmDelete(id) {
        Swal.fire({
            title: '¿Eliminar producto?',
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
                    url: '../../Database/configuraciones/productos/eliminar_producto.php',
                    type: 'POST',
                    data: { id: id },
                    success: function(response) {
                        if(response.success) {
                            showAlert('success', 'Producto eliminado');
                            loadProducts();
                        } else {
                            showAlert('error', response.error || 'Error al eliminar producto');
                        }
                    },
                    error: function() {
                        showAlert('error', 'Error de conexión');
                    }
                });
            }
        });
    }

    // Función para mostrar notificaciones
    function showAlert(icon, title, text = '') {
        Swal.fire({
            icon: icon,
            title: title,
            text: text,
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    }

    // Renderizar tabla de productos
    function renderTable(data) {
        let html = '';
        
        if(data.length > 0) {
            data.forEach(product => {
                html += `
                    <tr>
                        <td><strong>#${product.id}</strong></td>
                        <td>
                            ${product.imagen ? 
                                `<img src="data:image/jpeg;base64,${product.imagen}" class="product-image">` : 
                                '<i class="fas fa-image text-muted"></i>'}
                        </td>
                        <td>${product.titulo}</td>
                        <td>${product.categoria_nombre || 'Sin categoría'}</td>
                        <td>$${parseFloat(product.precio).toFixed(2)}</td>
                        <td>${product.tiempo_preparacion} min</td>
                        <td>
                            <span class="badge ${product.disponible ? 'bg-success' : 'bg-secondary'}">
                                ${product.disponible ? 'Disponible' : 'No disponible'}
                            </span>
                            ${product.destacado ? '<span class="badge bg-warning text-dark ms-1">Destacado</span>' : ''}
                        </td>
                        <td class="text-end action-btns">
                            <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${product.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${product.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
        } else {
            html = `
                <tr>
                    <td colspan="8" class="text-center py-4">
                        No se encontraron productos
                    </td>
                </tr>
            `;
        }
        
        $('#productsTable tbody').html(html);
        
        // Asignar eventos a los botones
        $('.edit-btn').click(function() {
            const id = $(this).data('id');
            loadEditModal(id);
        });
        
        $('.delete-btn').click(function() {
            const id = $(this).data('id');
            confirmDelete(id);
        });
    }

    // Renderizar paginación
    function renderPagination(pagination) {
        let html = '';
        
        if(pagination.total_pages > 1) {
            // Botón anterior
            html += `
                <li class="page-item ${pagination.current_page === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${pagination.current_page - 1}">
                        &laquo;
                    </a>
                </li>
            `;
            
            // Números de página
            for(let i = 1; i <= pagination.total_pages; i++) {
                html += `
                    <li class="page-item ${i === pagination.current_page ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>
                `;
            }
            
            // Botón siguiente
            html += `
                <li class="page-item ${pagination.current_page === pagination.total_pages ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${pagination.current_page + 1}">
                        &raquo;
                    </a>
                </li>
            `;
        }
        
        $('#pagination').html(html);
        
        // Asignar evento a los enlaces de paginación
        $('.page-link').click(function(e) {
            e.preventDefault();
            const page = $(this).data('page');
            loadProducts(page);
        });
    }
});