<?php
header('Content-Type: application/json');
include '../../Config/conexion.php';

$response = [
    'success' => false,
    'data' => [],
    'message' => 'Error desconocido'
];

try {
    // Verificar conexión
    if ($conn->connect_error) {
        throw new Exception("Error de conexión a la base de datos: " . $conn->connect_error);
    }

    // 1. Primero obtenemos los IDs de los 3 productos más vendidos
    $sqlMasVendidos = "SELECT 
                        pm.menu_id AS id,
                        SUM(pm.cantidad) AS total_vendido
                    FROM pedidos_menu pm
                    JOIN pedidos p ON pm.pedido_id = p.id
                    WHERE p.estado = 'confirmado'
                    GROUP BY pm.menu_id
                    ORDER BY total_vendido DESC
                    LIMIT 3";
    
    $stmtMasVendidos = $conn->prepare($sqlMasVendidos);
    if (!$stmtMasVendidos) {
        throw new Exception("Error al preparar consulta de más vendidos: " . $conn->error);
    }
    
    if (!$stmtMasVendidos->execute()) {
        throw new Exception("Error al ejecutar consulta de más vendidos: " . $stmtMasVendidos->error);
    }
    
    $resultMasVendidos = $stmtMasVendidos->get_result();
    $idsMasVendidos = [];
    
    while ($row = $resultMasVendidos->fetch_assoc()) {
        $idsMasVendidos[] = $row['id'];
    }
    
    // 2. Ahora obtenemos los productos destacados marcando los más vendidos
    $sql = "SELECT 
                m.id, 
                m.titulo AS nombre, 
                m.descripcion, 
                m.precio, 
                m.imagen,
                m.destacado,
                m.disponible,
                m.tiempo_preparacion,
                c.nombre AS categoria,
                CASE WHEN m.id IN (" . (empty($idsMasVendidos) ? '0' : implode(',', $idsMasVendidos)) . ") THEN 1 ELSE 0 END AS mas_vendido
            FROM menu m
            JOIN categorias c ON m.categoria_id = c.id
            LEFT JOIN (
                SELECT DISTINCT pm.menu_id 
                FROM promociones_menu pm
                JOIN promociones p ON pm.promocion_id = p.id
                WHERE p.fecha_inicio <= NOW() AND p.fecha_fin >= NOW()
            ) AS promos ON m.id = promos.menu_id
            LEFT JOIN (
                SELECT DISTINCT pc.categoria_id 
                FROM promociones_categorias pc
                JOIN promociones p ON pc.promocion_id = p.id
                WHERE p.fecha_inicio <= NOW() AND p.fecha_fin >= NOW()
            ) AS promos_cat ON m.categoria_id = promos_cat.categoria_id
            WHERE m.disponible = 1 
            AND m.destacado = 1
            AND promos.menu_id IS NULL
            AND promos_cat.categoria_id IS NULL
            ORDER BY mas_vendido DESC, c.nombre, m.titulo";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conn->error);
    }
    
    if (!$stmt->execute()) {
        throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    if (!$result) {
        throw new Exception("Error al obtener resultados: " . $stmt->error);
    }

    $productos = [];
    while ($row = $result->fetch_assoc()) {
        $productos[] = [
            'id' => $row['id'],
            'nombre' => htmlspecialchars($row['nombre'], ENT_QUOTES, 'UTF-8'),
            'descripcion' => htmlspecialchars($row['descripcion'], ENT_QUOTES, 'UTF-8'),
            'precio' => (float)$row['precio'],
            'categoria' => htmlspecialchars($row['categoria'], ENT_QUOTES, 'UTF-8'),
            'imagen' => !empty($row['imagen']) ? 
                        'data:image/jpeg;base64,' . base64_encode($row['imagen']) : 
                        'img/default-food.jpg',
            'tiempo_preparacion' => $row['tiempo_preparacion'] ?? null,
            'disponible' => (bool)$row['disponible'],
            'destacado' => (bool)$row['destacado'],
            'mas_vendido' => (bool)$row['mas_vendido']
        ];
    }

    $response = [
        'success' => true,
        'data' => $productos,
        'message' => count($productos) . ' productos destacados obtenidos',
        'top_vendidos' => $idsMasVendidos // Para depuración
    ];

} catch (Exception $e) {
    $response['message'] = 'Error en el servidor: ' . $e->getMessage();
    http_response_code(500);
    error_log("Error en obtener_destacados.php: " . $e->getMessage());
} finally {
    if (isset($stmtMasVendidos)) $stmtMasVendidos->close();
    if (isset($stmt)) $stmt->close();
    if (isset($conn)) $conn->close();
    
    while (ob_get_level()) ob_end_clean();
    echo json_encode($response);
    exit();
}
?>