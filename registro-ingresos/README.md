# Registro Mensual de Ingresos y Retiros

Aplicación web simple para llevar el registro diario de ingresos y retiros, con cálculo automático de totales y exportación a PDF.

## Estructura
- `index.html` — aplicación completa con HTML, CSS y JavaScript en un solo archivo.

## Modelo de datos
Cada registro se guarda en `localStorage` como un objeto con estas propiedades:
- `fecha` — fecha del registro
- `ingreso` — monto ingresado
- `retiroJose` — monto retirado por José
- `retiroAlejandro` — monto retirado por Alejandro
- `motivo` — descripción del movimiento

## Cómo usar
1. Abre `index.html` en el navegador.
2. Agrega registros usando el formulario.
3. El sistema guarda automáticamente los datos en el navegador.
4. Usa "Exportar a PDF" para generar un reporte descargable.

## Notas
- Los datos se guardan localmente en el navegador, no en un servidor.
- El archivo está listo para ser usado como un proyecto web ligero.
