<?php
header('Content-Type: application/json');
require_once('../../../Config/conexion.php');

// Habilitar reporte de errores para depuración
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Verificar conexión
if ($conn->connect_error) {
    die(json_encode([
        'success' => false,
        'message' => 'Error de conexión a la base de datos: ' . $conn->connect_error
    ]));
}

try {
    // Inicializar estadísticas
    $stats = [
        'ventas_hoy' => ['total' => '0.00', 'ordenes' => 0, 'confirmadas' => 0],
        'ordenes_proceso' => 0,
        'clientes' => ['total' => 0, 'vip' => 0],
        'productos' => ['total' => 0, 'categorias' => 0],
        'producto_estrella' => null,
        'grafico_semanal' => [],
        'ordenes_recientes' => []
    ];

    // 1. Ventas Hoy
    $query = "SELECT 
                COALESCE(SUM(CASE WHEN DATE(fecha_pedido) = CURDATE() THEN precio_total ELSE 0 END), 0) as ventas_hoy,
                COUNT(CASE WHEN DATE(fecha_pedido) = CURDATE() THEN 1 ELSE NULL END) as ordenes_hoy,
                COUNT(CASE WHEN DATE(fecha_pedido) = CURDATE() AND estado = 'confirmado' THEN 1 ELSE NULL END) as ordenes_confirmadas
              FROM pedidos";
    $result = $conn->query($query);
    if ($result) {
        $row = $result->fetch_assoc();
        $stats['ventas_hoy'] = [
            'total' => number_format($row['ventas_hoy'], 2),
            'ordenes' => (int)$row['ordenes_hoy'],
            'confirmadas' => (int)$row['ordenes_confirmadas']
        ];
    }

    // 2. Órdenes en proceso
    $query = "SELECT COUNT(*) as en_proceso FROM pedidos WHERE estado = 'por_confirmar'";
    $result = $conn->query($query);
    if ($result) {
        $stats['ordenes_proceso'] = (int)$result->fetch_assoc()['en_proceso'];
    }

    // 3. Clientes
    $query = "SELECT 
                COUNT(*) as total_clientes,
                SUM(CASE WHEN puntos_acumulados > 100 THEN 1 ELSE 0 END) as clientes_vip
              FROM usuarios_clientes";
    $result = $conn->query($query);
    if ($result) {
        $row = $result->fetch_assoc();
        $stats['clientes'] = [
            'total' => (int)$row['total_clientes'],
            'vip' => (int)$row['clientes_vip']
        ];
    }

    // 4. Productos
    $query = "SELECT 
                COUNT(*) as total_productos,
                COUNT(DISTINCT categoria_id) as categorias
              FROM menu 
              WHERE disponible = 1";
    $result = $conn->query($query);
    if ($result) {
        $row = $result->fetch_assoc();
        $stats['productos'] = [
            'total' => (int)$row['total_productos'],
            'categorias' => (int)$row['categorias']
        ];
    }

    // 5. Producto estrella
    $query = "SELECT 
                m.id, m.titulo, m.precio, m.imagen,
                SUM(pm.cantidad) as total_vendido
              FROM pedidos_menu pm
              JOIN menu m ON pm.menu_id = m.id
              JOIN pedidos p ON pm.pedido_id = p.id
              WHERE p.estado = 'confirmado'
              AND p.fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
              GROUP BY m.id
              ORDER BY total_vendido DESC
              LIMIT 1";
    $result = $conn->query($query);
    if ($result && $result->num_rows > 0) {
        $producto = $result->fetch_assoc();
        if (!empty($producto['imagen'])) {
            $producto['imagen'] = base64_encode($producto['imagen']);
        }
        $stats['producto_estrella'] = $producto;
    }

    // 6. Gráfico semanal
    $query = "SELECT 
                DAYNAME(fecha_pedido) as dia,
                DATE(fecha_pedido) as fecha,
                COALESCE(SUM(precio_total), 0) as total_ventas,
                COUNT(*) as total_pedidos
              FROM pedidos
              WHERE estado = 'confirmado'
              AND fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
              GROUP BY DATE(fecha_pedido), dia
              ORDER BY fecha";
    $result = $conn->query($query);
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $stats['grafico_semanal'][] = $row;
        }
    }

    // 7. Órdenes recientes
    $query = "SELECT 
                p.id, p.precio_total, p.estado, p.fecha_pedido,
                CONCAT(COALESCE(uc.nombre, ''), ' ', COALESCE(uc.apellido, '')) as cliente
              FROM pedidos p
              LEFT JOIN usuarios_clientes uc ON p.id_cliente = uc.id
              WHERE p.estado = 'confirmado'
              ORDER BY p.fecha_pedido DESC
              LIMIT 5";
    $result = $conn->query($query);
    if ($result) {
        while ($order = $result->fetch_assoc()) {
            // Obtener productos
            $products = [];
            $stmt = $conn->prepare("SELECT m.titulo 
                                   FROM pedidos_menu pm
                                   JOIN menu m ON pm.menu_id = m.id
                                   WHERE pm.pedido_id = ?
                                   LIMIT 3");
            $stmt->bind_param('i', $order['id']);
            $stmt->execute();
            $productResult = $stmt->get_result();
            while ($product = $productResult->fetch_assoc()) {
                $products[] = $product['titulo'];
            }
            $order['productos'] = implode(', ', $products);
            $stats['ordenes_recientes'][] = $order;
        }
    }

    echo json_encode([
        'success' => true,
        'data' => $stats
    ], JSON_NUMERIC_CHECK);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener datos: ' . $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
} finally {
    $conn->close();
}
?>