// -----------------------------
// Configuracion y datos externos
// -----------------------------
// Hoy se cargan desde JSON locales. Manana pueden venir de una API o BD.
var AppData = null;
var ESTADOS = null;

function setAppData(data) {
    AppData = data;
    ESTADOS = data.config.ESTADOS;
    if (typeof window !== 'undefined' && window.PreviasLogic) {
        window.PreviasLogic.ESTADOS = ESTADOS;
    }
}

if (typeof window === 'undefined') {
    var fs = require('fs');
    var path = require('path');

    function leerJson(relPath) {
        var fullPath = path.join(__dirname, '..', 'data', relPath);
        return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    }

    setAppData({
        config: leerJson('config.json'),
        textos: leerJson('textos.json'),
        asignaturas: leerJson('asignaturas.json'),
        colaboradores: leerJson('colaboradores.json')
    });
}

// -----------------------------
// Logica de negocio (funciones puras, sin DOM)
// -----------------------------
function addToList(list, item) {
    if (!list.includes(item)) {
        list.push(item);
    }
}

function removeFromList(list, item) {
    var index = list.indexOf(item);
    if (index !== -1) {
        list.splice(index, 1);
    }
}

function construirReglaDesdePrevias(materia) {
    var previas = materia.previas || { curso: [], examen: [] };
    return {
        tipo: 'AND',
        aprobadas: previas.curso || [],
        exoneradas: previas.examen || []
    };
}

function normalizarRegla(regla) {
    if (!regla) {
        return { tipo: 'AND', aprobadas: [], exoneradas: [] };
    }
    return {
        tipo: regla.tipo || 'AND',
        condiciones: Array.isArray(regla.condiciones) ? regla.condiciones : [],
        aprobadas: Array.isArray(regla.aprobadas) ? regla.aprobadas : [],
        exoneradas: Array.isArray(regla.exoneradas) ? regla.exoneradas : []
    };
}

function cumpleRegla(regla, progresoActual) {
    var r = normalizarRegla(regla);

    if (r.condiciones.length > 0) {
        if (r.tipo === 'OR') {
            return r.condiciones.some(function(cond) {
                return cumpleRegla(cond, progresoActual);
            });
        }

        return r.condiciones.every(function(cond) {
            return cumpleRegla(cond, progresoActual);
        });
    }

    var faltanAp = r.aprobadas.filter(function(id) {
        return !progresoActual.aprobadas.includes(id);
    });
    var faltanEx = r.exoneradas.filter(function(id) {
        return !progresoActual.exoneradas.includes(id);
    });

    return faltanAp.length === 0 && faltanEx.length === 0;
}

function puedeHabilitar(materia, progresoActual) {
    var regla = materia.habilitacion || construirReglaDesdePrevias(materia);
    return cumpleRegla(regla, progresoActual);
}

function obtenerPendientes(materia, progresoActual) {
    function pendientesBase(regla) {
        var r = normalizarRegla(regla);
        return {
            faltanAp: r.aprobadas.filter(function(id) {
                return !progresoActual.aprobadas.includes(id);
            }),
            faltanEx: r.exoneradas.filter(function(id) {
                return !progresoActual.exoneradas.includes(id);
            })
        };
    }

    function unirPendientes(a, b) {
        return {
            faltanAp: a.faltanAp.concat(b.faltanAp.filter(function(id) { return !a.faltanAp.includes(id); })),
            faltanEx: a.faltanEx.concat(b.faltanEx.filter(function(id) { return !a.faltanEx.includes(id); }))
        };
    }

    function pendientesRegla(regla) {
        var r = normalizarRegla(regla);
        if (r.condiciones.length === 0) {
            return pendientesBase(r);
        }

        if (r.tipo === 'OR') {
            var mejor = null;
            r.condiciones.forEach(function(cond) {
                var pendientes = pendientesRegla(cond);
                var total = pendientes.faltanAp.length + pendientes.faltanEx.length;
                if (!mejor || total < mejor.total) {
                    mejor = { total: total, pendientes: pendientes };
                }
            });
            return mejor ? mejor.pendientes : { faltanAp: [], faltanEx: [] };
        }

        return r.condiciones.reduce(function(acum, cond) {
            return unirPendientes(acum, pendientesRegla(cond));
        }, { faltanAp: [], faltanEx: [] });
    }

    var regla = materia.habilitacion || construirReglaDesdePrevias(materia);
    return pendientesRegla(regla);
}

function cambiarEstadoMateria(materia) {
    var estadoActual = materia.estado;

    if (estadoActual === ESTADOS.HABILITADA || estadoActual === ESTADOS.NO_APROBADA) {
        return ESTADOS.APROBADA;
    }

    if (estadoActual === ESTADOS.APROBADA) {
        return ESTADOS.EXONERADA;
    }

    if (estadoActual === ESTADOS.EXONERADA) {
        return ESTADOS.NO_APROBADA;
    }

    return estadoActual;
}

function actualizarProgreso(progresoActual, materiaId, nuevoEstado) {
    if (nuevoEstado === ESTADOS.APROBADA) {
        addToList(progresoActual.aprobadas, materiaId);
        removeFromList(progresoActual.exoneradas, materiaId);
        return;
    }

    if (nuevoEstado === ESTADOS.EXONERADA) {
        addToList(progresoActual.aprobadas, materiaId);
        addToList(progresoActual.exoneradas, materiaId);
        return;
    }

    removeFromList(progresoActual.aprobadas, materiaId);
    removeFromList(progresoActual.exoneradas, materiaId);
}

function calcularCreditos(progresoActual, materias) {
    var total = 0;
    progresoActual.exoneradas.forEach(function(id) {
        if (materias[id]) {
            total += materias[id].creditos;
        }
    });
    return total;
}

function obtenerMateriasHabilitadas(materias, progresoActual) {
    var habilitadas = [];
    for (var key in materias) {
        if (!materias.hasOwnProperty(key)) {
            continue;
        }
        var materia = materias[key];
        if (materia.id === 'matInicial') {
            continue;
        }
        if (puedeHabilitar(materia, progresoActual)) {
            habilitadas.push(materia.id);
        }
    }
    return habilitadas;
}

// Export para tests unitarios (sin DOM ni jQuery).
var PreviasLogic = {
    ESTADOS: ESTADOS,
    puedeHabilitar: puedeHabilitar,
    cambiarEstadoMateria: cambiarEstadoMateria,
    calcularCreditos: calcularCreditos,
    obtenerMateriasHabilitadas: obtenerMateriasHabilitadas,
    actualizarProgreso: actualizarProgreso,
    obtenerPendientes: obtenerPendientes
};

if (typeof window !== 'undefined') {
    window.PreviasLogic = PreviasLogic;
}

if (typeof module === 'object' && module.exports) {
    module.exports = PreviasLogic;
}

// -----------------------------
// UI + estado local (usa DOM)
// -----------------------------
function iniciarApp(appData) {
    var asignaturasBasicas = (appData.asignaturas && appData.asignaturas.asignaturasBasicas) || [];
    var asignaturas = (appData.asignaturas && appData.asignaturas.asignaturas) || {};
    var progreso = { aprobadas: [], exoneradas: [] };
    var creditos_actuales = 0;

    var textos = appData.textos;
    var clasesPorEstado = appData.config.CLASES_POR_ESTADO;
    var clasesBaseBoton = appData.config.CLASES_BASE_BOTON || [];
    var clasesTodas = obtenerClasesTodas(clasesPorEstado);

    function obtenerClasesTodas(map) {
        var todas = [];
        Object.keys(map).forEach(function(key) {
            map[key].forEach(function(clase) {
                if (!todas.includes(clase)) {
                    todas.push(clase);
                }
            });
        });
        return todas;
    }

    function normalizarAsignaturas() {
        for (var key in asignaturas) {
        if (!asignaturas.hasOwnProperty(key)) {
            continue;
        }
        var materia = asignaturas[key];
        materia.previas = materia.previas || { curso: [], examen: [] };
        materia.previaDe = materia.previaDe || { curso: [], examen: [] };
        if (!materia.habilitacion) {
            materia.habilitacion = construirReglaDesdePrevias(materia);
        }
        materia.estado = ESTADOS.NO_HABILITADA;
    }
    }

    function aplicarEstadoMateria(materiaId) {
        var materia = asignaturas[materiaId];
        if (!materia) {
            return;
        }

        var $el = $('#' + materiaId);
        clasesTodas.forEach(function(clase) {
            $el.removeClass(clase);
        });

        var clases = clasesPorEstado[materia.estado] || [];
        clases.forEach(function(clase) {
            $el.addClass(clase);
        });
    }

    function aplicarEstadosTodos() {
        for (var key in asignaturas) {
            if (asignaturas.hasOwnProperty(key)) {
                aplicarEstadoMateria(asignaturas[key].id);
            }
        }
    }

    function actualizarCreditosUI() {
        creditos_actuales = calcularCreditos(progreso, asignaturas);
        var elemento = document.getElementById('creditos-label');
        elemento.innerText = textos.CREDITOS_LABEL + creditos_actuales;
    }

    function construirTextoMateria(materia) {
        return materia.nombre + ' (' + materia.creditos + textos.MATERIA_CREDITOS_SUFFIX + ')';
    }

    function crearBotonMateria(materia) {
        var boton = document.createElement('button');
        boton.type = 'button';
        boton.id = materia.id;
        boton.setAttribute('nombre', materia.nombre);
        boton.setAttribute('creditos', materia.creditos);

        var clases = clasesBaseBoton.slice();
        if (Array.isArray(materia.clasesExtra)) {
            materia.clasesExtra.forEach(function(clase) {
                if (clase) {
                    clases.push(clase);
                }
            });
        }
        boton.className = clases.join(' ');
        boton.innerText = construirTextoMateria(materia);

        return boton;
    }

    function renderMaterias() {
        var materiasPorBloque = {};

        for (var key in asignaturas) {
            if (!asignaturas.hasOwnProperty(key)) {
                continue;
            }
            var materia = asignaturas[key];
            if (!materia.bloque) {
                continue;
            }

            if (!materiasPorBloque[materia.bloque]) {
                materiasPorBloque[materia.bloque] = [];
            }
            materiasPorBloque[materia.bloque].push(materia);
        }

        Object.keys(materiasPorBloque).forEach(function(bloque) {
            var contenedor = document.querySelector('[data-bloque=\"' + bloque + '\"]');
            if (!contenedor) {
                return;
            }

            contenedor.innerHTML = '';
            materiasPorBloque[bloque]
                .sort(function(a, b) { return (a.orden || 0) - (b.orden || 0); })
                .forEach(function(materia) {
                    var boton = crearBotonMateria(materia);
                    if (materia.colClass) {
                        var columna = document.createElement('div');
                        columna.className = materia.colClass;
                        columna.appendChild(boton);
                        contenedor.appendChild(columna);
                    } else {
                        contenedor.appendChild(boton);
                    }
                });
        });
    }

    function construirModalPrevias(materiaId) {
        var materia = asignaturas[materiaId];
        if (!materia) {
            return { titulo: '', contenido: '' };
        }

        if (materiaId === 'matInicial') {
            return {
                titulo: materia.nombre,
                contenido: "<p class='text-center'>" + textos.MODAL_MAT_INICIAL + "</p>"
            };
        }

        var pendientes = obtenerPendientes(materia, progreso);
        var content = '';

        if (pendientes.faltanEx.length !== 0) {
            content += "<p class='text-center'><strong>" + textos.MODAL_FALTA_EXONERAR + "</strong>";
            content += "<ul class='list-group text-center'>";
            pendientes.faltanEx.forEach(function(id) {
                if (asignaturas[id]) {
                    content += "<li class='list-group-item'>";
                    content += asignaturas[id].nombre;
                    content += "</li>";
                }
            });
            content += "</ul>";
            content += "</p>";
        }

        if (pendientes.faltanAp.length !== 0) {
            content += "<p class='text-center'><strong>" + textos.MODAL_FALTA_APROBAR + "</strong> ";
            content += "<ul class='list-group text-center'>";
            pendientes.faltanAp.forEach(function(id) {
                if (asignaturas[id]) {
                    content += "<li class='list-group-item'>";
                    content += asignaturas[id].nombre;
                    content += "</li>";
                }
            });
            content += "</ul>";
            content += "</p>";
        }

        return { titulo: materia.nombre, contenido: content };
    }

    function construirHtmlColaboradores(lista, textoGracias) {
        var html = '<div style="text-align: center; margin:auto; width:90%">';
        html += '<ul class="lista-colaboradores">';
        lista.forEach(function(nombre) {
            html += '<li>' + nombre + '</li>';
        });
        html += '</ul>';
        html += '<p><strong>' + textoGracias + '</strong></p>';
        html += '</div>';
        return html;
    }

    function deshabilitarMateria(materiaId) {
        var materia = asignaturas[materiaId];
        if (!materia) {
            return;
        }

        materia.estado = ESTADOS.NO_HABILITADA;
        actualizarProgreso(progreso, materiaId, materia.estado);
    }

    function habilitarMateria(materiaId) {
        var materia = asignaturas[materiaId];
        if (!materia) {
            return;
        }
        if (materia.estado === ESTADOS.NO_HABILITADA) {
            materia.estado = ESTADOS.HABILITADA;
        }
    }

    function aplicarPrevias() {
        for (var key in asignaturas) {
            if (!asignaturas.hasOwnProperty(key)) {
                continue;
            }
            var materia = asignaturas[key];
            if (materia.id === 'matInicial') {
                continue;
            }

            if (puedeHabilitar(materia, progreso)) {
                habilitarMateria(materia.id);
            } else {
                deshabilitarMateria(materia.id);
            }
        }
    }

    function iniciarEstados() {
        for (var key in asignaturas) {
            if (asignaturas.hasOwnProperty(key)) {
                asignaturas[key].estado = ESTADOS.NO_HABILITADA;
            }
        }

        asignaturasBasicas.forEach(function(id) {
            habilitarMateria(id);
        });
    }

    function verificarMatIncial() {
        if ($('.matInicialControl').is(':checked')) {
            habilitarMateria('matInicial');
            deshabilitarMateria('cdiv');
            asignaturas.cdiv.previas.curso.push('matInicial');
            asignaturas.matInicial.previaDe.curso.push('cdiv');
            if ($(window).width() <= 767) {
                $('.bloque-matInicial').show();
            }
        } else {
            deshabilitarMateria('matInicial');
            habilitarMateria('cdiv');
            asignaturas.cdiv.previas.curso = [];
            asignaturas.matInicial.previaDe.curso = [];
            if ($(window).width() <= 767) {
                $('.bloque-matInicial').hide();
            }
        }
    }

    function controlMenu() {
        document.getElementById('boton-menu').classList.toggle('menu-presionado');
        document.getElementById('menu').classList.toggle('menu-on');
        document.getElementById('body').classList.toggle('body-background');
        document.getElementById('container-fluid').classList.toggle('opacity-content');

        if ($('button').prop('disabled') === true) {
            $('button').prop('disabled', false);
        } else {
            $('button').prop('disabled', true);
        }
    }

    function actualizarUICompleta() {
        aplicarEstadosTodos();
        actualizarCreditosUI();
    }

    function guardarEstado() {
        if (typeof window === 'undefined' || !window.localStorage) {
            return;
        }

        var estados = {};
        for (var key in asignaturas) {
            if (asignaturas.hasOwnProperty(key)) {
                estados[key] = asignaturas[key].estado;
            }
        }

        var payload = {
            progreso: progreso,
            estados: estados,
            matInicialChecked: $('.matInicialControl').is(':checked')
        };

        try {
            window.localStorage.setItem('previas.estado.v1', JSON.stringify(payload));
        } catch (err) {
            console.warn('No se pudo guardar el estado en localStorage', err);
        }
    }

    function cargarEstado() {
        if (typeof window === 'undefined' || !window.localStorage) {
            return false;
        }

        var raw = window.localStorage.getItem('previas.estado.v1');
        if (!raw) {
            return false;
        }

        try {
            var data = JSON.parse(raw);
            if (!data || !data.estados || !data.progreso) {
                return false;
            }

            $('.matInicialControl').prop('checked', !!data.matInicialChecked);
            verificarMatIncial();

            progreso.aprobadas = Array.isArray(data.progreso.aprobadas) ? data.progreso.aprobadas : [];
            progreso.exoneradas = Array.isArray(data.progreso.exoneradas) ? data.progreso.exoneradas : [];

            for (var key in data.estados) {
                if (asignaturas[key]) {
                    asignaturas[key].estado = data.estados[key];
                }
            }

            return true;
        } catch (err) {
            console.warn('Estado guardado invalido, se omite', err);
            return false;
        }
    }

    function limpiarEstado() {
        if (typeof window === 'undefined' || !window.localStorage) {
            return;
        }
        window.localStorage.removeItem('previas.estado.v1');
    }

    $(function() {
        document.oncontextmenu = function() {
            return false;
        };

        normalizarAsignaturas();
        renderMaterias();
        iniciarEstados();
        $('.matInicialControl').prop('checked', false);

        if (!cargarEstado()) {
            verificarMatIncial();
            aplicarPrevias();
        }

        actualizarUICompleta();

        $('.asignatura').bind('click', function() {
            var id = $(this).attr('id');
            var materia = asignaturas[id];

            if (!materia) {
                return;
            }

            if (materia.estado !== ESTADOS.NO_HABILITADA) {
                var nuevoEstado = cambiarEstadoMateria(materia);
                materia.estado = nuevoEstado;
                actualizarProgreso(progreso, id, nuevoEstado);
                aplicarPrevias();
                actualizarUICompleta();
                guardarEstado();
            } else {
                var modal = construirModalPrevias(id);
                $('#ModalTitulo').text(modal.titulo);
                $('.modal-body').html(modal.contenido);
                $('#previasModal').modal('show');
            }
        });

        $('#reiniciar').bind('click', function() {
            iniciarEstados();
            $('.matInicialControl').prop('checked', false);
            verificarMatIncial();
            aplicarPrevias();
            actualizarUICompleta();
            limpiarEstado();
        });

        $('input').bind('change', function() {
            verificarMatIncial();
            aplicarPrevias();
            actualizarUICompleta();
            guardarEstado();
        });

        if ($(window).width() <= 767) {
            $('#boton-menu').bind('click', function() {
                controlMenu();
            });
            $('#cerrar-menu').bind('click', function() {
                controlMenu();
            });

            $(document).bind('click', function(e) {
                var container = $('.bloque-creditos');
                if ($('.menu').hasClass('menu-on')) {
                    if (!container.is(e.target) && container.has(e.target).length === 0) {
                        controlMenu();
                    }
                }
            });
        }

        $('#ayuda-icon').bind('click', function() {
            $('#ModalTitulo').text(textos.GUIA_TITULO);
            $('.modal-body').html(textos.GUIA_HTML);
            $('#previasModal').modal('show');
        });

    $('.colaboradores').bind('click', function() {
        $('#ModalTitulo').text(textos.COLAB_TITULO);
        $('.modal-body').html(construirHtmlColaboradores(appData.colaboradores || [], textos.COLAB_GRACIAS));
        $('#previasModal').modal('show');
        if ($(window).width() <= 767) {
            controlMenu();
        }
        });

        if (code_adser) {
            $('#imagen-logo-colaborador')
            .html('<a href="' + cuenta_instagram + '" target="_blank"><img src="' + url + '" alt="' + alt + '" width="' + ancho_logo + '"></a>');
        }
    });
}

// Inicia la app solo en navegador cuando los JSON ya estan cargados.
if (typeof window !== 'undefined') {
    function iniciarConAppData() {
        if (!window.AppData) {
            return;
        }
        setAppData(window.AppData);
        iniciarApp(window.AppData);
    }

    if (window.AppData) {
        iniciarConAppData();
    } else {
        window.addEventListener('appdata:loaded', iniciarConAppData);
    }
}

