// Cargar navbar desde archivo externo
document.addEventListener('DOMContentLoaded', function() {
    fetch('../../VIEWS/navbar/navbar.php')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
            // Aquí puedes agregar cualquier funcionalidad específica del navbar
            console.log('Navbar cargado correctamente');
        })
        .catch(error => console.error('Error cargando navbar:', error));
});