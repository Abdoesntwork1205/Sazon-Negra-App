<?php
header('Content-Type: application/json');
require_once('../../Config/conexion.php');

$response = [
    'success' => false,
    'message' => '',
    'data' => [
        'productos' => [],
        'total' => 0,
        'paginas' => 1,
        'mostrandoInicio' => 0,
        'mostrandoFin' => 0
    ]
];

try {
    // Verificar conexión
    if ($conn->connect_error) {
        throw new Exception("Error de conexión: " . $conn->connect_error);
    }

    // Parámetros
    $pagina = isset($_GET['pagina']) ? max(1, intval($_GET['pagina'])) : 1;
    $porPagina = isset($_GET['porPagina']) ? max(1, intval($_GET['porPagina'])) : 8;
    $offset = ($pagina - 1) * $porPagina;
    $categoriaId = isset($_GET['categoria_id']) ? intval($_GET['categoria_id']) : null;

    // 1. Obtener productos más vendidos por categoría
    $sqlTop = "SELECT 
                pm.menu_id AS id,
                m.categoria_id,
                SUM(pm.cantidad) AS total_vendido
              FROM pedidos_menu pm
              JOIN pedidos p ON pm.pedido_id = p.id
              JOIN menu m ON pm.menu_id = m.id
              WHERE p.estado = 'confirmado'
              GROUP BY pm.menu_id, m.categoria_id
              ORDER BY m.categoria_id, total_vendido DESC";
    
    $resultTop = $conn->query($sqlTop);
    if (!$resultTop) {
        throw new Exception("Error en consulta top: " . $conn->error);
    }
    
    $topProductosPorCategoria = [];
    $currentCategory = null;
    $categoryCount = 0;
    
    while ($row = $resultTop->fetch_assoc()) {
        if ($currentCategory != $row['categoria_id']) {
            $currentCategory = $row['categoria_id'];
            $categoryCount = 0;
        }
        
        if ($categoryCount < 3) {
            $topProductosPorCategoria[$row['id']] = true;
            $categoryCount++;
        }
    }

    // 2. Consulta principal de productos
    $query = "SELECT SQL_CALC_FOUND_ROWS 
              m.id, m.titulo as nombre, m.descripcion, m.precio, 
              m.imagen, m.destacado, m.categoria_id,
              c.nombre as categoria_nombre
              FROM menu m
              JOIN categorias c ON m.categoria_id = c.id
              WHERE m.disponible = 1";
    
    if ($categoriaId) {
        $query .= " AND m.categoria_id = $categoriaId";
    }
    
    $query .= " ORDER BY m.destacado DESC, m.titulo ASC
               LIMIT $offset, $porPagina";
    
    $result = $conn->query($query);
    if (!$result) {
        throw new Exception("Error en consulta principal: " . $conn->error);
    }

    // Procesar productos
    $productos = [];
    while ($row = $result->fetch_assoc()) {
        $row['precio'] = floatval($row['precio']);
        $row['imagen'] = $row['imagen'] ? 'data:image/jpeg;base64,' . base64_encode($row['imagen']) : null;
        $row['en_promocion'] = false;
        $row['precio_original'] = $row['precio'];
        $row['descuento'] = 0;
        $row['mas_vendido'] = isset($topProductosPorCategoria[$row['id']]);
        
        // Inicializar array de badges
        $row['badges'] = [];
        
        if ($row['mas_vendido']) {
            $row['badges'][] = [
                'texto' => 'MÁS VENDIDO',
                'clase' => 'bg-warning'
            ];
        }
        
        $productos[] = $row;
    }

    // Obtener el total de productos
    $totalResult = $conn->query("SELECT FOUND_ROWS() as total");
    $total = $totalResult->fetch_assoc()['total'];

    // Obtener promociones activas
    $promociones = [];
    $queryPromociones = "SELECT p.*, 
                        IFNULL(pc.categoria_id, 0) as categoria_id,
                        IFNULL(pm.menu_id, 0) as menu_id
                        FROM promociones p
                        LEFT JOIN promociones_categorias pc ON p.id = pc.promocion_id
                        LEFT JOIN promociones_menu pm ON p.id = pm.promocion_id
                        WHERE p.fecha_inicio <= NOW() AND p.fecha_fin >= NOW()";

    $resultPromociones = $conn->query($queryPromociones);
    if ($resultPromociones) {
        while ($promo = $resultPromociones->fetch_assoc()) {
            $promo['valor_descuento'] = floatval($promo['valor_descuento']);
            $promo['tipo_promocion'] = $promo['menu_id'] ? 'producto' : 'categoria';
            $promociones[] = $promo;
        }
    }

    // Aplicar promociones a los productos
    foreach ($productos as &$producto) {
        foreach ($promociones as $promo) {
            if ($promo['tipo_promocion'] == 'producto' && $promo['menu_id'] == $producto['id']) {
                $producto['en_promocion'] = true;
                $producto['descuento'] = $promo['valor_descuento'];
                $producto['precio'] = $producto['precio'] * (1 - $promo['valor_descuento']/100);
                
                // Añadir badge de promoción
                $producto['badges'][] = [
                    'texto' => '-'.$producto['descuento'].'%',
                    'clase' => 'bg-danger'
                ];
                break;
            } else if ($promo['tipo_promocion'] == 'categoria' && $promo['categoria_id'] == $producto['categoria_id']) {
                $producto['en_promocion'] = true;
                $producto['descuento'] = $promo['valor_descuento'];
                $producto['precio'] = $producto['precio'] * (1 - $promo['valor_descuento']/100);
                
                // Añadir badge de promoción
                $producto['badges'][] = [
                    'texto' => '-'.$producto['descuento'].'%',
                    'clase' => 'bg-danger'
                ];
                break;
            }
        }
        
        // Opción alternativa: Un solo badge combinado cuando ambos aplican
        
        if ($producto['mas_vendido'] && $producto['en_promocion']) {
            $producto['badges'] = [[
                'texto' => 'OFERTA TOP',
                'clase' => 'bg-purple'
            ]];
        }
        
    }

    // Preparar respuesta exitosa
    $response['success'] = true;
    $response['message'] = 'Productos obtenidos correctamente';
    $response['data']['productos'] = $productos;
    $response['data']['total'] = $total;
    $response['data']['paginas'] = ceil($total / $porPagina);
    $response['data']['mostrandoInicio'] = $offset + 1;
    $response['data']['mostrandoFin'] = min($offset + $porPagina, $total);

} catch (Exception $e) {
    error_log("Error en get_productos.php: " . $e->getMessage());
    $response['message'] = 'Error en el servidor: ' . $e->getMessage();
    http_response_code(500);
} finally {
    if (isset($conn)) $conn->close();
    ob_clean();
    echo json_encode($response);
    exit();
}
?>