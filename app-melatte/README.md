# Cafetería Me Latte - Registro de Ventas

Aplicación web para una cafetería que registra ventas diarias, permite editar datos en la tabla y exportar el reporte a PDF.

## Estructura
- `index.html` — interfaz de usuario y conexión con `js/script.js`.
- `css/` — estilos de pantalla.
- `js/` — lógica de aplicación y persistencia.

## Modelo de datos
Cada venta se representa como un objeto `Sale` con:
- `id` — identificador único generado por `crypto.randomUUID()`.
- `product` — nombre del producto vendido.
- `paymentMethod` — método de pago (`efectivo`, `transferencia`, `consumo personal`).
- `price` — precio de venta.
- `employee` — encargado que registró la venta.

## Cómo usar
1. Abre `index.html` en un navegador.
2. Completa los campos del formulario y haz clic en "Añadir Venta".
3. Las ventas se guardan automáticamente en `localStorage`.
4. Haz clic en "Guardar en PDF" para descargar el reporte.

## Notas
- El proyecto está pensado como demo de registro de ventas con persistencia local.
- La lógica central está en `js/script.js`, donde se maneja la UI y el almacenamiento.
