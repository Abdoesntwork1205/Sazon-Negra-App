// Función para inicializar la página de perfil
function initProfilePage() {
    fillProfileForm();
    setupFormValidation();
    setupFieldRestrictions();
}

// Rellenar formulario con datos del usuario
function fillProfileForm() {
    const $form = $('#user-data-form');
    if ($form.length === 0) return;

    // Campos editables
    $form.find('[name="nombre"]').val(userData.nombre || '');
    $form.find('[name="apellido"]').val(userData.apellido || '');
    $form.find('[name="telefono"]').val(userData.telefono || '');
    $form.find('[name="perfil_email"]').val(userData.correo || '');
    $form.find('[name="perfil_cedula"]').val(userData.Cedula || '');
    $form.find('[name="perfil_nacionalidad"]').val(userData.Nacionalidad || 'V');
    
    // Fecha de nacimiento
    if (userData.fecha_nacimiento) {
        const [year, month, day] = userData.fecha_nacimiento.split('-');
        $form.find('[name="fecha_nacimiento"]').val(`${year}-${month}-${day}`);
    }
    
    $form.find('[name="direccion"]').val(userData.direccion || '');
}

// Configurar validaciones del formulario
function setupFormValidation() {
    const $form = $('#user-data-form');
    if ($form.length === 0) return;

    $form.on('submit', function(e) {
        e.preventDefault();
        
        // Validar email
        const email = $form.find('[name="perfil_email"]').val();
        if (!validateEmail(email)) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Por favor ingrese un correo electrónico válido'
            });
            return false;
        }

        // Validar contraseñas
        const currentPass = $form.find('[name="clave_actual"]').val();
        const newPass = $form.find('[name="clave_nueva"]').val();
        const confirmPass = $form.find('[name="clave_confirmacion"]').val();
        
        if (currentPass || newPass || confirmPass) {
            if (newPass !== confirmPass) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Las contraseñas nuevas no coinciden'
                });
                return false;
            }
            
            if (newPass.length < 6) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'La contraseña debe tener al menos 6 caracteres'
                });
                return false;
            }
        }
        
        updateProfileData($form);
        return false;
    });
}

// Configurar restricciones de campos (solo cédula no editable)
function setupFieldRestrictions() {
    $('#perfil_cedula').prop('readonly', true).addClass('bg-light');
}

// Validar formato de email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Actualizar datos del perfil
// Actualizar datos del perfil
function updateProfileData($form) {
    showLoader();
    
    const formData = $form.serializeArray();
    const data = {};
    
    // Convertir a objeto y mapear nombres
    $.each(formData, function(_, field) {
        if (field.name.includes('clave') && !field.value) return;
        
        // Mapear nombres de campos - VERSIÓN SIMPLIFICADA
        const fieldMap = {
            'perfil_email': 'email',
            'perfil_cedula': 'cedula',
            'perfil_nacionalidad': 'nacionalidad'
        };
        
        data[fieldMap[field.name] || field.name] = field.value;
    });
    
    // Validación adicional para asegurar que el email no esté vacío
    if (!data.email || !validateEmail(data.email)) {
        hideLoader();
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El correo electrónico es requerido y debe ser válido'
        });
        return;
    }
    
    data.id = userData.id;
    
    $.ajax({
        url: '../Database/perfil/actualizar_datos.php',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(response) {
            if (response.success) {
                // Actualizar datos locales incluyendo el email
                $.extend(userData, {
                    nombre: data.nombre,
                    apellido: data.apellido,
                    telefono: data.telefono,
                    direccion: data.direccion,
                    fecha_nacimiento: data.fecha_nacimiento,
                    Nacionalidad: data.nacionalidad,
                    correo: data.email,  // Asegurar que el email se actualice
                    Cedula: data.cedula
                });
                
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'Perfil actualizado correctamente',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    updateUserUI();
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message || 'Error al actualizar el perfil'
                });
            }
        },
        error: function(xhr) {
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: xhr.responseJSON?.message || 'Ocurrió un error al comunicarse con el servidor'
            });
        },
        complete: hideLoader
    });
}

// Actualizar UI de manera más completa
// Actualizar UI de manera más completa
function updateUserUI() {
    // Actualizar nombre completo
    const fullName = `${userData.nombre} ${userData.apellido}`.trim();
    
    // 1. Actualizar texto en todos los elementos relevantes
    $('.user-name, .user-fullname, .profile-name').text(fullName);
    
    // 2. Actualizar iniciales del avatar
    const initials = (userData.nombre?.charAt(0) || '') + (userData.apellido?.charAt(0) || '');
    $('#user-avatar-initials').text(initials.toUpperCase());
    
    // 3. Actualizar email en todos los lugares relevantes
    if (userData.correo) {
        $('.user-email, .profile-email').text(userData.correo);
    }
    
    // 4. Si existe una función global para actualizar la UI
    if (typeof updateUserDataUI === 'function') {
        updateUserDataUI();
    }
    
    // 5. Forzar actualización del dropdown de Bootstrap (si es necesario)
    const dropdown = bootstrap.Dropdown.getInstance('#userDropdown');
    if (dropdown) {
        dropdown.hide();
    }
}

// Funciones para mostrar/ocultar loader
function showLoader() {
    $('#preloader').fadeIn('fast');
}

function hideLoader() {
    $('#preloader').fadeOut('fast');
}