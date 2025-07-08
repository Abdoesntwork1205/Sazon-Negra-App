/**
 * MÓDULO DE DETALLES DE PEDIDO Y VOUCHER
 * - Muestra modal con detalles completos del pedido
 * - Maneja la visualización del voucher de pago
 * - Controla la lógica de repetir pedido
 */
window.generarFacturaPDF = function(orderData, orderId) {
    try {
        // 1. Verificación y carga segura de jsPDF
        let jsPDF;
        
        // Intenta cargar la versión 2.x (modular)
        if (typeof window.jspdf !== 'undefined') {
            jsPDF = window.jspdf.jsPDF;
        } 
        // Intenta cargar la versión 1.x (global)
        else if (typeof window.jsPDF !== 'undefined') {
            jsPDF = window.jsPDF;
        }
        // Si no encuentra ninguna versión
        else {
            const errorMsg = 'La librería jsPDF no está disponible. Por favor, asegúrese de incluir el script en su página.';
            console.error(errorMsg);
            if (typeof showAlert === 'function') {
                showAlert('error', 'Error PDF', errorMsg);
            } else {
                alert(errorMsg);
            }
            return;
        }

        // 2. Inicialización del documento PDF
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Configuración inicial
        const margin = 15; // margen en mm
        let yPos = 20; // posición vertical inicial
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // 3. Encabezado de la factura
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 40, 40);
        doc.text('El Sazón de la Negra', pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;

        doc.setFontSize(14);
        doc.text('FACTURA', pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const fechaEmision = new Date().toLocaleDateString('es-VE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Mostrar ID de pedido
        doc.setTextColor(100, 100, 100);
        doc.text(`Fecha: ${fechaEmision} | Pedido Nro: ${orderId || 'N/A'}`, pageWidth / 2, yPos, { align: 'center' });
        doc.setTextColor(40, 40, 40);
        yPos += 15;

        // 4. Información del cliente
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('DATOS DEL CLIENTE:', margin, yPos);
        yPos += 8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        const clientInfo = [
            `Cédula/ID: ${orderData.client.id || 'No especificado'}`,
            `Nombre: ${orderData.client.name || 'No especificado'}`,
            `Teléfono: ${orderData.client.phone || 'No especificado'}`,
            `Dirección: ${orderData.client.address || 'No especificada'}`
        ];
        
        if (orderData.client.email) {
            clientInfo.push(`Email: ${orderData.client.email}`);
        }

        // Dibujar recuadro para información del cliente
        const clientBoxHeight = clientInfo.length * 7 + 10;
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(248, 248, 248);
        doc.roundedRect(
            margin, yPos - 5, 
            pageWidth - 2 * margin, clientBoxHeight,
            2, 2, 'FD'
        );
        
        clientInfo.forEach((line, index) => {
            const lines = doc.splitTextToSize(line, pageWidth - (2 * margin) - 10);
            doc.text(lines, margin + 5, yPos + (index * 7));
        });
        
        yPos += clientBoxHeight + 10;

        // 5. Tabla de productos
        const colWidths = [
            (pageWidth - 2 * margin) * 0.50, // Producto (50%)
            (pageWidth - 2 * margin) * 0.15, // Cantidad (15%)
            (pageWidth - 2 * margin) * 0.15, // Precio Unit. (15%)
            (pageWidth - 2 * margin) * 0.20  // Total Prod. (20%)
        ];
        
        // Encabezados de la tabla
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(59, 89, 152);
        
        let currentX = margin;
        ['Producto', 'Cant.', 'P. Unit.', 'Total'].forEach((header, i) => {
            doc.rect(currentX, yPos, colWidths[i], 10, 'F');
            doc.text(header, currentX + colWidths[i]/2, yPos + 7, {align: 'center'});
            currentX += colWidths[i];
        });
        
        doc.setTextColor(40, 40, 40);
        yPos += 12;

        // Filas de productos
        doc.setFont('helvetica', 'normal');
        let rowCount = 0;
        
        orderData.products.forEach(product => {
            // Manejo de paginación
            if (yPos > pageHeight - margin - 30) {
                doc.addPage();
                yPos = margin;
                
                // Redibujar encabezados en nueva página
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(255, 255, 255);
                currentX = margin;
                ['Producto', 'Cant.', 'P. Unit.', 'Total'].forEach((header, i) => {
                    doc.rect(currentX, yPos, colWidths[i], 10, 'F');
                    doc.text(header, currentX + colWidths[i]/2, yPos + 7, {align: 'center'});
                    currentX += colWidths[i];
                });
                doc.setTextColor(40, 40, 40);
                yPos += 12;
            }

            // Alternar colores de fila para mejor legibilidad
            if (rowCount % 2 === 0) {
                doc.setFillColor(245, 245, 245);
                doc.rect(margin, yPos - 2, pageWidth - 2 * margin, 10, 'F');
            }
            
            // Nombre del producto (con manejo de múltiples líneas)
            const productLines = doc.splitTextToSize(product.titulo, colWidths[0] - 5);
            const rowHeight = Math.max(productLines.length * 5, 10);
            
            currentX = margin;
            doc.text(productLines, currentX + 2, yPos + (rowHeight/2 - 2));
            currentX += colWidths[0];
            
            // Cantidad
            doc.text(product.quantity.toString(), currentX + colWidths[1]/2, yPos + (rowHeight/2 - 2), {align: 'center'});
            currentX += colWidths[1];
            
            // Precio Unitario
            doc.text(`$${parseFloat(product.precio).toFixed(2)}`, currentX + colWidths[2] - 2, yPos + (rowHeight/2 - 2), {align: 'right'});
            currentX += colWidths[2];
            
            // Total Producto
            doc.text(`$${(product.precio * product.quantity).toFixed(2)}`, currentX + colWidths[3] - 2, yPos + (rowHeight/2 - 2), {align: 'right'});
            
            // Línea divisoria
            doc.setDrawColor(220, 220, 220);
            doc.line(margin, yPos + rowHeight, pageWidth - margin, yPos + rowHeight);
            
            yPos += rowHeight + 2;
            rowCount++;
        });
        
        yPos += 10;

        // 6. Totales
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        
        const totalLabelX = pageWidth - margin - 80;
        const totalValueX = pageWidth - margin - 5;

        // Subtotal
        doc.text('SUBTOTAL:', totalLabelX, yPos, {align: 'right'});
        doc.text(`$${parseFloat(orderData.subtotal).toFixed(2)}`, totalValueX, yPos, {align: 'right'});
        yPos += 7;

        // Costo de envío (si aplica)
        if (orderData.delivery_cost > 0) {
            doc.text('ENVÍO:', totalLabelX, yPos, {align: 'right'});
            doc.text(`$${parseFloat(orderData.delivery_cost).toFixed(2)}`, totalValueX, yPos, {align: 'right'});
            yPos += 7;
        }

        // Total en dólares
        doc.setFontSize(12);
        doc.text('TOTAL (USD):', totalLabelX, yPos, {align: 'right'});
        doc.text(`$${parseFloat(orderData.total).toFixed(2)}`, totalValueX, yPos, {align: 'right'});
        yPos += 7;

        // Total en bolívares (si está disponible)
        if (orderData.total_bs) {
            const formattedBs = new Intl.NumberFormat('es-VE', {
                style: 'decimal',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(orderData.total_bs);
            
            doc.text('TOTAL (Bs):', totalLabelX, yPos, {align: 'right'});
            doc.text(`${formattedBs} Bs`, totalValueX, yPos, {align: 'right'});
            yPos += 7;
        }
        
        yPos += 15;

        // 7. Información de pago
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('DETALLES DEL PAGO:', margin, yPos);
        yPos += 6;
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);

        // Método de pago formateado
        const paymentMethod = orderData.payment.method
            .replace(/_/g, " ")
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
            
        doc.text(`• Método: ${paymentMethod}`, margin, yPos);
        yPos += 5;

        // Referencia de pago
        if (orderData.payment.reference) {
            const refLabel = orderData.payment.method === 'efectivo_internacional' 
                ? "Detalles del pago internacional" 
                : "Referencia/Comprobante";
                
            const referenceLines = doc.splitTextToSize(
                `• ${refLabel}: ${orderData.payment.reference}`, 
                pageWidth - (2 * margin)
            );
            doc.text(referenceLines, margin, yPos);
            yPos += (referenceLines.length * 5) + 2;
        }

        // Estado del pago
        const paymentStatus = orderData.payment.status
            .replace('_', ' ')
            .toUpperCase();
            
        doc.text(`• Estado: ${paymentStatus}`, margin, yPos);
        yPos += 10;

        // 8. Pie de página
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        
        doc.text("¡Gracias por su compra en El Sazón de la Negra!", pageWidth / 2, yPos, {align: 'center'});
        yPos += 5;
        doc.text("Para consultas o reclamos, contacte a nuestro servicio al cliente", pageWidth / 2, yPos, {align: 'center'});
        yPos += 5;
        doc.text("Teléfono: 0412-6749478 | Email: contacto@elsazondelanegra.com", pageWidth / 2, yPos, {align: 'center'});

        // 9. Generar y abrir el PDF de manera segura
        try {
            const pdfOutput = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfOutput);
            
            // Intenta abrir en nueva pestaña
            const newWindow = window.open('', '_blank');
            if (newWindow) {
                newWindow.location.href = pdfUrl;
            } else {
                // Fallback para navegadores con bloqueador de ventanas emergentes
                const link = document.createElement('a');
                link.href = pdfUrl;
                link.target = '_blank';
                link.download = `Factura_${orderId || 'N/A'}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            
            // Limpieza de memoria después de 5 segundos
            setTimeout(() => {
                try {
                    URL.revokeObjectURL(pdfUrl);
                } catch (e) {
                    console.warn('Error al liberar memoria del PDF:', e);
                }
            }, 5000);
            
        } catch (e) {
            console.error('Error al generar el PDF:', e);
            throw new Error('No se pudo generar el documento PDF');
        }

    } catch (error) {
        console.error('Error al generar factura PDF:', error);
        const errorMsg = error.message || 'Ocurrió un error al generar el PDF';
        
        if (typeof showAlert === 'function') {
            showAlert('error', 'Error en factura', errorMsg);
        } else {
            alert('Error: ' + errorMsg);
        }
        
        // Relanzar el error para que pueda ser capturado por el llamador si es necesario
        throw error;
    }
};


const PedidoDetalles = {
  // Inicializar el módulo
  init() {
    this.setupEventListeners();
  },
  
  // Configurar listeners de eventos
  setupEventListeners() {
    // Delegación de eventos para botones de detalles
    $(document).on('click', '.btn-details', (e) => {
      const pedidoId = $(e.currentTarget).data('pedido-id');
      this.mostrarDetallesPedido(pedidoId);
    });
    
    // Evento para ver voucher
    $(document).on('click', '.btn-ver-voucher', (e) => {
      const pedidoId = $(e.currentTarget).data('pedido-id');
      this.mostrarVoucher(pedidoId);
    });
    
    // Evento para descargar voucher
    $(document).on('click', '#descargarVoucher', (e) => {
      const pedidoId = $(e.currentTarget).data('pedido-id');
      this.descargarVoucher(pedidoId);
    });

    // Evento para imprimir factura
    $(document).on('click', '.btn-imprimir-factura', (e) => {
      const pedidoId = $(e.currentTarget).data('pedido-id');
      this.generarFacturaPDFdesdePedidoId(pedidoId);
    });
  },
  
  // Mostrar detalles completos del pedido
  async mostrarDetallesPedido(pedidoId) {
    try {
      // Validar ID del pedido
      if (!pedidoId || isNaN(pedidoId)) {
        throw new Error('ID de pedido no válido');
      }

      // Mostrar loader
      $('#detallesPedidoModal .modal-body').html(`
        <div class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-2">Cargando detalles del pedido #${pedidoId}...</p>
        </div>
      `);
      
      // Mostrar modal
      const modal = new bootstrap.Modal('#detallesPedidoModal');
      modal.show();
      
      // Timeout para evitar esperas infinitas
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Tiempo de espera agotado al cargar los detalles'));
        }, 10000); // 10 segundos
      });
      
      // Obtener datos con manejo de errores individual
      const pedidoPromise = this.obtenerDatosPedido(pedidoId).catch(error => {
        console.error('Error al obtener datos del pedido:', error);
        throw new Error('No se pudieron cargar los datos principales del pedido');
      });
      
      const productosPromise = this.obtenerProductosPedido(pedidoId).catch(error => {
        console.error('Error al obtener productos del pedido:', error);
        throw new Error('No se pudieron cargar los productos del pedido');
      });
      
      // Esperar ambas promesas con timeout
      const [pedidoData, productosData] = await Promise.race([
        Promise.all([pedidoPromise, productosPromise]),
        timeoutPromise
      ]);
      
      this.renderizarDetalles(pedidoData, productosData);
      
    } catch (error) {
      console.error('Error al cargar detalles:', error);
      
      let errorMessage = 'Error desconocido al cargar los detalles';
      if (error.message.includes('Tiempo de espera')) {
        errorMessage = 'El servidor está tardando demasiado en responder';
      } else if (error.message.includes('No se pudieron')) {
        errorMessage = error.message;
      }
      
      $('#detallesPedidoModal .modal-body').html(`
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-triangle me-2"></i>
          ${errorMessage}
          <div class="mt-2">
            <button class="btn btn-sm btn-outline-primary" onclick="PedidoDetalles.mostrarDetallesPedido(${pedidoId})">
              <i class="fas fa-sync-alt me-1"></i> Reintentar
            </button>
          </div>
        </div>
      `);
    }
  },
  
  // Mostrar el voucher de pago
  async mostrarVoucher(pedidoId) {
    try {
      // Validar ID del pedido
      if (!pedidoId || isNaN(pedidoId)) {
        throw new Error('ID de pedido no válido');
      }

      // Mostrar loader
      $('#voucherModal .modal-body').html(`
        <div class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-2">Cargando comprobante de pago...</p>
        </div>
      `);
      
      // Configurar botón de descarga
      $('#descargarVoucher').data('pedido-id', pedidoId);
      
      // Mostrar modal
      const modal = new bootstrap.Modal('#voucherModal');
      modal.show();
      
      // Obtener el voucher
      const response = await $.ajax({
        url: '../Database/historial/obtener_voucher.php',
        type: 'GET',
        dataType: 'json',
        data: { pedido_id: pedidoId },
        timeout: 8000 // 8 segundos de timeout
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Error al obtener el comprobante');
      }
      
      if (!response.voucher) {
        throw new Error('No se encontró comprobante para este pedido');
      }
      
      // Mostrar la imagen del voucher
      $('#voucherModal .modal-body').html(`
        <img src="data:image/jpeg;base64,${response.voucher}" 
             class="img-fluid rounded shadow-sm" 
             alt="Comprobante de pago del pedido #${pedidoId}"
             style="max-height: 70vh;">
      `);
      
    } catch (error) {
      console.error('Error al cargar voucher:', error);
      $('#voucherModal .modal-body').html(`
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-triangle me-2"></i>
          ${error.message || 'Error al cargar el comprobante'}
          <div class="mt-2">
            <button class="btn btn-sm btn-outline-primary" onclick="PedidoDetalles.mostrarVoucher(${pedidoId})">
              <i class="fas fa-sync-alt me-1"></i> Reintentar
            </button>
          </div>
        </div>
      `);
    }
  },
  
  // Descargar el voucher
  async descargarVoucher(pedidoId) {
    try {
      // Obtener el voucher nuevamente para asegurarnos de tener los datos frescos
      const response = await $.ajax({
        url: '../Database/historial/obtener_voucher.php',
        type: 'GET',
        dataType: 'json',
        data: { pedido_id: pedidoId }
      });
      
      if (!response.success || !response.voucher) {
        throw new Error('No se pudo obtener el comprobante para descargar');
      }
      
      // Crear un enlace temporal para descarga
      const link = document.createElement('a');
      link.href = `data:image/jpeg;base64,${response.voucher}`;
      link.download = `comprobante-pedido-${pedidoId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Mostrar notificación de éxito
      this.mostrarToast('Comprobante descargado correctamente', 'success');
      
    } catch (error) {
      console.error('Error al descargar voucher:', error);
      this.mostrarToast('Error al descargar el comprobante', 'danger');
    }
  },
  
  // Obtener datos principales del pedido
  async obtenerDatosPedido(pedidoId) {
    const response = await $.ajax({
      url: '../Database/historial/detalles_pedido.php',
      type: 'GET',
      dataType: 'json',
      data: { action: 'pedido', pedido_id: pedidoId },
      error: (xhr) => {
        throw new Error(`Error ${xhr.status}: ${xhr.statusText}`);
      }
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Error en la respuesta del servidor');
    }
    
    return response.data;
  },
  async obtenerDatosPedidoConCliente(pedidoId) {
    const response = await $.ajax({
      url: '../Database/historial/detalles_pedido.php',
      type: 'GET',
      dataType: 'json',
      data: { action: 'pedidoConCliente', pedido_id: pedidoId },
      error: (xhr) => {
        throw new Error(`Error ${xhr.status}: ${xhr.statusText}`);
      }
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Error en la respuesta del servidor');
    }
    
    return response.data;
  },
  
  // Obtener productos del pedido
  async obtenerProductosPedido(pedidoId) {
    const response = await $.ajax({
      url: '../Database/historial/detalles_pedido.php',
      type: 'GET',
      dataType: 'json',
      data: { action: 'productos', pedido_id: pedidoId },
      error: (xhr) => {
        throw new Error(`Error ${xhr.status}: ${xhr.statusText}`);
      }
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Error en la respuesta del servidor');
    }
    
    return response.data;
  },

  // Generar factura en PDF
async generarFacturaPDFdesdePedidoId(pedidoId) {
  try {
    // Validar ID del pedido
    if (!pedidoId || isNaN(pedidoId)) {
      throw new Error('ID de pedido no válido');
    }

    // Mostrar notificación
    this.mostrarToast('Generando factura PDF...', 'info');

    // Obtener datos del pedido
    const [pedidoData, productosData] = await Promise.all([
      this.obtenerDatosPedidoConCliente(pedidoId),
      this.obtenerProductosPedido(pedidoId)
    ]);

    // Preparar los datos para el PDF
    const datosParaPDF = {
      client: {
        id: pedidoData.cedula || 'N/A',
        name: pedidoData.nombre || 'Cliente no identificado',
        phone: pedidoData.telefono || 'N/A',
        address: pedidoData.direccion || 'N/A'
      },
      products: productosData.map(p => ({
        titulo: p.titulo,
        quantity: p.cantidad,
        precio: p.precio_unitario
      })),
      subtotal: parseFloat(pedidoData.precio_subtotal),
      delivery_cost: pedidoData.delivery === 'si' ? parseFloat(pedidoData.costo_envio) : 0,
      total: parseFloat(pedidoData.precio_total),
      payment: {
        method: pedidoData.metodo_pago || 'no_especificado',
        status: 'por_confirmar',
        reference: pedidoData.referencia_pago || 'N/A'
      }
    };

    console.log(datosParaPDF, pedidoId, pedidoData, productosData, 'PDF DATA')
    // Llamar a la función que genera el PDF
    generarFacturaPDF(datosParaPDF, pedidoId);

  } catch (error) {
    console.error('Error al generar factura:', error);
    this.mostrarToast('Error al generar la factura', 'danger');
  }
},
  
  // Renderizar los detalles en el modal
  renderizarDetalles(pedido, productos) {
    // Validar datos recibidos
    if (!pedido || !productos) {
      throw new Error('Datos incompletos para mostrar el pedido');
    }
    
    const fecha = pedido.fecha_pedido ? new Date(pedido.fecha_pedido).toLocaleString() : 'Fecha no disponible';
    const esDelivery = pedido.delivery === 'si';
    const estado = pedido.estado ? 
      pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1).replace('_', ' ') : 
      'Estado desconocido';
    
    // Botón para ver voucher si existe
const botonVoucher = pedido.tiene_voucher ? `
  <button class="btn btn-sm btn-outline-success btn-ver-voucher" 
          data-pedido-id="${pedido.id}">
    <i class="fas fa-receipt me-1"></i> Ver Comprobante
  </button>
` : '';

// Botón para imprimir factura (siempre visible)
const botonFactura = `
  <button class="btn btn-sm btn-outline-primary btn-imprimir-factura" 
          data-pedido-id="${pedido.id}">
    <i class="fas fa-print me-1"></i> Imprimir Factura
  </button>
`;

// En la sección donde se muestran los botones, modificar para incluir ambos:
const direccionHTML = esDelivery && pedido.direccion ? `
  <div class="mb-3">
    <h6 class="fw-bold">Dirección de entrega</h6>
    <p>${this.escapeHtml(pedido.direccion)}</p>
    ${pedido.latitud && pedido.longitud ? `
      <a href="https://maps.google.com/?q=${pedido.latitud},${pedido.longitud}" 
         target="_blank" class="btn btn-sm btn-outline-primary me-2">
        <i class="fas fa-map-marked-alt me-1"></i> Ver en mapa
      </a>
    ` : ''}
    <div class="mt-2 d-flex gap-2">
      ${botonVoucher}
      ${botonFactura}
    </div>
  </div>
` : `
  <div class="mb-3 d-flex gap-2">
    ${botonVoucher}
    ${botonFactura}
  </div>
`;
    
    const productosHTML = productos.map(producto => `
    <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
        <div>
        <h6 class="mb-1">${producto.cantidad} x ${this.escapeHtml(producto.titulo)}</h6>
        ${producto.notas ? `
            <small class="text-muted">Notas: ${this.escapeHtml(producto.notas)}</small>
        ` : ''}
        </div>
        <div class="text-end">
        <span class="fw-bold">$${(producto.precio_unitario * producto.cantidad).toFixed(2)}</span>
        <div><small class="text-muted">$${producto.precio_unitario.toFixed(2)} c/u</small></div>
        </div>
    </div>
    `).join('');
    
    const html = `
      <div class="row">
        <div class="col-md-6">
          <div class="mb-3">
            <h6 class="fw-bold">Información del pedido</h6>
            <table class="table table-sm">
              <tr>
                <th>Número:</th>
                <td>#${pedido.id || 'N/A'}</td>
              </tr>
              <tr>
                <th>Fecha:</th>
                <td>${fecha}</td>
              </tr>
              <tr>
                <th>Estado:</th>
                <td>
                  <span class="badge ${this.obtenerClaseEstado(pedido.estado)}">
                    ${estado}
                  </span>
                </td>
              </tr>
              <tr>
                <th>Tipo:</th>
                <td>
                  <span class="badge ${esDelivery ? 'bg-primary' : 'bg-secondary'}">
                    ${esDelivery ? 'Delivery' : 'Recogida'}
                  </span>
                </td>
              </tr>
            </table>
          </div>
          ${direccionHTML}
        </div>
        
        <div class="col-md-6">
          <div class="mb-3">
            <h6 class="fw-bold">Productos</h6>
            ${productosHTML || '<p class="text-muted">No se encontraron productos</p>'}
            
            <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
              <h6 class="mb-0">Subtotal:</h6>
              <span class="fw-bold">$${pedido.precio_subtotal || '0.00'}</span>
            </div>
            
            ${esDelivery ? `
              <div class="d-flex justify-content-between align-items-center">
                <h6 class="mb-0">Costo de envío:</h6>
                <span class="fw-bold">$${pedido.costo_envio || '0.00'}</span>
              </div>
            ` : ''}
            
            <div class="d-flex justify-content-between align-items-center mt-2">
              <h5 class="mb-0">Total:</h5>
              <h5 class="mb-0 text-primary">$${pedido.precio_total || '0.00'}</h5>
            </div>
          </div>
          
          <div class="mb-3">
            <h6 class="fw-bold">Método de pago</h6>
            <p>${pedido.metodo_pago ? this.escapeHtml(pedido.metodo_pago) : 'N/A'} - 
               Ref: ${pedido.referencia_pago ? this.escapeHtml(pedido.referencia_pago) : 'N/A'}</p>
            
            ${pedido.notas ? `
              <h6 class="fw-bold">Notas adicionales</h6>
              <p>${this.escapeHtml(pedido.notas)}</p>
            ` : ''}
          </div>
        </div>
      </div>
    `;
    
    $('#detallesPedidoModal .modal-body').html(html);
    $('#detallesPedidoModal .modal-title').text(`Detalles del Pedido #${pedido.id || ''}`);
  },
  
  // Función para escapar HTML
  escapeHtml(unsafe) {
    return unsafe ? 
      unsafe.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;") : '';
  },
  
  // Clases para los estados
  obtenerClaseEstado(estado) {
    if (!estado) return 'bg-secondary';
    
    const clases = {
      'confirmado': 'bg-success',
      'por_confirmar': 'bg-warning text-dark',
      'cancelado': 'bg-danger',
      'en_proceso': 'bg-info',
      'completado': 'bg-success',
      'rechazado': 'bg-danger'
    };
    
    return clases[estado.toLowerCase()] || 'bg-secondary';
  },
  
  // Mostrar notificación toast
  mostrarToast(mensaje, tipo = 'success') {
    const toast = $(`
      <div class="toast align-items-center text-white bg-${tipo} border-0 position-fixed bottom-0 end-0 m-3" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">
            ${mensaje}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `);
    
    $('body').append(toast);
    const toastInstance = new bootstrap.Toast(toast[0]);
    toastInstance.show();
    
    toast.on('hidden.bs.toast', function() {
      toast.remove();
    });
  }
};

// Inicializar cuando el DOM esté listo
$(document).ready(() => {
  PedidoDetalles.init();
});