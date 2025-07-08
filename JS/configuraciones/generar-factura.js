// Archivo: generarFactura.js

/**
 * Genera un PDF de la factura y lo abre en una nueva pestaña.
 * @param {object} datosPedido - El objeto orderData con la información del pedido.
 * @param {string|number} orderId - El ID del pedido asignado por el servidor.
 */
function generarFacturaPDF(datosPedido, orderId) {
    try {
        if (typeof jsPDF === 'undefined' && typeof window.jspdf === 'undefined') {
            console.error('La librería jsPDF no está disponible.');
            if (typeof showAlert === 'function') {
                showAlert('error', 'Error PDF', 'Librería PDF no cargada.');
            } else {
                alert('Error: La librería para generar PDF no está disponible.');
            }
            return;
        }

        let doc;
        if (typeof window.jspdf !== 'undefined' && typeof window.jspdf.jsPDF === 'function') {
            const { jsPDF: JSPDF } = window.jspdf;
            doc = new JSPDF();
        } else if (typeof jsPDF === 'function') {
            doc = new jsPDF();
        } else {
            console.error('No se pudo instanciar jsPDF.');
            if (typeof showAlert === 'function') {
                showAlert('error', 'Error PDF', 'No se pudo inicializar librería PDF.');
            } else {
                alert('Error: No se pudo inicializar la librería PDF.');
            }
            return;
        }

        const margin = 15;
        let yPos = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Encabezado
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('El Sazón de la Negra', pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;

        doc.setFontSize(14);
        doc.text('FACTURA', pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const fechaEmision = new Date().toLocaleDateString('es-VE');
        doc.text(`Fecha: ${fechaEmision} | Pedido Nro: ${orderId || 'N/A'}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;

        // Información del cliente
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('DATOS DEL CLIENTE:', margin, yPos);
        yPos += 8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const clientData = [
            `Cédula/ID: ${datosPedido.client.id}`,
            `Nombre: ${datosPedido.client.name}`,
            `Teléfono: ${datosPedido.client.phone}`,
            `Dirección: ${datosPedido.client.address || 'No especificada'}`
        ];
        if(datosPedido.client.email) clientData.push(`Email: ${datosPedido.client.email}`);

        clientData.forEach(line => {
            if (yPos > pageHeight - margin - 10) {
                doc.addPage();
                yPos = margin;
            }
            const lines = doc.splitTextToSize(line, pageWidth - (2 * margin));
            doc.text(lines, margin, yPos);
            yPos += (lines.length * 5) + 2;
        });
        yPos += 5;

        // Tabla de productos
        doc.setFont('helvetica', 'bold');
        const headers = ['Producto', 'Cant.', 'P. Unit.', 'Total Prod.'];
        const colWidths = [ (pageWidth - 2 * margin) * 0.50, (pageWidth - 2 * margin) * 0.10, (pageWidth - 2 * margin) * 0.20, (pageWidth - 2 * margin) * 0.20];
        let currentX = margin;

        headers.forEach((header, i) => {
            doc.text(header, currentX + 2, yPos);
            currentX += colWidths[i];
        });
        yPos += 7;
        doc.setLineWidth(0.3);
        doc.line(margin, yPos - 2, pageWidth - margin, yPos - 2);
        yPos += 2;

        doc.setFont('helvetica', 'normal');
        datosPedido.products.forEach(product => {
            const productTitle = product.titulo;
            const quantity = product.quantity.toString();
            const unitPrice = `$${parseFloat(product.precio).toFixed(2)}`;
            const totalProductPrice = `$${(parseFloat(product.precio) * product.quantity).toFixed(2)}`;

            const titleLines = doc.splitTextToSize(productTitle, colWidths[0] - 4);
            const rowHeight = titleLines.length * 5;

            if (yPos + rowHeight > pageHeight - margin - 30) {
                doc.addPage();
                yPos = margin;
                currentX = margin;
                doc.setFont('helvetica', 'bold');
                headers.forEach((header, i) => { doc.text(header, currentX + 2, yPos); currentX += colWidths[i]; });
                yPos += 7;
                doc.line(margin, yPos - 2, pageWidth - margin, yPos - 2);
                yPos += 2;
                doc.setFont('helvetica', 'normal');
            }

            currentX = margin;
            doc.text(titleLines, currentX + 2, yPos);
            currentX += colWidths[0];
            doc.text(quantity, currentX + 2, yPos, {align: 'center', maxWidth: colWidths[1] - 4});
            currentX += colWidths[1];
            doc.text(unitPrice, currentX + colWidths[2] -2 , yPos, {align: 'right', maxWidth: colWidths[2] - 4});
            currentX += colWidths[2];
            doc.text(totalProductPrice, currentX + colWidths[3] -2, yPos, {align: 'right', maxWidth: colWidths[3] - 4});

            yPos += rowHeight + 3;
        });
        yPos += 5;

        // Totales
        const totalLabelX = pageWidth - margin - 80;
        const totalValueX = pageWidth - margin - 5;

        doc.setFont('helvetica', 'bold');
        doc.text('SUBTOTAL:', totalLabelX, yPos, {align: 'right'});
        doc.text(`$${parseFloat(datosPedido.subtotal).toFixed(2)}`, totalValueX, yPos, {align: 'right'});
        yPos += 7;

        if (datosPedido.delivery_cost > 0) {
            doc.text('ENVÍO:', totalLabelX, yPos, {align: 'right'});
            doc.text(`$${parseFloat(datosPedido.delivery_cost).toFixed(2)}`, totalValueX, yPos, {align: 'right'});
            yPos += 7;
        }

        doc.setFontSize(12);
        doc.text('TOTAL A PAGAR:', totalLabelX, yPos, {align: 'right'});
        doc.text(`$${parseFloat(datosPedido.total).toFixed(2)}`, totalValueX, yPos, {align: 'right'});
        yPos += 7;

        // MONTO EN BOLÍVARES - AJUSTE SOLICITADO (se mantiene el mismo diseño)
        doc.text('TOTAL EN Bs:', totalLabelX, yPos, {align: 'right'});
        doc.text(`Bs. ${parseFloat(datosPedido.total_bs).toFixed(2)}`, totalValueX, yPos, {align: 'right'});
        yPos += 15;

        // Método de pago
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('DETALLES DEL PAGO:', margin, yPos);
        yPos += 6;
        doc.setFont('helvetica', 'normal');

        let paymentMethodDisplay = datosPedido.payment.method.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
        doc.text(`Método: ${paymentMethodDisplay}`, margin, yPos);
        yPos += 5;

        if (datosPedido.payment.reference) {
            const refLabel = (datosPedido.payment.method === 'efectivo_internacional') ? "Detalles Pago Int." : "Ref./Autorización";
            const referenceLines = doc.splitTextToSize(`${refLabel}: ${datosPedido.payment.reference}`, pageWidth - (2*margin));
            doc.text(referenceLines, margin, yPos);
            yPos += (referenceLines.length * 5) + 2;
        }

        doc.text(`Estado del Pago: ${datosPedido.payment.status.replace('_', ' ').toUpperCase()}`, margin, yPos);
        yPos += 10;

        // Mensaje de agradecimiento
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.text("¡Gracias por su compra en El Sazón de la Negra!", pageWidth / 2, yPos, {align: 'center'});

        // Generar y abrir PDF
        const pdfOutput = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfOutput);
        window.open(pdfUrl, '_blank');

    } catch (error) {
        console.error('Error en generarFacturaPDF:', error);
        if (typeof showAlert === 'function') {
            showAlert('error', 'Error al generar factura', error.message || 'No se pudo crear el PDF.');
        } else {
            alert('Error al generar la factura en PDF: ' + (error.message || 'Ocurrió un error desconocido.'));
        }
    }
}