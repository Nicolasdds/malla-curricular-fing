# Guia de pruebas

Este documento describe como ejecutar los tests y que valida cada uno.

## Requisitos
- Node.js + npm instalados.
- Acceso para instalar navegadores de Playwright.

## Como ejecutar
1) Abri una terminal en la raiz del repositorio.
2) Instala dependencias si hace falta:
   `npm install`
3) Instala navegadores de Playwright (una sola vez):
   `npx playwright install`
4) Ejecuta las pruebas:
   - Unit (Jest): `npm run test:unit`
   - E2E (Playwright): `npm run test:e2e`
   - Todo: `npm run test:all`

## Tests unitarios (Jest)

Archivo: `tests/previas.test.js`

- puedeHabilitar: valida reglas de habilitacion (previas, AND/OR) con combinaciones de aprobadas/exoneradas y casos sin previas.
- calcularCreditos: suma solo creditos exonerados e ignora ids inexistentes.
- cambiarEstadoMateria: verifica el ciclo de estados y el no cambio para `no-habilitada`.
- actualizarProgreso: asegura altas/bajas correctas en `aprobadas` y `exoneradas`.
- obtenerPendientes: calcula faltantes por reglas base y selecciona el camino mas corto en OR.
- obtenerMateriasHabilitadas: ignora `matInicial` y solo devuelve materias habilitadas.
- esEdgeRelacionado: valida coincidencia de edges por id.

Archivo: `tests/core.test.js`

- Datos y HTML:
  - todos los bloques en JSON existen en HTML.
  - `asignaturasBasicas` existe en JSON.
  - ids consistentes (`key` == `id`).
  - layout completo (bloque, columna y orden definidos).
  - `matd1` esta en el primer semestre.
- Flechas:
  - todas las flechas apuntan a materias existentes.
  - no hay flechas que apunten a si mismas.
  - cada previa declarada genera una flecha correspondiente.
  - no existen flechas duplicadas por par `from->to`.

## Tests E2E (Playwright)

Archivo: `tests-e2e/ui.spec.js`

- hover resalta flechas relacionadas:
  - al pasar el mouse por una materia, debe activarse al menos una flecha relacionada (marker-end activo).
- click cambia estado visual de una materia:
  - primer click pasa a estado "aprobada" (clase `btn-primary`).
  - segundo click pasa a estado "exonerada" (clase `btn-success`).
- persiste estado en localStorage:
  - tras aprobar una materia, se recarga la pagina y se espera que el estado siga guardado en `previas.estado.v1`.
- reiniciar restaura estados y limpia progreso:
  - al reiniciar, el boton vuelve al estado habilitado y se limpia `previas.estado.v1`.
- switch de matematica inicial actualiza estado:
  - al activar el switch, se guarda `matInicialChecked` en `localStorage`.
- boton de ayuda abre y cierra modal:
  - al hacer click en "?", se muestra el modal y se cierra con "De Acuerdo !".
- boton de colaboradores abre y cierra modal:
  - al hacer click en "Colaboradores", se muestra el modal y se cierra con "De Acuerdo !".
- link de sugerencias existe y apunta al formulario:
  - el enlace "Soporte/Sugerencias" apunta al formulario de Google y abre en nueva pestaña.
- los botones muestran texto con creditos:
  - el texto del boton incluye el sufijo de creditos ("Cr.").
