# Malla Curricular FING

Aplicación web para visualizar la malla curricular y simular el avance en previas.

## Uso
1) Abrí `index.html` en tu navegador.
2) Hacé click en las materias para cambiar su estado.
3) Si una materia está deshabilitada, el modal indica qué falta para cursarla.

## Ramas y despliegues en Render
- Rama `deploy` (produccion): https://malla-curricular-fing.onrender.com/
- Rama `dev` (pruebas): https://dev-malla-curricular-fing.onrender.com/

Es sencillo configurar una rama propia en Render para tu fork y hacer pruebas antes de proponer cambios a la rama principal:
1) En Render crea un "Static Site".
2) Conecta tu repo de GitHub (tu fork) y elige la rama a desplegar (por ejemplo `mi-rama`).
3) Build Command: dejalo vacio.
4) Publish Directory: `.`
5) Guarda: Render desplega automaticamente en cada push a esa rama.
   Para que esto funcione, configura la URL en Settings del repo en GitHub (Webhooks/Deploy Hook).
   El deploy automatico demora unos 3 minutos; no te desesperes si no se ve al instante.

## Pruebas (Jest)
1) Instalar dependencias:
   `npm install`
2) Ejecutar pruebas:
   `npm test`

## Lógica principal
- `assets/js/scripts.js` contiene la lógica de negocio y la UI.
- Las funciones puras para tests se exportan como `PreviasLogic`.
- `assets/js/dataLoader.js` carga los JSON y expone `window.AppData`.

## Persistencia con localStorage
- El progreso se guarda automaticamente en `localStorage`.
- Al recargar, se restaura el estado de materias, progreso y el checkbox de Matemática Inicial.
- El botón Reiniciar limpia el almacenamiento y deja la app como en la primera visita.

## Reglas de habilitación con múltiples caminos
El sistema permite declarar reglas de habilitación en JSON con caminos alternativos.
Esto permite cambiar la lógica desde datos, sin tocar el código.

Ejemplo simple:
```json
{
  "habilitacion": {
    "tipo": "OR",
    "condiciones": [
      { "tipo": "AND", "aprobadas": ["p1", "matd1"] },
      { "tipo": "AND", "exoneradas": ["gal1"] }
    ]
  }
}
```

Ejemplo comentado (usando campos de ayuda para mantener JSON valido):
```json
{
  "habilitacion": {
    "tipo": "OR",
    "_comentario": "Cualquiera de estos caminos habilita la materia",
    "condiciones": [
      {
        "tipo": "AND",
        "aprobadas": ["p1", "matd1"],
        "_comentario": "Camino 1: aprobar P1 y Matemática Discreta 1"
      },
      {
        "tipo": "AND",
        "exoneradas": ["gal1"],
        "_comentario": "Camino 2: exonerar GAL1"
      }
    ]
  }
}
```

## Buenas prácticas para rediseñar
- Para colores, tamaños y tipografías: edita `assets/css/style.css`.
- Para cambios de estructura visual: edita `index.html` y mantén los contenedores con `data-bloque`.
- Para agregar o editar materias: edita `assets/data/asignaturas.json`.
- Si el cambio es solo visual, conviene concentrarlo en HTML/CSS.
- Los botones de materias se generan automáticamente desde el JSON.
- Para cambiar el diseño de los botones generados en JS: ajusta las clases en `assets/data/config.json` (`CLASES_BASE_BOTON`) y en `assets/data/asignaturas.json` (`clasesExtra`, `colClass`), y define los estilos en `assets/css/style.css`.

## Cómo modificar el contenido sin romper la lógica
- Para cambiar materias, previas, créditos o reglas de habilitación: edita `assets/data/asignaturas.json`.
- Para cambiar textos y mensajes de UI: edita `assets/data/textos.json`.
- Para cambiar colaboradores: edita `assets/data/colaboradores.json`.
- Para cambiar estados y clases CSS por estado: edita `assets/data/config.json`.
- Si el cambio es visual, lo ideal es concentrarlo en `index.html` y `assets/css/style.css`.

## Cómo contribuir
- Agrega tests simples para las reglas de previas.
- Evita cambios grandes sin discutirlos.
- Prioriza claridad y comentarios cortos.

## Licencia
Este proyecto está licenciado bajo GNU General Public License v3.0 (GPLv3).
Podés usar, modificar y redistribuir este software bajo los términos de la GPLv3.
Cualquier trabajo derivado debe permanecer open source y mantener atribución al autor original.

Autor: Nicolás Díaz
Año: 2022
