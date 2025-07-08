class TasaCambio {
    constructor() {
        this.tasas = {
            USD: 1.0,
            VES: 50.0 // Valor por defecto
        };
        this.ultimaActualizacion = null;
        this.cargarTasas();
        
        // Actualizar cada hora (3600000 ms)
        setInterval(() => this.cargarTasas(), 3600000);
    }

    async cargarTasas() {
        try {
            const response = await $.ajax({
                url: '../../Database/configuraciones/tasas/traer_tasas.php',
                method: 'GET',
                dataType: 'json',
                cache: false // Evitar caché del navegador
            });

            if(response.success) {
                this.tasas = {
                    USD: 1.0, // Siempre 1:1
                    VES: parseFloat(response.VES) || 100.0 // Valor actual o por defecto
                };
                this.ultimaActualizacion = response.last_updated;
                console.log('Tasas actualizadas:', this.tasas);
                
                // Actualizar el monto en Bs automáticamente
                if (typeof updateBsAmount === 'function') {
                    updateBsAmount();
                }
            } else {
                this.establecerTasasPorDefecto();
                console.warn('Usando tasas por defecto');
            }
        } catch (error) {
            console.error("Error al cargar tasas:", error);
            this.establecerTasasPorDefecto();
        }
    }

    establecerTasasPorDefecto() {
        this.tasas = {
            USD: 1.0,
            VES: 100.0
        };
    }

    convertir(monto, deMoneda, aMoneda) {
        if(deMoneda === aMoneda) return monto;
        // Convertir a USD primero
        const enUsd = monto / this.tasas[deMoneda];
        // Convertir a moneda destino
        return enUsd * this.tasas[aMoneda];
    }

    getTasa(deMoneda, aMoneda) {
        if(deMoneda === aMoneda) return 1;
        return this.tasas[aMoneda] / this.tasas[deMoneda];
    }
}

// Crear instancia global
window.tasaCambio = new TasaCambio();