$(document).ready(function() {
    // =============================================
    // CONFIGURACIÓN INICIAL
    // =============================================
    
    // Variables globales
    const config = {
        currentUserType: 'clientes',
        currentPage: 1,
        perPage: 10
    };

    // Inicialización
    init();

    // =============================================
    // FUNCIONES DE INICIALIZACIÓN
    // =============================================

    function init() {
        loadUsers();
        initDropdowns();
        setupEventListeners();
    }

    function setupEventListeners() {
        // Cambio entre clientes y personal
        $('#btnClientes').click(switchToClients);
        $('#btnPersonal').click(switchToStaff);
        
        // Búsqueda y filtros
        $('#searchInput').on('input', function() {
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
        loadUsers(1); // Siempre volver a la página 1 al buscar
    }, 300);
});
        $('#statusFilter').change(function() {
    // Reiniciar a la primera página cuando cambia el filtro
    loadUsers(1);
});
        
        // Acciones principales

        $('#addUserBtn').click(showAddUserModal);
        
        // Paginación
        $(document).on('click', '.page-link', handlePaginationClick);
    }

    // =============================================
    // MANEJADORES DE EVENTOS
    // =============================================

    function switchToClients() {
        config.currentUserType = 'clientes';
        updateActiveButton('btnClientes', 'btnPersonal');
        loadUsers();
    }

    function switchToStaff() {
        config.currentUserType = 'personal';
        updateActiveButton('btnPersonal', 'btnClientes');
        loadUsers();
    }

    function handlePaginationClick(e) {
        e.preventDefault();
        const page = $(this).data('page');
        loadUsers(page);
    }

    // =============================================
    // FUNCIONES PRINCIPALES
    // =============================================

function initDropdowns() {
    // Eliminar manejadores de eventos anteriores
    $(document)
        .off('click', '.dropdown-toggle:not(#notificationsDropdown)')
        .on('click', '.dropdown-toggle:not(#notificationsDropdown)', handleDropdownToggle)
        .on('click', handleDocumentClick);
}

function handleDropdownToggle(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Excluir específicamente el dropdown de notificaciones
    if ($(this).is('#notificationsDropdown')) {
        return;
    }
    
    const $toggle = $(this);
    const $menu = $toggle.next('.dropdown-menu');
    const isShown = $menu.hasClass('show');
    
    // Cerrar otros dropdowns excepto notificaciones
    $('.dropdown-menu').not('#notificationsList').removeClass('show');
    
    if (!isShown) {
        positionDropdown($toggle, $menu);
    }
}

function handleDocumentClick(e) {
    // Excluir clicks en el dropdown de notificaciones
    if ($(e.target).closest('#notificationsDropdown').length || 
        $(e.target).closest('#notificationsList').length) {
        return;
    }
    
    $('.dropdown-menu').not('#notificationsList').removeClass('show');
}

function positionDropdown($toggle, $menu) {
    const toggleRect = $toggle[0].getBoundingClientRect();
    const menuWidth = $menu.outerWidth();
    
    $menu.css({
        'top': toggleRect.bottom + window.scrollY,
        'left': toggleRect.right - menuWidth + window.scrollX,
        'position': 'fixed'
    }).addClass('show');
}

  function loadUsers(page = 1) {
    config.currentPage = page;
    showLoadingSpinner();
    
    // Limpiar cualquier solicitud AJAX pendiente
    if (window.usersAjaxRequest) {
        window.usersAjaxRequest.abort();
    }

    const filters = {
        search: $('#searchInput').val().trim(),
        status: $('#statusFilter').val(),  // Asegurarse de que este valor sea correcto
        page: page,
        per_page: config.perPage,
        user_type: config.currentUserType  // Añadir tipo de usuario a los filtros
    };

    // Solo aplicar filtro de estado para personal
    if (config.currentUserType === 'clientes') {
        delete filters.status;
    }

    window.usersAjaxRequest = $.ajax({
        url: `../../Database/configuraciones/usuarios/traer_${config.currentUserType}.php`,
        method: 'GET',
        data: filters,
        dataType: 'json',
        success: handleUsersResponse,
        error: function(xhr, status, error) {
            if (status !== 'abort') {
                handleUsersError(xhr);
            }
        }
    });
}

    function handleUsersResponse(response) {
        if (response.success) {
            renderUsers(response.data);
            updatePagination(response.pagination);
        } else {
            showError('Error al cargar usuarios: ' + (response.error || ''));
        }
    }

    function handleUsersError(xhr) {
        showError('Error de conexión: ' + xhr.statusText);
    }

    function renderUsers(users) {
        const tbody = $('#usersTableBody');
        tbody.empty();

        if (users.length === 0) {
            tbody.html(noUsersTemplate());
            return;
        }

        users.forEach(user => {
            tbody.append(createUserRow(user));
        });

        setupDropdownActions();
    }

    function noUsersTemplate() {
        return '<tr><td colspan="7" class="text-center py-4">No se encontraron usuarios</td></tr>';
    }

function createUserRow(user) {
    const isPersonal = config.currentUserType === 'personal';
    const isActive = isPersonal ? isUserActive(user.activo) : true;
    // Handle both uppercase and lowercase field names, and nacionalidad can be E or V
    const nacionalidad = user.nacionalidad ? user.nacionalidad.toUpperCase() : 'V';
    const cedulaValue = user.Cedula || user.cedula || '';
    const cedula = nacionalidad + '-' + cedulaValue;
    
    return `
    <tr data-user-id="${user.id}" data-active-status="${isActive}">
        <td class="align-middle">${user.id}</td>
        <td class="align-middle">
            ${createUserAvatar(user, isPersonal, isActive)}
        </td>
        <td class="align-middle">${cedula}</td>
        <td class="align-middle">
            ${createContactInfo(user)}
        </td>
        <td class="align-middle">${formatUserDate(user)}</td>
        <td class="align-middle">
            ${createStatusBadge(isActive)}
        </td>
        <td class="align-middle text-end">
            ${createActionsDropdown(user.id, isPersonal, isActive)}
        </td>
    </tr>`;
}

    function isUserActive(activeStatus) {
        return activeStatus === true || activeStatus === 'activo' || activeStatus === 1;
    }

    function createUserAvatar(user, isPersonal, isActive) {
        return `
        <div class="d-flex align-items-center">
            <div class="avatar me-2">
                <i class="fas ${isPersonal ? 'fa-user-tie' : 'fa-user'} ${isActive ? 'bg-primary' : 'bg-secondary'} text-white rounded-circle p-2"></i>
            </div>
            <div>
                <strong>${user.nombre} ${user.apellido}</strong>
                ${isPersonal ? `<div class="small text-muted">${user.rol}</div>` : ''}
            </div>
        </div>`;
    }

    function createContactInfo(user) {
        return `
        <div>${user.telefono || ''}</div>
        <div class="small text-muted">${user.correo || 'Sin correo'}</div>`;
    }

    function formatUserDate(user) {
        return user.fecha_registro ? formatDate(user.fecha_registro) : 
               (user.fecha_contratacion ? formatDate(user.fecha_contratacion) : 'N/A');
    }

    function createStatusBadge(isActive) {
        return `<span class="badge ${isActive ? 'bg-success' : 'bg-danger'}">${isActive ? 'Activo' : 'Inactivo'}</span>`;
    }

    function createActionsDropdown(userId, isPersonal, isActive) {
        return `
        <div class="dropdown">
            <button class="dropdown-toggle" type="button">
                <i class="fas fa-ellipsis-v"></i>
            </button>
            <ul class="dropdown-menu">
                <li><a class="dropdown-item action-btn" href="#" data-action="edit"><i class="fas fa-edit me-2"></i>Editar</a></li>
                <li><a class="dropdown-item action-btn" href="#" data-action="view"><i class="fas fa-eye me-2"></i>Ver detalles</a></li>
                <li><hr class="dropdown-divider"></li>
                ${isPersonal ? createToggleAction(isActive, userId) : ''}
            </ul>
        </div>`;
    }

    function createToggleAction(isActive, userId) {
        return `
        <li>
            <a class="dropdown-item action-btn ${isActive ? 'text-danger' : 'text-success'}" 
               href="#" 
               data-action="${isActive ? 'deactivate' : 'activate'}">
                <i class="fas ${isActive ? 'fa-user-slash' : 'fa-user-check'} me-2"></i>
                ${isActive ? 'Desactivar' : 'Activar'}
            </a>
        </li>`;
    }

    function setupDropdownActions() {
        $(document)
            .off('click', '.action-btn')
            .on('click', '.action-btn', handleActionClick);
    }

    function handleActionClick(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const action = $(this).data('action');
        const $row = $(this).closest('tr');
        const userId = $row.data('user-id');
        
        switch(action) {
            case 'edit':
                showEditUserModal(userId);
                break;
            case 'view':
                viewUserDetails(userId);
                break;
            case 'activate':
            case 'deactivate':
                toggleUserStatus($row, userId, action === 'activate');
                break;
        }
        
        $(this).closest('.dropdown-menu').removeClass('show');
    }

    function updatePagination(pagination) {
        const $pagination = $('#pagination');
        $pagination.empty();

        if (pagination.last_page <= 1) return;

        $pagination.append(createPaginationItem('Anterior', pagination.current_page - 1, pagination.current_page === 1));
        
        const pages = getVisiblePages(pagination.current_page, pagination.last_page);
        
        if (pages[0] > 1) {
            $pagination.append(createPaginationItem('1', 1));
            if (pages[0] > 2) {
                $pagination.append(createPaginationEllipsis());
            }
        }
        
        pages.forEach(page => {
            $pagination.append(createPaginationItem(page, page, page === pagination.current_page));
        });
        
        if (pages[pages.length - 1] < pagination.last_page) {
            if (pages[pages.length - 1] < pagination.last_page - 1) {
                $pagination.append(createPaginationEllipsis());
            }
            $pagination.append(createPaginationItem(pagination.last_page, pagination.last_page));
        }
        
        $pagination.append(createPaginationItem('Siguiente', pagination.current_page + 1, pagination.current_page === pagination.last_page));
    }

    function getVisiblePages(currentPage, lastPage) {
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow/2));
        let endPage = Math.min(lastPage, startPage + maxPagesToShow - 1);
        
        if (endPage - startPage < maxPagesToShow - 1) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }
        
        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    }

    function createPaginationItem(text, page, disabled = false) {
        return `
        <li class="page-item ${disabled ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${page}">${text}</a>
        </li>`;
    }

    function createPaginationEllipsis() {
        return '<li class="page-item disabled"><span class="page-link">...</span></li>';
    }

    function showAddUserModal() {
        const modalTitle = `Agregar ${config.currentUserType === 'clientes' ? 'Cliente' : 'Miembro del Personal'}`;
        
        $.ajax({
            url: `../../Database/configuraciones/usuarios/formulario_usuario.php`,
            method: 'GET',
            data: {
                user_type: config.currentUserType
            },
            success: (response) => setupModal(modalTitle, response),
            error: (xhr) => showToast('error', 'Error al cargar el formulario: ' + xhr.statusText)
        });
    }

    function showEditUserModal(userId) {
    const modalTitle = `Editar ${config.currentUserType === 'clientes' ? 'Cliente' : 'Miembro del Personal'}`;
    
    // Mostrar loading spinner
    $('#userModal .modal-content').html(`
        <div class="modal-header">
            <h5 class="modal-title">${modalTitle}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body loading-spinner">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
        </div>
    `);
    
    $('#userModal').modal('show');

    // Primero obtener los datos del usuario
    $.ajax({
        url: `../../Database/configuraciones/usuarios/obtener_usuario.php`,
        method: 'GET',
        data: {
            user_id: userId,
            user_type: config.currentUserType
        },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                // Luego obtener el formulario HTML
                $.ajax({
                    url: `../../Database/configuraciones/usuarios/formulario_usuario.php`,
                    method: 'GET',
                    data: {
                        user_type: config.currentUserType,
                        user_id: userId,
                        is_edit: true
                    },
                    success: function(formHtml) {
                        // Configurar el modal con el formulario
                        $('#userModal .modal-content').html(`
                            <div class="modal-header">
                                <h5 class="modal-title">${modalTitle}</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                ${formHtml}
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="button" class="btn btn-primary" id="saveUserBtn">Guardar cambios</button>
                            </div>
                        `);

                        // Llenar el formulario con los datos del usuario
                        fillFormWithData(response.data);

                        // Inicializar componentes
                        initSelect2();
                        initDatePickers();
                        setupFormValidations();
                        
                        // Configurar evento de guardado
                        $('#saveUserBtn').click(() => saveUser(userId));
                    },
                    error: function(xhr) {
                        showToast('error', 'Error al cargar el formulario: ' + xhr.statusText);
                        $('#userModal').modal('hide');
                    }
                });
            } else {
                showToast('error', response.error || 'Error al obtener datos del usuario');
                $('#userModal').modal('hide');
            }
        },
        error: function(xhr) {
            showToast('error', 'Error al cargar datos del usuario: ' + xhr.statusText);
            $('#userModal').modal('hide');
        }
    });
}

    function loadEditForm(userId, userData, modalTitle) {
        // Obtener formulario de edición
        $.get(`../../Database/configuraciones/usuarios/formulario_usuario.php`, 
            { user_type: config.currentUserType, is_edit: true },
            function(formHtml) {
                setupEditModal(modalTitle, formHtml, userData, userId);
            }
        );
    }

    function setupEditModal(title, formHtml, userData, userId) {
        const $form = $(formHtml);
        
        // Llenar formulario con datos
        fillFormWithData($form, userData);
        
        // Configurar modal
        $('#userModal .modal-content').html(`
            <div class="modal-header">
                <h5 class="modal-title">${title}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                ${$form[0].outerHTML}
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary" id="saveUserBtn">Guardar cambios</button>
            </div>
        `);
        
        // Inicializar componentes
        initSelect2();
        initDatePickers();
        setupFormValidations();
        
        // Configurar evento de guardado
        $('#saveUserBtn').click(() => saveUser(userId));
    }

    function fillFormWithData(userData) {
    // Llenar campos comunes
    $('[name="nombre"]').val(userData.nombre || '');
    $('[name="apellido"]').val(userData.apellido || '');
    $('[name="telefono"]').val(userData.telefono || '');
    $('[name="correo"]').val(userData.correo || '');
    
    // Campos específicos para clientes
    if (config.currentUserType === 'clientes') {
        $('[name="cedula"]').val(userData.Cedula || '');
        $('[name="direccion"]').val(userData.direccion || '');
        
        if (userData.fecha_nacimiento && userData.fecha_nacimiento !== '0000-00-00') {
            $('[name="fecha_nacimiento"]').val(userData.fecha_nacimiento.split(' ')[0]);
        }
    } 
    // Campos específicos para personal
    else {
        $('[name="rol"]').val(userData.rol || '').trigger('change');
        $('[name="activo"]').prop('checked', userData.activo == 1);
        
        if (userData.fecha_contratacion) {
            $('[name="fecha_contratacion"]').val(userData.fecha_contratacion.split(' ')[0]);
        }
    }
}

    function initSelect2() {
        if ($('.select2').length) {
            $('.select2').select2({
                dropdownParent: $('#userModal')
            });
        }
    }

    function initDatePickers() {
        // Inicializar Flatpickr para fechas
        $(".flatpickr-date").flatpickr({
            dateFormat: "Y-m-d",
            allowInput: true,
            locale: "es"
        });
        
        // Configuración específica para fecha de nacimiento
        $("#fecha_nacimiento").flatpickr({
            maxDate: new Date().fp_incr(-18 * 365) // Mínimo 18 años
        });
        
        // Configuración específica para fecha de contratación
        $("#fecha_contratacion").flatpickr({
            minDate: "2000-01-01",
            maxDate: new Date().fp_incr(0) // Hoy
        });
    }

    function setupFormValidations() {
        // Validar cédula (solo números y máximo 8 dígitos)
        $('#cedula').on('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
            if (this.value.length > 8) {
                this.value = this.value.slice(0, 8);
            }
            updateCharCounter(this.value.length, 8, $(this));
        });
        
        // Validar teléfono (solo números)
        $('#telefono').on('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
        
        // Validar campos de texto (evitar caracteres especiales)
        $('input[name="nombre"], input[name="apellido"]').on('input', function() {
            this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        });
        
        // Validar contraseñas coincidentes
        $('#confirmar_clave').on('keyup', function() {
            if ($('#clave').val() !== $('#confirmar_clave').val()) {
                this.setCustomValidity('Las contraseñas no coinciden');
            } else {
                this.setCustomValidity('');
            }
        });
        
        // Validar correo electrónico
        $('#correo').on('input', function() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (this.value && !emailRegex.test(this.value)) {
                this.setCustomValidity('Por favor ingrese un correo electrónico válido');
            } else {
                this.setCustomValidity('');
            }
        });
        
        // Configurar contador de caracteres para cédula
        $('#cedula').parent('.input-limit').remove();
        $('#cedula').wrap('<div class="input-limit position-relative"></div>');
        $('<div class="char-counter position-absolute end-0 bottom-0 me-2 mb-1 small text-muted">0/8</div>').insertAfter('#cedula');
    }

    function updateCharCounter(currentLength, maxLength, $field) {
        const counter = $field.siblings('.char-counter');
        counter.text(`${currentLength}/${maxLength}`);
        counter.toggleClass('text-danger', currentLength === maxLength);
    }

    function setupModal(title, content, userId = null) {
        $('#userModal .modal-content').html(`
            <div class="modal-header">
                
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">${content}</div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary" id="saveUserBtn">Guardar</button>
            </div>
        `);

        // Inicializar componentes
        initSelect2();
        initDatePickers();
        setupFormValidations();
        
        // Configurar evento de guardado
        setupUserForm(userId);
        $('#userModal').modal('show');
    }

    function setupUserForm(userId) {
        $('#saveUserBtn').click(() => saveUser(userId));
    }

    function saveUser(userId) {
        const $form = $('#userForm');
        if ($form.length === 0) return;

        const formData = new FormData($form[0]);
        if (userId) formData.append('user_id', userId);
        formData.append('user_type', config.currentUserType);

        $.ajax({
            url: '../../Database/configuraciones/usuarios/guardar_usuario.php',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            dataType: 'json',
            success: handleSaveResponse,
            error: (xhr) => showToast('error', 'Error de conexión: ' + xhr.statusText)
        });

        function handleSaveResponse(response) {
            if (response.success) {
                showToast('success', userId ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');
                $('#userModal').modal('hide');
                loadUsers(config.currentPage);
            } else {
                showToast('error', response.error || 'Error al guardar el usuario');
            }
        }
    }

    function viewUserDetails(userId) {
        $.ajax({
            url: '../../Database/configuraciones/usuarios/detalles_usuario.php',
            method: 'GET',
            data: {
                user_id: userId,
                user_type: config.currentUserType
            },
            success: showDetailsModal,
            error: (xhr) => showToast('error', 'Error al cargar detalles: ' + xhr.statusText)
        });
    }

    function showDetailsModal(response) {
        Swal.fire({
            title: `Detalles del ${config.currentUserType === 'clientes' ? 'Cliente' : 'Usuario'}`,
            html: response,
            width: '800px',
            showConfirmButton: false,
            showCloseButton: true
        });
    }

    function toggleUserStatus($row, userId, activate) {
        const actionText = activate ? 'activar' : 'desactivar';
        
        Swal.fire({
            title: `¿${activate ? 'Activar' : 'Desactivar'} usuario?`,
            text: `Estás a punto de ${actionText} este usuario.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: activate ? '#28a745' : '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Sí, ${actionText}`,
            cancelButtonText: 'Cancelar',
            showLoaderOnConfirm: true,
            preConfirm: () => sendStatusUpdate(userId, activate)
        }).then(handleStatusUpdateResponse);
    }

    function sendStatusUpdate(userId, activate) {
        return $.ajax({
            url: '../../Database/configuraciones/usuarios/cambiar_estado_usuario.php',
            method: 'POST',
            data: {
                user_id: userId,
                user_type: 'personal',
                activate: activate ? '1' : '0'
            },
            dataType: 'json'
        }).then(response => {
            if (!response.success) {
                throw new Error(response.message || `Error al ${activate ? 'activar' : 'desactivar'} el usuario`);
            }
            return response;
        });
    }

    function handleStatusUpdateResponse(result) {
        if (result.isConfirmed) {
            showToast('success', result.value.message);
            loadUsers(config.currentPage);
        }
    }

    function updateUserRowStatus($row, isActive) {
        $row.attr('data-active-status', isActive);
        
        // Badge de estado
        $row.find('.badge')
            .toggleClass('bg-success bg-danger', isActive)
            .text(isActive ? 'Activo' : 'Inactivo');
        
        // Botón de acción
        const $actionBtn = $row.find('[data-action^="act"]');
        $actionBtn
            .data('action', isActive ? 'deactivate' : 'activate')
            .toggleClass('text-success text-danger', !isActive)
            .find('i')
                .toggleClass('fa-user-check fa-user-slash', !isActive)
            .end()
            .text(isActive ? 'Desactivar' : 'Activar');
        
        // Icono de avatar
        $row.find('.avatar i')
            .toggleClass('bg-primary bg-secondary', isActive);
    }

    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    }

    function showToast(icon, title) {
        const Toast = Swal.mixin({
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
        
        Toast.fire({ icon, title });
    }

    function showError(message) {
        $('#usersTableBody').html(`<tr><td colspan="7" class="text-center py-4 text-danger">${message}</td></tr>`);
        showToast('error', message);
    }

    function showLoadingSpinner() {
        $('#usersTableBody').html('<tr><td colspan="7" class="text-center py-4"><div class="spinner-border text-primary" role="status"></div></td></tr>');
    }

    function updateActiveButton(activeId, inactiveId) {
        $(`#${activeId}`).addClass('active btn-primary').removeClass('btn-outline-primary');
        $(`#${inactiveId}`).removeClass('active btn-primary').addClass('btn-outline-primary');
    }
});