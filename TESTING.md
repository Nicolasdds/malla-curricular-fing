# Guia de pruebas

## Como ejecutar
1) Abri una terminal en la raiz del repositorio.
2) Instala dependencias si hace falta:
   `npm install`
3) Ejecuta las pruebas:
   `npm test`

## Pruebas incluidas
- `tests/core.test.js`
  - Verifica que los bloques del HTML existan para las materias.
  - Valida que cada asignatura tenga `bloque`, `colClass` y `orden`.
  - Confirma que MD1 este en el primer semestre (`bloque-2`).
- `tests/previas.test.js`
  - Valida reglas de habilitacion (`puedeHabilitar`) con AND/OR.
  - Comprueba que Taller de Programacion se habilite con P4 aprobada.
  - Verifica el helper de relaciones de flechas (`esEdgeRelacionado`).

## Comportamiento esperado
- Si el HTML y los datos no coinciden, `tests/core.test.js` debe fallar.
- Si las reglas de habilitacion no se cumplen, `tests/previas.test.js` debe fallar.
- Las pruebas no requieren navegador ni DOM real.
