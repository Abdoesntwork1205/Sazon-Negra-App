(function() {
        'use strict';
        
        // Seleccionar el formulario
        const form = document.querySelector('#content');
        
        // Validación en tiempo real para la cédula (solo números)
        const clientIdInput = document.getElementById('clientId');
        if (clientIdInput) {
            clientIdInput.addEventListener('input', function() {
                // Remover cualquier caracter que no sea número
                this.value = this.value.replace(/[^0-9]/g, '');
                
                // Validar longitud
                if (this.value.length < 7 || this.value.length > 10) {
                    this.setCustomValidity('La cédula debe tener entre 7 y 10 dígitos');
                } else {
                    this.setCustomValidity('');
                }
            });
        }
        
        // Validación en tiempo real para el teléfono (solo números)
        const clientPhoneInput = document.getElementById('clientPhone');
        if (clientPhoneInput) {
            clientPhoneInput.addEventListener('input', function() {
                // Remover cualquier caracter que no sea número
                this.value = this.value.replace(/[^0-9]/g, '');
                
                // Validar longitud
                if (this.value.length < 7 || this.value.length > 20) {
                    this.setCustomValidity('El teléfono debe tener entre 7 y 20 dígitos');
                } else {
                    this.setCustomValidity('');
                }
            });
        }
        
        // Validación en tiempo real para el nombre (solo letras y espacios)
        const clientNameInput = document.getElementById('clientName');
        if (clientNameInput) {
            clientNameInput.addEventListener('input', function() {
                // Permitir solo letras, espacios y caracteres especiales en español
                this.value = this.value.replace(/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/g, '');
            });
        }
        
        // Validación en tiempo real para el correo (debe contener @)
        const clientEmailInput = document.getElementById('clientEmail');
        if (clientEmailInput) {
            clientEmailInput.addEventListener('input', function() {
                if (!this.value.includes('@')) {
                    this.setCustomValidity('El correo debe contener @');
                } else {
                    this.setCustomValidity('');
                }
            });
        }
        
        // Validación del formulario al enviar
        document.getElementById('confirmOrderBtn').addEventListener('click', function(e) {
            // Verificar si el formulario es válido
            const forms = document.querySelectorAll('.needs-validation');
            
            let isValid = true;
            Array.from(forms).forEach(form => {
                if (!form.checkValidity()) {
                    isValid = false;
                    form.classList.add('was-validated');
                }
            });
            
            // Si no es válido, prevenir el envío
            if (!isValid) {
                e.preventDefault();
                e.stopPropagation();
                
                // Mostrar mensaje de error
                Swal.fire({
                    icon: 'error',
                    title: 'Error en el formulario',
                    text: 'Por favor complete todos los campos correctamente',
                });
            } else {
                // Si es válido, mostrar el modal de confirmación
                $('#confirmOrderModal').modal('show');
            }
        });
    })();