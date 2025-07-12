<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro de Usuario</title>
    <!-- Materialize CSS -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <!-- Material Icons -->
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Sweetalert2 CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">
    <!-- CSS personalizado -->
    <link rel="stylesheet" href="../../CSS/Login/registro.css">
</head>
<body>
    <div class='background-image'></div>
    <div class="container">
        <div class="row">
            <div class="col s12 m8 l6 offset-m2 offset-l3">
                <!-- Icono centrado arriba del formulario -->
                <div class="center-align mb-4">
                    <img src="../../logoi.png" alt="Logo" id="login-icon" class="responsive-img">
                </div>
                
                <!-- Contenedor animado -->
                <div class="login-container">
                    <!-- Formulario con efecto sombreado -->
                    <div class="login-form">
                        <h2 class="center-align mb-4">Crear Cuenta</h2>
                        <form id="registerForm" novalidate autocomplete="off">
                            <div class="row">
                                <div class="input-field col s12 m6">
                                    <i class="material-icons prefix">person</i>
                                    <input id="nombre" name="nombre" type="text" class="validate" required 
                                           pattern="[A-Za-záéíóúÁÉÍÓÚñÑ\s]{2,50}" autocomplete="new-password">
                                    <label for="nombre">Nombre</label>
                                    <span class="helper-text" data-error="Ingrese un nombre válido (2-50 letras)"></span>
                                </div>
                                <div class="input-field col s12 m6">
                                    <i class="material-icons prefix">person_outline</i>
                                    <input id="apellido" name="apellido" type="text" class="validate" required
                                           pattern="[A-Za-záéíóúÁÉÍÓÚñÑ\s]{2,50}" autocomplete="new-password">
                                    <label for="apellido">Apellido</label>
                                    <span class="helper-text" data-error="Ingrese un apellido válido (2-50 letras)"></span>
                                </div>
                            </div>

                            <!-- Nuevos campos para cédula y nacionalidad -->
                            <div class="row">
                                <div class="input-field col s12 m3">
                                    <i class="material-icons prefix">badge</i>
                                    <select id="nacionalidad" name="nacionalidad" class="validate" required>
                                        <option value="V">V</option>
                                        <option value="E">E</option>
                                    </select>
                                    <label>Nacionalidad</label>
                                </div>
                                <div class="input-field col s12 m9">
                                    <input id="cedula" name="cedula" type="number" class="validate" required
                                           pattern="[0-9]{6,8}" title="Entre 6 y 8 dígitos" autocomplete="new-password">
                                    <label for="cedula">Cédula</label>
                                    <span class="helper-text" data-error="Ingrese una cédula válida (6-8 dígitos)"></span>
                                </div>
                            </div>
                            
                            <div class="input-field col s12">
                                <i class="material-icons prefix">phone</i>
                                <input id="telefono" name="telefono" type="tel" class="validate" required
                                       pattern="^(0412|0414|0416|0424)[0-9]{7}$" autocomplete="new-password">
                                <label for="telefono">Teléfono (Ej: 04121234567)</label>
                                <span class="helper-text" data-error="Debe comenzar con 0412, 0414, 0416 o 0424 y tener 11 dígitos"></span>
                            </div>
                            
                            <div class="input-field col s12">
                                <i class="material-icons prefix">date_range</i>
                                <input type="text" id="nacimiento" name="nacimiento" class="datepicker validate" required autocomplete="off">
                                <label for="nacimiento">Fecha de Nacimiento</label>
                                <span class="helper-text" data-error="Debes tener al menos 16 años"></span>
                            </div>
                            
                            <div class="input-field col s12">
                                <i class="material-icons prefix">location_on</i>
                                <input id="direccion" name="direccion" type="text" class="validate" required
                                       minlength="5" maxlength="100" autocomplete="new-password">
                                <label for="direccion">Dirección</label>
                                <span class="helper-text" data-error="Ingrese una dirección válida (5-100 caracteres)"></span>
                            </div>
                            
                            <div class="input-field col s12">
                                <i class="material-icons prefix">email</i>
                                <input id="email" name="email" type="email" class="validate" required autocomplete="off">
                                <label for="email">Correo Electrónico</label>
                                <span class="helper-text" data-error="Ingrese un correo electrónico válido"></span>
                            </div>
                            
                            <div class="input-field col s12 password-wrapper">
                                <i class="material-icons prefix">lock</i>
                                <input id="password" name="password" type="password" class="validate" required
                                       minlength="8" pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$" autocomplete="new-password">
                                <label for="password">Contraseña</label>
                                <span class="helper-text" data-error="Mínimo 8 caracteres, incluyendo mayúsculas, minúsculas y números"></span>
                                <a class="btn-flat waves-effect waves-teal toggle-password">
                                    <i class="material-icons">remove_red_eye</i>
                                </a>
                            </div>
                            
                            <div class="input-field col s12 password-wrapper">
                                <i class="material-icons prefix">lock_outline</i>
                                <input id="confirm_password" type="password" class="validate" required autocomplete="new-password">
                                <label for="confirm_password">Confirmar Contraseña</label>
                                <span class="helper-text" data-error="Las contraseñas no coinciden"></span>
                                <a class="btn-flat waves-effect waves-teal toggle-confirm-password">
                                    <i class="material-icons">remove_red_eye</i>
                                </a>
                            </div>
                            
                            <div class="center-align">
                                <button type="submit" class="btn waves-effect waves-light purple darken-3">Registrarse</button>
                            </div>
                        </form>
                        
                        <div class="center-align mt-3">
                            <p>¿Ya tienes una cuenta? <a href="login.php" class="text-decoration-none">Inicia Sesión</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <!-- Materialize JS -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
    <!-- Sweetalert2 JS -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <!-- Script personalizado para el registro -->
    <script src="../../JS/auth/registro.js"></script>
    

</body>
</html>