// /js/logout.js
function logoutUser() {
    Swal.fire({
        title: 'Cerrar sesión',
        text: "¿Estás seguro de que quieres salir?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff6d00',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Cancelar',
        background: '#fff',
        color: '#000',
        allowOutsideClick: false,
        backdrop: `
            rgba(0,0,0,0.8)
            url("/assets/img/logout-animation.gif")
            center top
            no-repeat
        `
    }).then((result) => {
        if (result.isConfirmed) {
            // Mostrar loader con temporizador fijo
            let timerInterval;
            Swal.fire({
                title: 'Cerrando tu sesión',
                html: 'Estamos terminando tu sesión de forma segura...<br><div class="progress mt-3"><div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%"></div></div>',
                timer: 2000,
                timerProgressBar: false,
                allowOutsideClick: false,
                showConfirmButton: false,
                willOpen: () => {
                    // Iniciar el logout en segundo plano
                    $.ajax({
                        url: '../Database/auth/logout.php',
                        type: 'POST',
                        dataType: 'json'
                    }).always(() => {
                        // La redirección se hará cuando termine el timer
                    });
                },
                willClose: () => {
                    clearInterval(timerInterval);
                    // Redirigir cuando se cierre
                    window.location.href = '../VIEWS/Auth/login.php';
                }
            });
        }
    });
}

// Versión simplificada de inicialización
$(function() {
    $(document).on('click', '#logoutBtn, .logout-btn', function(e) {
        e.preventDefault();
        logoutUser();
    });
});