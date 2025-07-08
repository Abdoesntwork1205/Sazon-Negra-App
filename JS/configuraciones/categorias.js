$(document).ready(function() {
    // Cargar datos iniciales
    loadCategories();

    // Función para mostrar notificaciones con SweetAlert2
    function showAlert(icon, title, text) {
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

    // Manejar envío del formulario de agregar
    $('#addCategoryForm').submit(function(e) {
        e.preventDefault();
        
        const name = $('#categoryName').val();
        const description = $('#categoryDescription').val();
        const active = $('#categoryActive').is(':checked') ? 1 : 0;

        $.ajax({
            url: '../../Database/configuraciones/categorias/agregar.php',
            type: 'POST',
            data: {
                nombre: name,
                descripcion: description,
                activa: active
            },
            success: function(response) {
                if(response.success) {
                    showAlert('success', 'Éxito', 'Categoría agregada correctamente');
                    $('#addCategoryForm')[0].reset();
                    loadCategories();
                } else {
                    showAlert('error', 'Error', response.error || 'Error al agregar la categoría');
                }
            },
            error: function() {
                showAlert('error', 'Error', 'Error en la conexión con el servidor');
            }
        });
    });

    // Botón de refrescar
    $('#refreshBtn').click(function() {
        loadCategories();
        showAlert('info', 'Actualizando', 'Datos actualizados');
    });

    // Función para cargar categorías
    function loadCategories(page = 1) {
        $.ajax({
            url: `../../Database/configuraciones/categorias/get.php?page=${page}`,
            type: 'GET',
            beforeSend: function() {
                $('#categoriesTable tbody').html(`
                    <tr>
                        <td colspan="5" class="text-center py-4">
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
                    $('#categoriesTable tbody').html(`
                        <tr>
                            <td colspan="5" class="text-center py-4 text-danger">
                                ${response.error || 'Error al cargar las categorías'}
                            </td>
                        </tr>
                    `);
                    showAlert('error', 'Error', response.error || 'Error al cargar datos');
                }
            },
            error: function() {
                $('#categoriesTable tbody').html(`
                    <tr>
                        <td colspan="5" class="text-center py-4 text-danger">
                            Error de conexión con el servidor
                        </td>
                    </tr>
                `);
                showAlert('error', 'Error', 'No se pudo conectar al servidor');
            }
        });
    }

    // Renderizar tabla
    function renderTable(data) {
        let html = '';
        
        if(data.length > 0) {
            data.forEach(category => {
                html += `
                    <tr class="table-row-animation">
                        <td><strong>#${category.id}</strong></td>
                        <td>${escapeHtml(category.nombre)}</td>
                        <td>${escapeHtml(category.descripcion)}</td>
                        <td>
                            <span class="badge-status ${category.activa ? 'bg-success' : 'bg-secondary'}">
                                ${category.activa ? 'Activa' : 'Inactiva'}
                            </span>
                        </td>
                        <td class="text-end action-btns">
                            <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${category.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${category.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
        } else {
            html = `
                <tr>
                    <td colspan="5" class="text-center py-4">
                        No se encontraron categorías
                    </td>
                </tr>
            `;
        }
        
        $('#categoriesTable tbody').html(html);
        
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
            loadCategories(page);
        });
    }

    // Cargar modal de edición
    function loadEditModal(id) {
        $.ajax({
            url: `../../Database/configuraciones/categorias/editar.php?id=${id}`,
            type: 'GET',
            beforeSend: function() {
                $('#editCategoryModal .modal-content').html(`
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
                $('#editCategoryModal').modal('show');
            },
            success: function(response) {
                $('#editCategoryModal .modal-content').html(response);
                
                // Manejar envío del formulario de edición
                $('#editCategoryForm').submit(function(e) {
                    e.preventDefault();
                    
                    const formData = $(this).serialize();
                    
                    $.ajax({
                        url: '../../Database/configuraciones/categorias/update.php',
                        type: 'POST',
                        data: formData,
                        success: function(response) {
                            if(response.success) {
                                showAlert('success', 'Éxito', 'Categoría actualizada correctamente');
                                $('#editCategoryModal').modal('hide');
                                loadCategories();
                            } else {
                                showAlert('error', 'Error', response.error || 'Error al actualizar la categoría');
                            }
                        },
                        error: function() {
                            showAlert('error', 'Error', 'Error en la conexión');
                        }
                    });
                });
            },
            error: function() {
                $('#editCategoryModal').modal('hide');
                showAlert('error', 'Error', 'Error al cargar el formulario de edición');
            }
        });
    }

    // Confirmar y eliminar categoría
    function confirmDelete(id) {
        Swal.fire({
            title: '¿Eliminar categoría?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: 'var(--card-bg)',
            color: 'var(--text-dark)'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: '../../Database/configuraciones/categorias/eliminar.php',
                    type: 'POST',
                    data: { id: id },
                    success: function(response) {
                        if(response.success) {
                            showAlert('success', 'Éxito', 'Categoría eliminada correctamente');
                            loadCategories();
                        } else {
                            showAlert('error', 'Error', response.error || 'Error al eliminar la categoría');
                        }
                    },
                    error: function() {
                        showAlert('error', 'Error', 'Error en la conexión');
                    }
                });
            }
        });
    }

    // Función para escapar HTML
    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});