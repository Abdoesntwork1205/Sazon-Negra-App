<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- SweetAlert2 -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <link rel="stylesheet" href="../../CSS/Login/login.css">
</head>
<body>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-6 col-lg-4">
                <div class="text-center mb-4">
                    <img src="../../logoi.png" alt="Logo" id="login-icon">
                </div>
                
                <div class="login-container">
                    <div class="login-form">
                        <h2 class="text-center mb-4">Iniciar Sesión</h2>
                        <form id="loginForm">
                            <div class="mb-3">
                                <label for="email" class="form-label">Correo</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="fas fa-user"></i></span>
                                    <input type="text" class="form-control" id="email" name="email" placeholder="Ingrese su correo" required>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="clave" class="form-label">Contraseña</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="fas fa-lock"></i></span>
                                    <input type="password" class="form-control" id="clave" name="clave" placeholder="Ingrese su contraseña" required>
                                  
                                    </span>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary w-100">Ingresar</button>
                        </form>

                        <div class="text-center mt-3">
                            <a href="registro.php" class="text-decoration-none">Registrarse</a>
                        </div>
                        <div class="text-center mt-3">
                            <a href="recuperacion.php" class="text-decoration-none">¿Olvidaste tu contraseña?</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Nuestro JS -->
    <script src="../../JS/auth/login.js"></script>
</body>
</html>