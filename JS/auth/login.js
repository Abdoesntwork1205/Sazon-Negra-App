document.addEventListener('DOMContentLoaded', function() {
    // Función para validar email
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Configurar alertas
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#161616',
        color: '#fff',
        iconColor: '#6c63ff'
    });

    // Mostrar/ocultar contraseña
    const passwordInput = document.getElementById('clave');
    if (passwordInput) {
        const passwordToggle = document.createElement('span');
        passwordToggle.className = 'input-group-text toggle-password';
        passwordToggle.innerHTML = '<i class="fas fa-eye"></i>';
        passwordToggle.style.cursor = 'pointer';
        passwordInput.parentNode.appendChild(passwordToggle);

        passwordToggle.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }

    // Manejar formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const clave = document.getElementById('clave').value;
            const submitBtn = e.target.querySelector('button[type="submit"]');

            if(!validateEmail(email)) {
                Toast.fire({
                    icon: 'error',
                    title: 'Por favor ingresa un correo válido'
                });
                return;
            }

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Verificando...';

            try {
                const response = await fetch('../../Database/auth/login.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `email=${encodeURIComponent(email)}&clave=${encodeURIComponent(clave)}`
                });

                const data = await response.json();
                
                if(data.success) {
                    if(data.multiple) {
                        await handleMultipleAccounts(data, email);
                    } else {
                        handleLoginSuccess(data.user);
                    }
                } else {
                    Toast.fire({
                        icon: 'error',
                        title: data.message || 'Error al iniciar sesión'
                    });
                }
            } catch (error) {
                console.error('Login error:', error);
                Toast.fire({
                    icon: 'error',
                    title: 'Error de conexión con el servidor'
                });
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Ingresar';
            }
        });
    }

    async function handleMultipleAccounts(data, email) {
        const { value: tipo } = await Swal.fire({
            title: '¿Cómo deseas ingresar?',
            html: `
                <div style="display: flex; justify-content: center; gap: 30px; margin: 20px 0;">
                    <div class="profile-option" id="client-option">
                        <i class="fas fa-user"></i>
                        <span>Cliente</span>
                    </div>
                    <div class="profile-option" id="staff-option">
                        <i class="fas fa-user-tie"></i>
                        <span>Personal</span>
                    </div>
                </div>
                <style>
                    .profile-option {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        cursor: pointer;
                        transition: all 0.3s;
                        padding: 15px;
                        border-radius: 10px;
                    }
                    .profile-option:hover {
                        background: #252532;
                    }
                    .profile-option i {
                        font-size: 40px;
                        margin-bottom: 10px;
                        color: #6c63ff;
                    }
                    .profile-option span {
                        font-size: 14px;
                        color: #fff;
                    }
                </style>
            `,
            background: '#161616',
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            cancelButtonColor: '#d33',
            focusConfirm: false,
            allowOutsideClick: false,
            didOpen: () => {
                document.getElementById('client-option').addEventListener('click', () => {
                    Swal.close({ isConfirmed: true, value: 'clientes' });
                });
                document.getElementById('staff-option').addEventListener('click', () => {
                    Swal.close({ isConfirmed: true, value: 'personal' });
                });
            }
        });

        if (!tipo) return;

        const userData = data.options[tipo];
        handleLoginSuccess(userData);
    }

    function handleLoginSuccess(userData) {
    // Guardar en almacenamiento del navegador
    sessionStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('userDataBackup', JSON.stringify(userData));

    // Mostrar mensaje de bienvenida
    Swal.fire({
        title: `¡Bienvenido ${userData.nombre || ''}!`,
        icon: 'success',
        iconColor: '#02fd02',
        showConfirmButton: false,
        timer: 1500
    }).then(() => {
        // Redirigir según rol - rutas absolutas desde la raíz
        const redirectMap = {
            'admin': '../../VIEWS/configuraciones/dash.php',
            'cajero': '../../VIEWS/configuraciones/crear-orden.php',
            'encargado': '../../VIEWS/configuraciones/dashboard.php',
            'administracion': '../../VIEWS/configuraciones/reportes.php',
            'cliente': '../../VIEWS/index.php'
        };
        
        const redirectPage = redirectMap[userData.rol?.toLowerCase()] || '../../VIEWS/Auth/login.php';
        window.location.href = redirectPage;
    });
}
});