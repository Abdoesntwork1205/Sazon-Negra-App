<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperación de Contraseña</title>
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
    <link rel="stylesheet" href="../../CSS/Login/recuperacion.css">
</head>
<body>
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
                        <h2 class="center-align mb-4">Recuperar Contraseña</h2>
                        
                        <!-- Paso 1: Ingresar email -->
                        <div id="step1">
                            <p class="center-align mb-4">Ingresa tu correo electrónico registrado</p>
                            <form id="emailForm">
                                <div class="input-field col s12">
                                    <i class="material-icons prefix">email</i>
                                    <input id="recovery_email" name="recovery_email" type="email" class="validate" required autocomplete="off">
                                    <label for="recovery_email">Correo Electrónico</label>
                                    <div id="emailError" class="red-text mt-2" style="display: none;"></div>
                                </div>
                                
                                <div class="center-align">
                                    <button type="submit" class="btn waves-effect waves-light purple darken-3">Enviar Código</button>
                                </div>
                            </form>
                        </div>
                        
                        <!-- Paso 2: Ingresar código -->
                        <div id="step2" style="display: none;">
                            <p class="center-align mb-4">Hemos enviado un código a <span id="emailDisplay" class="fw-bold"></span></p>
                            <form id="codeForm">
                                <div class="input-field col s12">
                                    <i class="material-icons prefix">vpn_key</i>
                                    <input id="recovery_code" name="recovery_code" type="text" class="validate" required autocomplete="off" maxlength="6">
                                    <label for="recovery_code">Código de Recuperación</label>
                                    <div id="codeError" class="red-text mt-2" style="display: none;"></div>
                                </div>
                                
                                <div class="center-align">
                                    <button type="button" id="backToEmail" class="btn white waves-effect waves-light">Cambiar Correo</button>
                                    <button type="submit" class="btn waves-effect waves-light purple darken-3">Verificar Código</button>
                                </div>
                            </form>
                        </div>
                        
                        <!-- Paso 3: Nueva contraseña -->
                        <div id="step3" style="display: none;">
                            <p class="center-align mb-4">Crea una nueva contraseña para tu cuenta</p>
                            <form id="passwordForm">
                                <div class="input-field col s12 password-wrapper">
                                    <i class="material-icons prefix">lock</i>
                                    <input id="new_password" name="new_password" type="password" class="validate" required autocomplete="new-password">
                                    <label for="new_password">Nueva Contraseña</label>
                                    <small class="grey-text">La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números.</small>
                                </div>
                                
                                <div class="input-field col s12 password-wrapper">
                                    <i class="material-icons prefix">lock_outline</i>
                                    <input id="confirm_new_password" name="confirm_new_password" type="password" class="validate" required autocomplete="new-password">
                                    <label for="confirm_new_password">Confirmar Nueva Contraseña</label>
                                    <div id="passwordError" class="red-text mt-2" style="display: none;"></div>
                                </div>
                                
                                <div class="center-align">
                                    <button type="button" id="backToCode" class="btn waves-effect waves-light grey darken-3">Volver</button>
                                    <button type="submit" class="btn waves-effect waves-light purple darken-3">Cambiar Contraseña</button>
                                </div>
                            </form>
                        </div>
                        
                        <!-- Mensaje de éxito -->
                        <div id="successMessage" class="center-align" style="display: none;">
                            <div class="mb-3">
                                <i class="material-icons large green-text">check_circle</i>
                            </div>
                            <h4 class="mb-3">¡Contraseña actualizada!</h4>
                            <p>Tu contraseña ha sido cambiada exitosamente.</p>
                            <a href="login.php" class="btn waves-effect waves-light purple darken-3">Iniciar Sesión</a>
                        </div>
                        
                        <div class="center-align mt-3">
                            <p>¿Recordaste tu contraseña? <a href="login.php" class="teal-text text-accent-4">Inicia Sesión</a></p>
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
    <!-- Script personalizado para recuperación -->
    <script src="../../JS/auth/recuperacion.js"></script>
</body>
</html>