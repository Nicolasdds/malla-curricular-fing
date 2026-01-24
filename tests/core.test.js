const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HTML_PATH = path.join(ROOT, 'index.html');
const DATA_PATH = path.join(ROOT, 'assets', 'data', 'asignaturas.json');

function readFile(filePath) {
    return fs.readFileSync(filePath, 'utf8');
}

function extractBloques(html) {
    const matches = html.match(/\bdata-bloque="([^"]+)"/gi) || [];
    return matches.map((tag) => {
        const match = tag.match(/\bdata-bloque="([^"]+)"/i);
        return match ? match[1] : null;
    }).filter(Boolean);
}

function normalizarRegla(regla) {
    if (!regla) {
        return { tipo: 'AND', condiciones: [], aprobadas: [], exoneradas: [] };
    }
    return {
        tipo: regla.tipo || 'AND',
        condiciones: Array.isArray(regla.condiciones) ? regla.condiciones : [],
        aprobadas: Array.isArray(regla.aprobadas) ? regla.aprobadas : [],
        exoneradas: Array.isArray(regla.exoneradas) ? regla.exoneradas : []
    };
}

function construirReglaDesdePrevias(materia) {
    const previas = materia.previas || { curso: [], examen: [] };
    return {
        tipo: 'AND',
        aprobadas: previas.curso || [],
        exoneradas: previas.examen || []
    };
}

function obtenerRequisitosMateria(materia) {
    const regla = materia.habilitacion || construirReglaDesdePrevias(materia);
    const requisitos = [];

    function recolectar(reglaActual) {
        const r = normalizarRegla(reglaActual);
        if (r.condiciones.length > 0) {
            r.condiciones.forEach((cond) => recolectar(cond));
            return;
        }
        r.aprobadas.forEach((id) => requisitos.push({ id, tipo: 'aprobada' }));
        r.exoneradas.forEach((id) => requisitos.push({ id, tipo: 'exonerada' }));
    }

    recolectar(regla);
    return requisitos;
}

function construirEdges(asignaturas) {
    const edges = [];
    Object.keys(asignaturas).forEach((id) => {
        const materia = asignaturas[id];
        const requisitos = obtenerRequisitosMateria(materia);
        requisitos.forEach((req) => edges.push({ from: req.id, to: materia.id, tipo: req.tipo }));
    });

    const mapa = {};
    edges.forEach((edge) => {
        const key = `${edge.from}>${edge.to}`;
        if (!mapa[key] || (mapa[key].tipo !== 'exonerada' && edge.tipo === 'exonerada')) {
            mapa[key] = edge;
        }
    });

    return Object.values(mapa);
}

describe('Datos y HTML', () => {
    const html = readFile(HTML_PATH);
    const data = JSON.parse(readFile(DATA_PATH));
    const bloquesHtml = extractBloques(html);
    const idsAsignaturas = Object.keys(data.asignaturas || {});
    const bloquesJson = Array.from(new Set(idsAsignaturas.map((id) => data.asignaturas[id].bloque)));

    test('bloques en JSON existen en HTML', () => {
        const faltanEnHtml = bloquesJson.filter((bloque) => !bloquesHtml.includes(bloque));
        expect(faltanEnHtml).toEqual([]);
    });

    test('asignaturasBasicas existen en JSON', () => {
        const basicas = data.asignaturasBasicas || [];
        const faltanEnJson = basicas.filter((id) => !idsAsignaturas.includes(id));

        expect(faltanEnJson).toEqual([]);
    });

    test('key de asignatura coincide con id', () => {
        const desalineadas = idsAsignaturas.filter((key) => {
            return data.asignaturas[key].id !== key;
        });
        expect(desalineadas).toEqual([]);
    });

    test('asignaturas tienen datos de layout', () => {
        const sinBloque = idsAsignaturas.filter((id) => !data.asignaturas[id].bloque);
        const sinCol = idsAsignaturas.filter((id) => data.asignaturas[id].colClass === undefined);
        const sinOrden = idsAsignaturas.filter((id) => data.asignaturas[id].orden === undefined);

        expect(sinBloque).toEqual([]);
        expect(sinCol).toEqual([]);
        expect(sinOrden).toEqual([]);
    });

    test('MD1 esta en el primer semestre (bloque-2)', () => {
        expect(data.asignaturas.matd1.bloque).toBe('bloque-2');
    });

    test('Programacion funcional tiene 10 creditos', () => {
        expect(data.asignaturas.intProgFunc.creditos).toBe(10);
    });

    test('Introduccion a la Ingenieria de Software tiene 10 creditos', () => {
        expect(data.asignaturas.intIngSoft.creditos).toBe(10);
    });
});

describe('Flechas', () => {
    const data = JSON.parse(readFile(DATA_PATH));
    const asignaturas = data.asignaturas || {};
    const idsAsignaturas = Object.keys(asignaturas);
    const edges = construirEdges(asignaturas);

    test('todas las flechas apuntan a materias existentes', () => {
        const invalidEdges = edges.filter((edge) => {
            return !idsAsignaturas.includes(edge.from) || !idsAsignaturas.includes(edge.to);
        });

        expect(invalidEdges).toEqual([]);
    });

    test('no hay flechas que apunten a si mismas', () => {
        const selfEdges = edges.filter((edge) => edge.from === edge.to);

        expect(selfEdges).toEqual([]);
    });

    test('todas las previas generan una flecha correspondiente', () => {
        const faltantes = [];
        idsAsignaturas.forEach((id) => {
            const requisitos = obtenerRequisitosMateria(asignaturas[id]);
            requisitos.forEach((req) => {
                const match = edges.find((edge) => {
                    if (edge.from !== req.id || edge.to !== id) {
                        return false;
                    }
                    if (req.tipo === 'exonerada') {
                        return edge.tipo === 'exonerada';
                    }
                    return edge.tipo === 'aprobada' || edge.tipo === 'exonerada';
                });
                if (!match) {
                    faltantes.push({ from: req.id, to: id, tipo: req.tipo });
                }
            });
        });

        expect(faltantes).toEqual([]);
    });

    test('no hay flechas duplicadas por par from->to', () => {
        const seen = new Set();
        const duplicadas = edges.filter((edge) => {
            const key = `${edge.from}>${edge.to}`;
            if (seen.has(key)) {
                return true;
            }
            seen.add(key);
            return false;
        });

        expect(duplicadas).toEqual([]);
    });
});
