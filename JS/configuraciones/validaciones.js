// =========================================================================
// validaciones.js - Validaciones unificadas para todas las interfaces
// =========================================================================

$(document).ready(function() {
    // Aplicar todas las validaciones cuando el DOM esté listo
    aplicarValidacionesCrearOrden();
    aplicarValidacionesCategorias();
    aplicarValidacionesProductos();
    aplicarValidacionesPromociones();
    aplicarValidacionesOrdenes(); // Nueva función agregada
});

// =========================================================================
// VALIDACIONES PARA CREAR ORDEN
// =========================================================================
function aplicarValidacionesCrearOrden() {
    // Solo aplica si estamos en la página de crear orden
    if ($('#clientId').length) {
        // Validación para el campo de cédula
        $('#clientId').on('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
            if(this.value.length > 10) {
                this.value = this.value.slice(0,10);
            }
        });
        
        // Validación para el campo de nombre
        $('#clientName').on('input', function() {
            this.value = this.value.replace(/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/g, '');
        });
        
        // Validación para el campo de teléfono
        $('#clientPhone').on('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
            if(this.value.length > 20) {
                this.value = this.value.slice(0,20);
            }
        });
        
        // Validación para el campo de email
        $('#clientEmail').on('blur', function() {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            const isValid = emailRegex.test(this.value) || this.value === '';
            mostrarFeedback(this, isValid, "Por favor ingrese un correo electrónico válido");
        });
    }
}

// =========================================================================
// VALIDACIONES PARA GESTIÓN DE CATEGORÍAS
// =========================================================================
function aplicarValidacionesCategorias() {
    // Solo aplica si estamos en la página de categorías
    if ($('#categoryName').length) {
        // Validación para el nombre de categoría
        $('#categoryName').on('input', function() {
            this.value = this.value.replace(/[^A-Za-záéíóúÁÉÍÓÚñÑ0-9\s\-]/g, '');
        });
        
        // Validación para la descripción de categoría
        $('#categoryDescription').on('input', function() {
            this.value = this.value.replace(/[^A-Za-záéíóúÁÉÍÓÚñÑ0-9\s\.,;:\-]/g, '');
        });
    }
}

// =========================================================================
// VALIDACIONES PARA GESTIÓN DE PRODUCTOS
// =========================================================================
function aplicarValidacionesProductos() {
    // Solo aplica si estamos en la página de productos
    if ($('#productTitle').length) {
        // Validación para el título del producto
        $('#productTitle').on('input', function() {
            this.value = this.value.replace(/[^A-Za-záéíóúÁÉÍÓÚñÑ0-9\s\-]/g, '');
        });
        
        // Validación para el precio del producto
        $('#productPrice').on('input', function() {
            // Permitir números y un punto decimal
            this.value = this.value.replace(/[^0-9.]/g, '');
            
            // Asegurar que solo haya un punto decimal
            if ((this.value.match(/\./g) || []).length > 1) {
                this.value = this.value.substring(0, this.value.lastIndexOf('.'));
            }
        });
        
        // Validación para el tiempo de preparación
        $('#productTime').on('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
        
        // Validación para la descripción del producto
        $('#productDescription').on('input', function() {
            this.value = this.value.replace(/[^A-Za-záéíóúÁÉÍÓÚñÑ0-9\s\.,;:\-]/g, '');
        });
    }
}

// =========================================================================
// VALIDACIONES PARA GESTIÓN DE PROMOCIONES
// =========================================================================
function aplicarValidacionesPromociones() {
    // Solo aplica si estamos en la página de promociones
    if ($('#promocionNombre').length) {
        // Validación para el nombre de la promoción
        $('#promocionNombre').on('input', function() {
            this.value = this.value.replace(/[^A-Za-záéíóúÁÉÍÓÚñÑ0-9\s\-]/g, '');
        });
        
        // Validación para el valor del descuento
        $('#promocionValor').on('input', function() {
            const tipo = $('#promocionTipo').val();
            
            if (tipo === 'porcentaje' || tipo === 'monto_fijo') {
                // Permitir números y un punto decimal para porcentajes y montos fijos
                this.value = this.value.replace(/[^0-9.]/g, '');
                
                // Asegurar que solo haya un punto decimal
                if ((this.value.match(/\./g) || []).length > 1) {
                    this.value = this.value.substring(0, this.value.lastIndexOf('.'));
                }
                
                // Validación adicional para porcentajes (0-100)
                if (tipo === 'porcentaje') {
                    const valor = parseFloat(this.value);
                    if (valor > 100) {
                        this.value = '100';
                    }
                }
            } else {
                // Para otros tipos (2x1, 3x2), no permitir entrada
                this.value = '';
            }
        });
    }
}

// =========================================================================
// VALIDACIONES PARA GESTIÓN DE ÓRDENES/PEDIDOS
// =========================================================================
function aplicarValidacionesOrdenes() {
    // Solo aplica si estamos en la página de órdenes
    if ($('#searchId').length) {
        // Validación para el campo de búsqueda por cédula
        $('#searchId').on('input', function() {
            // Eliminar cualquier carácter que no sea número
            this.value = this.value.replace(/[^0-9]/g, '');
            
            // Limitar a 10 dígitos máximo
            if(this.value.length > 10) {
                this.value = this.value.slice(0,10);
            }
            
            // Mostrar feedback visual
            const isValid = this.value.length === 0 || (this.value.length >= 7 && this.value.length <= 10);
            mostrarFeedback(this, isValid, "La cédula debe tener entre 7 y 10 dígitos");
        });
        
        // Validación al enviar el formulario de filtrado
        $('#filterForm').on('submit', function(e) {
            const cedula = $('#searchId').val();
            
            // Si se ingresó una cédula, validar que tenga longitud válida
            if(cedula && (cedula.length < 7 || cedula.length > 10)) {
                mostrarFeedback($('#searchId')[0], false, "La cédula debe tener entre 7 y 10 dígitos");
                e.preventDefault();
                return false;
            }
            
            return true;
        });
    }
}



// =========================================================================
// FUNCIÓN PARA INICIALIZAR VALIDACIONES EN FORMULARIOS DINÁMICOS
// =========================================================================
function inicializarValidacionesFormulario(formId) {
    $(`#${formId} .solo-letras`).on('input', function() {
        this.value = this.value.replace(/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/g, '');
    });
    
    $(`#${formId} .solo-numeros`).on('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
    
    $(`#${formId} .alfanumerico`).on('input', function() {
        this.value = this.value.replace(/[^A-Za-záéíóúÁÉÍÓÚñÑ0-9\s\-]/g, '');
    });
    
    $(`#${formId} .email`).on('blur', function() {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const isValid = emailRegex.test(this.value) || this.value === '';
        mostrarFeedback(this, isValid, "Por favor ingrese un correo electrónico válido");
    });
}