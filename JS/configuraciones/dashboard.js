document.addEventListener('DOMContentLoaded', function() {
    // Mostrar el contenido principal inmediatamente
    const content = document.querySelector('#content');
    if (content) {
        content.style.opacity = '1';
    }

    // Cargar datos del dashboard
    loadDashboardData();

    // Configuración del tema oscuro/claro
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.documentElement.setAttribute('data-bs-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-bs-theme', 'light');
                localStorage.setItem('theme', 'light');
            }
        });

        // Verificar preferencia de tema guardada
        if (localStorage.getItem('theme') === 'dark') {
            document.documentElement.setAttribute('data-bs-theme', 'dark');
            themeToggle.checked = true;
        }
    }

    // Botones de acciones del gráfico
    const chartButtons = document.querySelectorAll('.chart-actions .btn');
    chartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const range = this.textContent.trim();
            chartButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            loadDashboardData(range);
        });
    });
});

function loadDashboardData(range = '7D') {
    console.log('Cargando datos del dashboard para rango:', range);
    
    // Mostrar indicadores de carga
    $('#mainChart').parent().append('<div class="text-center py-4"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></div>');
    $('.table tbody').html('<tr><td colspan="6" class="text-center py-4"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></td></tr>');

    $.ajax({
        url: '../../Database/configuraciones/dashboard/dashboard.php',
        type: 'GET',
        data: { range: range },
        dataType: 'json',
        success: function(response) {
            console.log('Respuesta completa:', response);
            
            if (response.success && response.data) {
                console.log('Datos recibidos:', response.data);
                updateDashboardCards(response.data);
                
                if (response.data.grafico_semanal) {
                    renderMainChart(response.data.grafico_semanal);
                } else {
                    console.warn('No hay datos para el gráfico semanal');
                    $('#mainChart').parent().html('<p class="text-muted text-center py-4">No hay datos disponibles para el gráfico</p>');
                }
                
                if (response.data.producto_estrella) {
                    renderProductoEstrella(response.data.producto_estrella);
                } else {
                    console.warn('No hay datos para producto estrella');
                    const container = document.querySelector('.col-xl-4.mb-4 .card-body');
                    if (container) {
                        container.innerHTML = '<div class="alert alert-warning">No hay información disponible del producto estrella</div>';
                    }
                }
                
                if (response.data.ordenes_recientes) {
                    renderOrdenesRecientes(response.data.ordenes_recientes);
                } else {
                    console.warn('No hay datos para órdenes recientes');
                    $('.table tbody').html('<tr><td colspan="5" class="text-center py-4">No hay órdenes recientes</td></tr>');
                }
            } else {
                console.error('Error en la respuesta:', response.message);
                showError('Error al cargar datos: ' + (response.message || 'Respuesta inválida del servidor'));
            }
        },
        error: function(xhr, status, error) {
            console.error('Error en la solicitud:', status, error);
            showError('Error de conexión: ' + error);
        },
        complete: function() {
            // Ocultar indicadores de carga
            $('#mainChart').parent().find('.spinner-border').remove();
            $('.table tbody').find('.spinner-border').remove();
        }
    });
}

function showError(message) {
    const errorHtml = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
    
    $('.container-fluid').prepend(errorHtml);
}

function updateDashboardCards(data) {
    try {
        // Actualizar tarjeta de ventas (solo incluye confirmadas)
        if (data.ventas_hoy) {
            $('.sales-card h2').text('$' + (data.ventas_hoy.total || '0.00'));
            $('.sales-card p strong').text((data.ventas_hoy.confirmadas || 0) + ' confirmadas');
        }
        
        // Actualizar tarjeta de órdenes
        if (data.ventas_hoy) {
            // Mostrar solo órdenes confirmadas en el contador principal
            $('.orders-card h2').text(data.ventas_hoy.confirmadas || 0);
        }
        if (data.ordenes_proceso !== undefined) {
            // Mostrar órdenes en proceso (por_confirmar) en el subtítulo
            $('.orders-card p strong').text(data.ordenes_proceso || 0);
            $('.orders-card p i').removeClass('fa-clock').addClass('fa-hourglass-half');
            $('.orders-card p').html('<i class="fas fa-hourglass-half"></i> <strong>' + (data.ordenes_proceso || 0) + '</strong> en proceso');
        }
        
        // Actualizar tarjeta de clientes
        if (data.clientes) {
            $('.customers-card h2').text(data.clientes.total || 0);
            $('.customers-card p strong').text(data.clientes.vip || 0);
        }
        
        // Actualizar tarjeta de productos
        if (data.productos) {
            $('.products-card h2').text(data.productos.total || 0);
            $('.products-card p strong').text(data.productos.categorias || 0);
        }
    } catch (e) {
        console.error('Error actualizando cards:', e);
    }
}

function renderMainChart(chartData) {
    const ctx = document.getElementById('mainChart');
    if (!ctx) {
        console.error('No se encontró el elemento canvas para el gráfico');
        return;
    }

    // Limpiar gráfico anterior si existe
    if (window.mainChart && typeof window.mainChart.destroy === 'function') {
        window.mainChart.destroy();
    }

    // Preparar datos - asegurarnos de tener 7 días
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const today = new Date();
    
    // Crear estructura para los últimos 7 días
    let fullWeekData = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayName = daysOfWeek[date.getDay()];
        const dateStr = date.toISOString().split('T')[0];
        
        // Buscar si tenemos datos para este día
        const dayData = chartData.find(item => item.fecha === dateStr) || {
            dia: dayName,
            fecha: dateStr,
            total_ventas: 0,
            total_pedidos: 0
        };
        
        fullWeekData.push(dayData);
    }

    // Preparar datos para el gráfico
    const labels = fullWeekData.map(item => item.dia);
    const ventasData = fullWeekData.map(item => parseFloat(item.total_ventas));
    
    // Si no hay datos, mostrar mensaje
    if (labels.length === 0) {
        ctx.parentElement.innerHTML = '<p class="text-muted text-center py-4">No hay datos disponibles para el gráfico</p>';
        return;
    }

    // Crear nuevo gráfico
    try {
        window.mainChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ventas ($)',
                    data: ventasData,
                    borderColor: '#ff6b00',
                    backgroundColor: 'rgba(255, 107, 0, 0.1)',
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true,
                    pointBackgroundColor: '#ff6b00',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: {
                                size: 14,
                                family: "'Poppins', sans-serif",
                                weight: '500'
                            },
                            padding: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Ventas: $${context.raw.toFixed(2)}`;
                            }
                        },
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: {
                            size: 14,
                            family: "'Poppins', sans-serif",
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13,
                            family: "'Poppins', sans-serif"
                        },
                        padding: 12,
                        cornerRadius: 8
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            },
                            font: {
                                size: 12,
                                family: "'Poppins', sans-serif"
                            },
                            padding: 10
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 12,
                                family: "'Poppins', sans-serif"
                            },
                            padding: 10
                        },
                        grid: {
                            display: false,
                            drawBorder: false
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error al crear el gráfico:', error);
        ctx.parentElement.innerHTML = '<p class="text-danger text-center py-4">Error al cargar el gráfico</p>';
    }
}

function renderProductoEstrella(producto) {
    const container = document.querySelector('.col-xl-4.mb-4 .card-body');
    if (!container) {
        console.error('No se encontró el contenedor del producto estrella');
        return;
    }

    try {
        container.innerHTML = `
            <div class="burger-of-the-day">
                <img src="${producto.imagen ? `data:image/jpeg;base64,${producto.imagen}` : 
                    'https://via.placeholder.com/250x150/ff6b00/ffffff?text=Sin+imagen'}" 
                    alt="${producto.titulo || 'Producto'}" class="img-fluid">
                <div class="badge-premium">TOP 1</div>
            </div>
            <h3 class="mt-3">${producto.titulo || 'Producto destacado'}</h3>
            <div class="rating mb-2">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star-half-alt"></i>
                <span class="ms-1">4.7</span>
            </div>
            <p class="text-muted">Total vendido esta semana: <strong>${producto.total_vendido || 0}</strong> unidades</p>
        `;
    } catch (e) {
        console.error('Error renderizando producto estrella:', e);
        container.innerHTML = '<div class="alert alert-danger">Error al cargar el producto estrella</div>';
    }
}

function renderOrdenesRecientes(ordenes) {
    const $tbody = $('.table tbody');
    if (!$tbody.length) {
        console.error('No se encontró el tbody para las órdenes');
        return;
    }

    $tbody.empty();

    if (!ordenes || ordenes.length === 0) {
        $tbody.html('<tr><td colspan="5" class="text-center py-4">No hay órdenes recientes</td></tr>');
        return;
    }

    const estadoClases = {
        'confirmado': 'bg-success',
        'por_confirmar': 'bg-warning text-dark',
        'cancelado': 'bg-danger',
        'entregado': 'bg-primary'
    };

    const estadoTextos = {
        'confirmado': 'Confirmado',
        'por_confirmar': 'En proceso',
        'cancelado': 'Cancelado',
        'entregado': 'Entregado'
    };

    const ordenesMostradas = ordenes.slice(0, 5);

    ordenesMostradas.forEach(orden => {
        try {
            const badgeClass = estadoClases[orden.estado] || 'bg-info';
            const estadoTexto = estadoTextos[orden.estado] || 'Desconocido';
            
            let iniciales = 'NN';
            const nombreCliente = orden.cliente || '';
            if (nombreCliente.trim() !== '') {
                const partes = nombreCliente.split(' ').filter(p => p.length > 0);
                if (partes.length >= 2) {
                    iniciales = partes[0][0] + partes[partes.length - 1][0];
                } else if (partes.length === 1) {
                    iniciales = partes[0][0] + (partes[0].length > 1 ? partes[0][1] : '');
                }
                iniciales = iniciales.toUpperCase();
            }
            
            const bgColor = `hsl(${Math.abs(hashCode(nombreCliente) % 360)}, 70%, 60%)`;
            
            $tbody.append(`
                <tr>
                    <td class="align-middle"><strong>#${orden.id || 'N/A'}</strong></td>
                    <td class="align-middle">
                        <div class="avatar-iniciales" style="background-color: ${bgColor}">
                            ${iniciales}
                        </div>
                        ${nombreCliente || 'Cliente no registrado'}
                    </td>
                    <td class="align-middle">${orden.productos || 'Sin productos'}</td>
                    <td class="align-middle">$${parseFloat(orden.precio_total || 0).toFixed(2)}</td>
                    <td class="align-middle"><span class="badge ${badgeClass}">${estadoTexto}</span></td>
                </tr>
            `);
        } catch (e) {
            console.error('Error renderizando orden:', orden, e);
        }
    });
}

// Función auxiliar para generar hash de un string
function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}