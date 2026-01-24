const logic = require('../assets/js/scripts.js');

const ESTADOS = logic.ESTADOS;

describe('puedeHabilitar', () => {
    test('habilita si no hay previas ni reglas', () => {
        const materia = { id: 'sinPrevias' };
        const progreso = { aprobadas: [], exoneradas: [] };
        expect(logic.puedeHabilitar(materia, progreso)).toBe(true);
    });

    test('no habilita cdivv si falta aprobar cdiv', () => {
        const materia = {
            id: 'cdivv',
            previas: { curso: ['cdiv'], examen: [] },
        };
        const progreso = { aprobadas: [], exoneradas: [] };
        expect(logic.puedeHabilitar(materia, progreso)).toBe(false);
    });

    test('habilita cdivv si cdiv esta aprobada', () => {
        const materia = {
            id: 'cdivv',
            previas: { curso: ['cdiv'], examen: [] },
        };
        const progreso = { aprobadas: ['cdiv'], exoneradas: [] };
        expect(logic.puedeHabilitar(materia, progreso)).toBe(true);
    });

    test('requiere exoneradas y aprobadas a la vez', () => {
        const materia = {
            id: 'metNum',
            previas: { curso: [], examen: ['cdiv', 'gal1'] },
        };
        const progreso = { aprobadas: [], exoneradas: ['cdiv'] };
        expect(logic.puedeHabilitar(materia, progreso)).toBe(false);
    });

    test('soporta caminos alternativos (OR)', () => {
        const materia = {
            id: 'x',
            habilitacion: {
                tipo: 'OR',
                condiciones: [
                    { tipo: 'AND', aprobadas: ['p1', 'matd1'] },
                    { tipo: 'AND', exoneradas: ['gal1'] }
                ]
            }
        };
        const progreso = { aprobadas: ['p1', 'matd1'], exoneradas: [] };
        expect(logic.puedeHabilitar(materia, progreso)).toBe(true);
    });

    test('requiere todas las condiciones en AND', () => {
        const materia = {
            id: 'y',
            habilitacion: {
                tipo: 'AND',
                condiciones: [
                    { tipo: 'AND', aprobadas: ['a'] },
                    { tipo: 'AND', exoneradas: ['b'] }
                ]
            }
        };
        const progreso = { aprobadas: ['a'], exoneradas: [] };
        expect(logic.puedeHabilitar(materia, progreso)).toBe(false);
    });

    test('tallerProg se habilita con curso de P4', () => {
        const materia = {
            id: 'tallerProg',
            habilitacion: {
                tipo: 'OR',
                condiciones: [
                    { tipo: 'AND', aprobadas: ['p4'] },
                    { tipo: 'AND', aprobadas: [], exoneradas: ['p4'] }
                ]
            }
        };
        const progreso = { aprobadas: ['p4'], exoneradas: [] };
        expect(logic.puedeHabilitar(materia, progreso)).toBe(true);
    });

    test('tallerProg se habilita con curso P4 y examen P3', () => {
        const materia = {
            id: 'tallerProg',
            habilitacion: {
                tipo: 'OR',
                condiciones: [
                    { tipo: 'AND', aprobadas: ['p4'] },
                    { tipo: 'AND', aprobadas: [], exoneradas: ['p4'] }
                ]
            }
        };
        const progreso = { aprobadas: ['p4'], exoneradas: ['p3'] };
        expect(logic.puedeHabilitar(materia, progreso)).toBe(true);
    });

    test('tallerProg se habilita con examen de P4', () => {
        const materia = {
            id: 'tallerProg',
            habilitacion: {
                tipo: 'OR',
                condiciones: [
                    { tipo: 'AND', aprobadas: ['p4'] },
                    { tipo: 'AND', aprobadas: [], exoneradas: ['p4'] }
                ]
            }
        };
        const progreso = { aprobadas: ['p4'], exoneradas: ['p4'] };
        expect(logic.puedeHabilitar(materia, progreso)).toBe(true);
    });

    test('tallerProg se habilita con examen de P4 aunque P3 solo este habilitada', () => {
        const materia = {
            id: 'tallerProg',
            habilitacion: {
                tipo: 'OR',
                condiciones: [
                    { tipo: 'AND', aprobadas: ['p4'] },
                    { tipo: 'AND', aprobadas: [], exoneradas: ['p4'] }
                ]
            }
        };
        const progreso = { aprobadas: [], exoneradas: ['p4'] };
        expect(logic.puedeHabilitar(materia, progreso)).toBe(true);
    });

    test('sisop se habilita sin arq si cumple otro camino', () => {
        const materia = {
            id: 'sisop',
            habilitacion: {
                tipo: 'OR',
                condiciones: [
                    { tipo: 'AND', aprobadas: ['arq'], exoneradas: ['cdiv', 'p2', 'matd1', 'gal1'] },
                    { tipo: 'AND', aprobadas: [], exoneradas: ['cdiv', 'p2', 'matd1', 'gal1'] }
                ]
            }
        };
        const progreso = { aprobadas: [], exoneradas: ['cdiv', 'p2', 'matd1', 'gal1'] };
        expect(logic.puedeHabilitar(materia, progreso)).toBe(true);
    });
});

describe('calcularCreditos', () => {
    test('suma solo creditos de exoneradas', () => {
        const materias = {
            cdiv: { creditos: 13 },
            p1: { creditos: 10 },
            gal1: { creditos: 9 },
        };
        const progreso = { aprobadas: ['cdiv', 'p1'], exoneradas: ['cdiv', 'gal1'] };
        expect(logic.calcularCreditos(progreso, materias)).toBe(22);
    });

    test('ignora ids inexistentes', () => {
        const materias = { cdiv: { creditos: 13 } };
        const progreso = { aprobadas: [], exoneradas: ['cdiv', 'fantasma'] };
        expect(logic.calcularCreditos(progreso, materias)).toBe(13);
    });
});

describe('cambiarEstadoMateria', () => {
    test('habilitada -> aprobada', () => {
        const materia = { estado: ESTADOS.HABILITADA };
        expect(logic.cambiarEstadoMateria(materia)).toBe(ESTADOS.APROBADA);
    });

    test('aprobada -> exonerada', () => {
        const materia = { estado: ESTADOS.APROBADA };
        expect(logic.cambiarEstadoMateria(materia)).toBe(ESTADOS.EXONERADA);
    });

    test('exonerada -> no-aprobada', () => {
        const materia = { estado: ESTADOS.EXONERADA };
        expect(logic.cambiarEstadoMateria(materia)).toBe(ESTADOS.NO_APROBADA);
    });

    test('no-aprobada -> aprobada', () => {
        const materia = { estado: ESTADOS.NO_APROBADA };
        expect(logic.cambiarEstadoMateria(materia)).toBe(ESTADOS.APROBADA);
    });

    test('no-habilitada no cambia', () => {
        const materia = { estado: ESTADOS.NO_HABILITADA };
        expect(logic.cambiarEstadoMateria(materia)).toBe(ESTADOS.NO_HABILITADA);
    });
});

describe('actualizarProgreso', () => {
    test('aprobada agrega a aprobadas y quita de exoneradas', () => {
        const progreso = { aprobadas: [], exoneradas: ['p1'] };
        logic.actualizarProgreso(progreso, 'p1', ESTADOS.APROBADA);
        expect(progreso).toEqual({ aprobadas: ['p1'], exoneradas: [] });
    });

    test('exonerada agrega a ambas listas', () => {
        const progreso = { aprobadas: [], exoneradas: [] };
        logic.actualizarProgreso(progreso, 'p2', ESTADOS.EXONERADA);
        expect(progreso).toEqual({ aprobadas: ['p2'], exoneradas: ['p2'] });
    });

    test('no-aprobada elimina de ambas listas', () => {
        const progreso = { aprobadas: ['p3'], exoneradas: ['p3'] };
        logic.actualizarProgreso(progreso, 'p3', ESTADOS.NO_APROBADA);
        expect(progreso).toEqual({ aprobadas: [], exoneradas: [] });
    });
});

describe('obtenerPendientes', () => {
    test('calcula faltantes en regla base', () => {
        const materia = {
            id: 'base',
            previas: { curso: ['a', 'b'], examen: ['c'] }
        };
        const progreso = { aprobadas: ['a'], exoneradas: [] };
        expect(logic.obtenerPendientes(materia, progreso)).toEqual({
            faltanAp: ['b'],
            faltanEx: ['c']
        });
    });

    test('elige el camino con menos faltantes en OR', () => {
        const materia = {
            id: 'or',
            habilitacion: {
                tipo: 'OR',
                condiciones: [
                    { tipo: 'AND', aprobadas: ['a', 'b'] },
                    { tipo: 'AND', aprobadas: ['c'] }
                ]
            }
        };
        const progreso = { aprobadas: [], exoneradas: [] };
        expect(logic.obtenerPendientes(materia, progreso)).toEqual({
            faltanAp: ['c'],
            faltanEx: []
        });
    });

    test('combina faltantes en AND con OR interno', () => {
        const materia = {
            id: 'and-or',
            habilitacion: {
                tipo: 'AND',
                condiciones: [
                    {
                        tipo: 'OR',
                        condiciones: [
                            { tipo: 'AND', aprobadas: ['a'] },
                            { tipo: 'AND', aprobadas: ['b', 'c'] }
                        ]
                    },
                    { tipo: 'AND', exoneradas: ['x'] }
                ]
            }
        };
        const progreso = { aprobadas: [], exoneradas: [] };
        expect(logic.obtenerPendientes(materia, progreso)).toEqual({
            faltanAp: ['a'],
            faltanEx: ['x']
        });
    });
});

describe('obtenerMateriasHabilitadas', () => {
    test('omite matInicial y devuelve las habilitadas', () => {
        const materias = {
            matInicial: { id: 'matInicial', previas: { curso: [], examen: [] } },
            a: { id: 'a', previas: { curso: [], examen: [] } },
            b: { id: 'b', previas: { curso: ['a'], examen: [] } }
        };
        const progreso = { aprobadas: [], exoneradas: [] };
        const habilitadas = logic.obtenerMateriasHabilitadas(materias, progreso);
        expect(habilitadas.sort()).toEqual(['a'].sort());
    });
});

describe('edges', () => {
    test('esEdgeRelacionado detecta relaciones correctas', () => {
        const edge = { from: 'p1', to: 'p2' };
        expect(logic.esEdgeRelacionado(edge, 'p1')).toBe(true);
        expect(logic.esEdgeRelacionado(edge, 'p2')).toBe(true);
        expect(logic.esEdgeRelacionado(edge, 'gal1')).toBe(false);
    });
});
