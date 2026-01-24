# Guia de migracion a otra carrera

Esta guia explica como reutilizar el proyecto como template para otra carrera cambiando solo datos y contenido.

## Objetivo
Reemplazar la malla, previas y textos sin tocar la logica principal.

## Archivos clave a editar
- `assets/data/asignaturas.json`: materias, creditos, previas, bloques y orden.
- `assets/data/textos.json`: textos de UI (modal, etiquetas, ayuda).
- `assets/data/config.json`: clases por estado y estilos base de botones.
- `assets/data/colaboradores.json`: lista de colaboradores.
- `index.html`: estructura de bloques y layout general.
- `assets/css/style.css`: estilos de la UI.

## Pasos sugeridos
1) Duplica el repo o hace fork para usarlo como base.
2) Actualiza `assets/data/asignaturas.json` con tu plan de estudios:
   - Usa ids unicos y consistentes.
   - Ajusta `bloque`, `colClass` y `orden` para el layout.
   - Define `previas` o `habilitacion` segun las reglas de tu carrera.
3) Revisa que los bloques declarados en JSON existan en `index.html` como `data-bloque`.
4) Ajusta textos en `assets/data/textos.json` y estilos en `assets/css/style.css`.
5) Corre tests: `npm run test:unit` y `npm run test:e2e` (si aplica).

## Reglas y validaciones utiles
- Si cambias nombres o ids de materias, revisa tests en `tests/core.test.js`.
- Mantene coherencia entre ids en JSON y los botones generados.
- Usa reglas OR/AND en `habilitacion` cuando las previas no son lineales.

## Tips
- Empeza con una version minima (pocos bloques) y sumalos de a poco.
- Si cambias el layout, valida visualmente el posicionamiento de las flechas.
- Documenta tus reglas especiales en `TESTS.md` y agrega tests de datos.
