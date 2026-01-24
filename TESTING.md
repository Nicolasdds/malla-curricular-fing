# Guía de pruebas

## Resumen
Este proyecto incluye una pequeña suite de pruebas unitarias para la lógica central de prerrequisitos usada por el frontend.
Las pruebas se implementan con Node.js y el módulo `assert` integrado.

## Requisitos
- Node.js 16+ (sin dependencias externas)

## Pruebas incluidas
- `tests/core.test.js`
  - Comportamiento verificado:
    - Las materias definidas en `assets/js/scripts.js` existen como botones en `index.html`.
    - Los botones con clase `asignatura` en `index.html` existen en `assets/js/scripts.js`.
    - Los IDs declarados en `asignaturasBasicas` existen en HTML y en scripts.
    - Cada entrada de `asignaturas` mantiene `key` == `id`.

## Datos de entrada y resultados esperados
| Caso | Datos de entrada | Resultado esperado | Descripcion |
| --- | --- | --- | --- |
| `asignaturas_vs_html` | `index.html` + `assets/js/scripts.js` | sin faltantes | IDs de asignaturas y botones coinciden |
| `basicas_vs_html` | `asignaturasBasicas` + `index.html` | sin faltantes | basicas existen en HTML |
| `basicas_vs_scripts` | `asignaturasBasicas` + `scripts.js` | sin faltantes | basicas existen en scripts |
| `key_vs_id` | `scripts.js` | sin diferencias | key de asignatura igual a id |

## Cómo ejecutar
1) Abrí una terminal en la raíz del repositorio.
2) Ejecutá:
   `node tests/core.test.js`

## Entorno de ejecución
- Ejecutar desde la raíz del repositorio en un shell estándar (PowerShell, CMD, bash).
