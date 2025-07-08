document.addEventListener('DOMContentLoaded', function() {
    // Inicializar componentes de Materialize
    M.AutoInit();
    
    const emailForm = document.getElementById('emailForm');
    const codeForm = document.getElementById('codeForm');
    const passwordForm = document.getElementById('passwordForm');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const successMessage = document.getElementById('successMessage');
    const emailDisplay = document.getElementById('emailDisplay');
    const backToEmail = document.getElementById('backToEmail');
    const backToCode = document.getElementById('backToCode');
    const emailError = document.getElementById('emailError');
    const codeError = document.getElementById('codeError');
    const passwordError = document.getElementById('passwordError');
    
    // Configurar SweetAlert2 en modo dark
    const Toast = Swal.mixin({
        background: '#161616',
        color: '#fff',
        iconColor: '#6a1b9a',
        confirmButtonColor: '#6a1b9a'
    });
    
    // Paso 1: Validar correo y enviar código
    emailForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('recovery_email').value;
        
        if (!validateEmail(email)) {
            emailError.textContent = 'Por favor ingresa un correo electrónico válido';
            emailError.style.display = 'block';
            return;
        }
        
        fetch('../../Database/auth/envio_codigo.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `email=${encodeURIComponent(email)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Toast.fire({
                    icon: 'success',
                    title: 'Código enviado',
                    text: 'Hemos enviado un código de recuperación a tu correo electrónico'
                });
                
                emailError.style.display = 'none';
                emailDisplay.textContent = email;
                step1.style.display = 'none';
                step2.style.display = 'block';
            } else {
                emailError.textContent = data.message || 'Error al enviar el código';
                emailError.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            emailError.textContent = 'Error de conexión con el servidor';
            emailError.style.display = 'block';
        });
    });
    
    // Paso 2: Validar código
    codeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('recovery_email').value;
        const code = document.getElementById('recovery_code').value;
        
        fetch('../../Database/auth/verificacion_codigo.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                codeError.style.display = 'none';
                step2.style.display = 'none';
                step3.style.display = 'block';
            } else {
                codeError.textContent = data.message || 'El código ingresado no es válido o ha expirado';
                codeError.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            codeError.textContent = 'Error de conexión con el servidor';
            codeError.style.display = 'block';
        });
    });
    
    // Paso 3: Cambiar contraseña
    passwordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('recovery_email').value;
        const newPassword = document.getElementById('new_password').value;
        const confirmPassword = document.getElementById('confirm_new_password').value;
        
        if (newPassword !== confirmPassword) {
            passwordError.textContent = 'Las contraseñas no coinciden';
            passwordError.style.display = 'block';
            return;
        }
        
        if (!validatePassword(newPassword)) {
            passwordError.textContent = 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números';
            passwordError.style.display = 'block';
            return;
        }
        
        fetch('../../Database/auth/actualizar_contraseña.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(newPassword)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                passwordError.style.display = 'none';
                step3.style.display = 'none';
                successMessage.style.display = 'block';
            } else {
                passwordError.textContent = data.message || 'Error al actualizar la contraseña';
                passwordError.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            passwordError.textContent = 'Error de conexión con el servidor';
            passwordError.style.display = 'block';
        });
    });
    
    // Botones de navegación
    backToEmail.addEventListener('click', function() {
        step2.style.display = 'none';
        step1.style.display = 'block';
    });
    
    backToCode.addEventListener('click', function() {
        step3.style.display = 'none';
        step2.style.display = 'block';
    });
    
    // Funciones de validación
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function validatePassword(password) {
        return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password);
    }
});