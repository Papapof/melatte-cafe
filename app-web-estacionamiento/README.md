# App de Estacionamiento Halcon

Aplicación web para gestionar ingresos y salidas de autos en un estacionamiento, con cálculo de cobros y registro de transacciones.

## Estructura
- `index.html` — interfaz principal.
- `css/` — estilos.
- `js/` — lógica de aplicación y persistencia.

## Modelo de datos
- `Entry` — representa un auto en el estacionamiento:
  - `id`
  - `licensePlate`
  - `entryTime`
  - `vehicleSize`
  - `exitTime`
  - `duration`
  - `charge`
  - `paymentMethod`
  - `receiptNumber`

- `Transaction` — representa un ingreso o retiro extra:
  - `id`
  - `amount`
  - `description`
  - `type` (`ingreso` o `retiro`)
  - `paymentMethod`

## Cómo usar
1. Abre `index.html` en el navegador.
2. Registra autos con placa, hora de entrada y tamaño del vehículo.
3. Actualiza la hora de salida cuando se vaya el auto.
4. Usa el botón "Retiro/Ingreso" para registrar movimientos adicionales.
5. Haz clic en "Guardar Lista" para generar el reporte.

## Notas
- Los datos se guardan en `localStorage`.
- `js/script.js` maneja las tablas de autos y transacciones.
