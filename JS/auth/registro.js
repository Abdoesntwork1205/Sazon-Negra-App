document.addEventListener('DOMContentLoaded', function() {
    // Inicializar componentes de Materialize
    M.AutoInit();
    
    // Datepicker con configuración
    const datepicker = document.querySelectorAll('.datepicker');
    M.Datepicker.init(datepicker, {
        format: 'yyyy-mm-dd',
        maxDate: new Date(new Date().setFullYear(new Date().getFullYear() - 16)),
        yearRange: [1900, new Date().getFullYear() - 16],
        defaultDate: new Date(new Date().setFullYear(new Date().getFullYear() - 20)),
        setDefaultDate: true,
        autoClose: true,
        i18n: {
            cancel: 'Cancelar',
            clear: 'Limpiar',
            done: 'Aceptar',
            months: [
                'Enero', 'Febrero', 'Marzo', 'Abril',
                'Mayo', 'Junio', 'Julio', 'Agosto',
                'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
            ],
            monthsShort: [
                'Ene', 'Feb', 'Mar', 'Abr',
                'May', 'Jun', 'Jul', 'Ago',
                'Sep', 'Oct', 'Nov', 'Dic'
            ],
            weekdays: [
                'Domingo', 'Lunes', 'Martes', 'Miércoles',
                'Jueves', 'Viernes', 'Sábado'
            ],
            weekdaysShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
            weekdaysAbbrev: ['D', 'L', 'M', 'M', 'J', 'V', 'S']
        },
        container: document.body,
        onOpen: function() {
            // Asegurar que todos los elementos del calendario tengan los estilos correctos
            const picker = document.querySelector('.datepicker-modal');
            if (picker) {
                // Forzar actualización de estilos
                setTimeout(() => {
                    const yearInput = picker.querySelector('.select-year input');
                    if (yearInput) yearInput.style.color = 'white';
                    
                    const yearDropdown = picker.querySelector('.select-year .dropdown-trigger');
                    if (yearDropdown) yearDropdown.style.color = 'white';
                }, 50);
            }
        }
    });

    // Mostrar/ocultar contraseña
    document.querySelectorAll('.toggle-password, .toggle-confirm-password').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.querySelector('i').textContent = type === 'password' ? 'remove_red_eye' : 'visibility_off';
        });
    });

    // Validación de confirmación de contraseña en tiempo real
    document.getElementById('confirm_password').addEventListener('input', function() {
        const password = document.getElementById('password').value;
        if (this.value !== password) {
            this.classList.add('invalid');
            this.classList.remove('valid');
        } else {
            this.classList.add('valid');
            this.classList.remove('invalid');
        }
    });

    // Validación de teléfono en tiempo real
    document.getElementById('telefono').addEventListener('input', function() {
        const regex = /^(0412|0414|0416|0424)[0-9]{7}$/;
        if (this.value.length > 0 && !regex.test(this.value)) {
            this.classList.add('invalid');
            this.classList.remove('valid');
        } else {
            this.classList.add('valid');
            this.classList.remove('invalid');
        }
    });

    // Enviar formulario
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validar confirmación de contraseña
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm_password').value;
        
        if (password !== confirmPassword) {
            M.toast({html: 'Las contraseñas no coinciden', classes: 'red darken-2'});
            return;
        }
        
        // Mostrar carga
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner-layer spinner-blue-only">...</span> Procesando...';
        submitBtn.disabled = true;
        
        // Enviar datos al servidor
        const formData = new FormData(this);
        
        fetch('../../Database/auth/registro.php', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            return response.json();
        })
        .then(data => {
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Registro exitoso!',
                    text: data.message,
                    confirmButtonColor: '#6c63ff',
                    timer: 3000,
                    timerProgressBar: true
                }).then(() => {
                    window.location.href = 'login.php';
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    html: data.message,
                    confirmButtonColor: '#6c63ff'
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al procesar la solicitud: ' + error.message,
                confirmButtonColor: '#6c63ff'
            });
        })
        .finally(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
    });
});