<div class="container my-4">
    <div class="profile-card card">
        <div class="card-header bg-primary text-white">
            <h5 class="mb-0"><i class="fas fa-user-cog me-2"></i>Mis Datos</h5>
        </div>
        
        <div class="card-body">

            <div id="preloader" class="text-center" style="display: none;">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2">Guardando cambios...</p>
            </div>
            <!-- Ícono de perfil -->
            <div class="text-center mb-4">
                <i class="fas fa-user-circle text-muted" style="font-size: 5rem;"></i>
            </div>

            <form id="user-data-form">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label" for="nombre">Nombre</label>
                        <input type="text" class="form-control" id="nombre" name="nombre" required>
                    </div>
                    
                    <div class="col-md-6 mb-3">
                        <label class="form-label" for="apellido">Apellido</label>
                        <input type="text" class="form-control" id="apellido" name="apellido" required>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-3 mb-3">
                        <label class="form-label" for="perfil_nacionalidad">Nacionalidad</label>
                        <select class="form-select" id="perfil_nacionalidad" name="perfil_nacionalidad" required>
                            <option value="V">V - Venezolano</option>
                            <option value="E">E - Extranjero</option>
                        </select>
                    </div>
                    
                    <div class="col-md-3 mb-3">
                        <label class="form-label" for="perfil_cedula">Cédula</label>
                        <input type="text" class="form-control" id="perfil_cedula" name="perfil_cedula" required readonly>
                        <small class="text-muted">La cedula no puede modificarse</small>
                    </div>
                    
                    <div class="col-md-6 mb-3">
                        <label class="form-label" for="fecha_nacimiento">Fecha de Nacimiento</label>
                        <input type="date" class="form-control" id="fecha_nacimiento" name="fecha_nacimiento">
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label" for="telefono">Teléfono</label>
                        <input type="tel" class="form-control" id="telefono" name="telefono">
                    </div>
                    
                    <div class="col-md-6 mb-3">
                        <label class="form-label" for="perfil_email">Correo Electrónico</label>
                        <input type="email" class="form-control" id="perfil_email" name="perfil_email" required>
                        <small class="text-muted">Ingrese su nuevo correo si desea cambiarlo</small>
                    </div>
                </div>

                <div class="row">
                    <div class="col-12 mb-3">
                        <label class="form-label" for="direccion">Dirección</label>
                        <textarea class="form-control" id="direccion" name="direccion" rows="2"></textarea>
                    </div>
                </div>

                <div class="row mt-4">
                    <div class="col-12">
                        <div class="card border-warning">
                            <div class="card-header bg-warning bg-opacity-10">
                                <h6 class="mb-0"><i class="fas fa-key me-2"></i>Cambiar Contraseña</h6>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label class="form-label" for="clave_actual">Contraseña Actual</label>
                                        <input type="password" class="form-control" id="clave_actual" name="clave_actual">
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label class="form-label" for="clave_nueva">Nueva Contraseña</label>
                                        <input type="password" class="form-control" id="clave_nueva" name="clave_nueva">
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label class="form-label" for="clave_confirmacion">Confirmar Contraseña</label>
                                        <input type="password" class="form-control" id="clave_confirmacion" name="clave_confirmacion">
                                    </div>
                                </div>
                                <small class="text-muted">Dejar en blanco si no desea cambiar la contraseña</small>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row mt-4">
                    <div class="col-12 text-center">
                        <button type="submit" class="btn btn-primary px-4">
                            <i class="fas fa-save me-2"></i>Guardar Cambios
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>