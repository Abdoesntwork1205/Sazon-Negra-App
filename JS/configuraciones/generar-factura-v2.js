/**
 * Genera un PDF de la factura con todos los detalles del pedido
 * @param {object} orderData - Datos completos del pedido
 * @param {string|number} orderId - ID del pedido generado por el servidor
 */
function generarFacturaPDF(orderData, orderId) {
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
        doc.setFillColor(243, 162, 31);
        
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
                doc.setFillColor(243, 162, 31);
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

    
}

