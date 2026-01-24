# Malla Curricular FING

Aplicación web para visualizar la malla curricular y simular el avance en previas.

> ℹ️ **Este es un proyecto público bajo licencia GPLv3.**
> Cualquier persona puede ver el código, hacer fork y proponer cambios.
> Para colaborar de forma ordenada, seguí la guía que se encuentra más abajo.

---

## Uso y forma de trabajo recomendada

Si querés colaborar con el proyecto, el flujo sugerido es:

1. Hacer un **fork** del repositorio a tu cuenta de GitHub.
2. Trabajar los cambios en tu fork.
3. Durante el desarrollo podés elegir cómo probar tus cambios:

   * En **entorno local** (por ejemplo abriendo el proyecto en tu navegador), o
   * En un **entorno remoto**, desplegando tu fork en una plataforma como Render u otra de tu preferencia.
4. Cuando estés conforme con los cambios, abrir un **Pull Request hacia este repositorio apuntando a la rama `deploy`**.

La elección entre entorno local o remoto es totalmente libre: lo importante es que los cambios estén probados antes de proponerlos.

---

## Rama oficial del proyecto

* `deploy` → Producción: [https://malla-curricular-fing.onrender.com/](https://malla-curricular-fing.onrender.com/)

> ℹ️ La rama `deploy` representa el estado estable del proyecto. Los cambios propuestos deberían apuntar a esta rama.

---

## Despliegue en Render (opcional)

El proyecto oficial está desplegado en Render, pero **usar Render no es un requisito para colaborar**.

Si querés, podés usar Render como una forma sencilla de probar tu fork en línea:

1. En Render crea un nuevo servicio de tipo "Static Site".
2. Conecta tu repositorio de GitHub (tu fork).
3. Elegí la rama que querés desplegar (por ejemplo `mi-rama`).
4. Build Command: dejar vacío.
5. Publish Directory: `.`
6. Guardá la configuración. Para que el despliegue sea automático en cada push, es necesario configurar previamente el **Deploy Hook / Webhook** en los settings de tu repositorio (tu fork).

También podés desplegar tu fork en cualquier otra plataforma o simplemente trabajar de forma local: lo importante es que los cambios estén probados antes de enviar un Pull Request.

---

## Lógica principal del proyecto

* `assets/js/scripts.js` contiene la lógica principal y la UI.
* Las funciones puras para tests se exportan como `PreviasLogic`.
* `assets/js/dataLoader.js` carga los JSON y expone `window.AppData`.

---

## Persistencia con localStorage

* El progreso se guarda automáticamente en `localStorage`.
* Al recargar, se restaura el estado de materias, progreso y el checkbox de Matemática Inicial.
* El botón Reiniciar limpia el almacenamiento y deja la app como en la primera visita.

---

## Reglas de habilitación con múltiples caminos

El sistema permite declarar reglas de habilitación en JSON con caminos alternativos, sin modificar código.

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

---

## Buenas prácticas para cambios

* Cambios visuales → `index.html` y `assets/css/style.css`.
* Cambios de datos (materias, previas, créditos) → `assets/data/asignaturas.json`.
* Textos UI → `assets/data/textos.json`.
* Configuración de estados y clases → `assets/data/config.json`.

> Evitá mezclar refactors grandes con cambios visuales menores en un mismo PR.

---

> La explicacion completa de los tests y como ejecutarlos esta en `TESTS.md`.

---

## Licencia

Este proyecto está licenciado bajo **GNU General Public License v3.0 (GPLv3)**.

Esto significa que:

* Podés usar y modificar el código libremente.
* Podés crear forks públicos.
* **Cualquier trabajo derivado debe permanecer open source bajo GPLv3.**
* Se debe mantener la atribución al autor original.

Autor: Nicolás Díaz
Año: 2022
