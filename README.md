# Sistema Integral para "El Sazón de la Negra", Local de Comida Rápida en Barinas, Venezuela

🍔 Proyecto Integral: El Sazón de la Negra

¡Bienvenido al repositorio oficial del sistema de gestión para El Sazón de la Negra! Este proyecto nace en el corazón de Barinas, Venezuela, con el objetivo de digitalizar la experiencia de la comida rápida llanera, optimizando desde la toma de pedidos hasta el control de inventario.

----------------------------------------------------------------------------------------------------
📝 Descripción del Proyecto: Este sistema es una solución integral "Full Stack" diseñada para manejar el flujo operativo de un puesto de comida rápida de alto volumen. Combina la rapidez de JavaScript en el cliente, la robustez de PHP en el servidor, y la seguridad avanzada que ofrece Hack (HHVM) para procesos críticos de datos. El software permite gestionar:

Menú Digital: Categorización de hamburguesas, pepitos, perros calientes y bebidas

Gestión de Pedidos: Sistema en tiempo real para cocina y despacho.

Control de Caja: Registro de ventas en Bolívares y Divisas (ajustado a la realidad económica de Venezuela).

Panel Administrativo: Reportes de ventas y gestión de usuarios.

----------------------------------------------------------------------------------------------------
🚀 Tecnologías Utilizadas: El stack tecnológico fue seleccionado para garantizar escalabilidad y un rendimiento óptimo: Capa Tecnología Propósito Frontend HTML5 / CSS Estructura y diseño responsivo adaptado a móviles. Lógica de Cliente JavaScript (ES6+) Interactividad, validaciones y manejo de estados. Backend (Core) PHP 8.x Procesamiento de peticiones y comunicación con la DB.Backend (Seguridad) Hack Implementación de tipos estrictos en módulos de finanzas. Base de Datos MySQL / MariaDB Almacenamiento relacional de productos y ventas.

----------------------------------------------------------------------------------------------------
✨ Características Principales:

1. Interfaz de Usuario (UI) AtractivaDiseño inspirado en los colores de la marca, utilizando CSS avanzado (Flexbox/Grid) para que el personal pueda usar el sistema desde una Tablet o Smartphone sin fricciones.

2. Módulo de Tipos con HackPara evitar errores en el manejo de precios y transacciones, se utilizó Hack, permitiendo una programación tipada que reduce drásticamente los bugs en el cierre de caja.

3. Sistema de Facturación DualConfigurado para calcular automáticamente la tasa del BCV, permitiendo pagos mixtos y facilitando la vida tanto al cliente como al administrador.

----------------------------------------------------------------------------------------------------
🛠️ Instalación y Configuración: Si deseas replicar este entorno localmente, sigue estos pasos:

Clonar el repositorio: Bashgit clone https://github.com/Abdoesntwork1205/Sazon-Negra-App.git

Configurar el servidor: Asegúrate de tener instalado HHVM para el soporte de Hack. Servidor Apache o Nginx con PHP 8.0+.

Base de Datos: Importa el archivo database/schema.sql en tu gestor de MySQL.

Variables de Entorno: Renombra el archivo .env.example a .env y configura tus credenciales de base de datos.

----------------------------------------------------------------------------------------------------
📂 Estructura de Directorios

Plaintext├── assets/             # Imágenes, CSS y Scripts de JS
├── core/               # Lógica en PHP y definiciones en Hack
├── includes/           # Componentes reutilizables (headers, footers)
├── sql/                # Scripts de creación de base de datos
├── views/              # Vistas finales del usuario
└── index.php           # Punto de entrada principal

----------------------------------------------------------------------------------------------------
🇻🇪 Impacto Regional: Este proyecto no es solo código; es una herramienta para potenciar el comercio en Barinas. "El Sazón de la Negra" ahora cuenta con una base sólida para crecer y ofrecer un servicio tecnológico a la altura de su calidad gastronómica.
