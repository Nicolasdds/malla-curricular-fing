const logic = require('../assets/js/scripts.js');

const ESTADOS = logic.ESTADOS;

describe('puedeHabilitar', () => {
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

    test('tallerProg no se habilita solo con curso de P4', () => {
        const materia = {
            id: 'tallerProg',
            habilitacion: {
                tipo: 'OR',
                condiciones: [
                    { tipo: 'AND', aprobadas: ['p4'], exoneradas: ['p3'] },
                    { tipo: 'AND', aprobadas: [], exoneradas: ['p4'] }
                ]
            }
        };
        const progreso = { aprobadas: ['p4'], exoneradas: [] };
        expect(logic.puedeHabilitar(materia, progreso)).toBe(false);
    });

    test('tallerProg se habilita con curso P4 y examen P3', () => {
        const materia = {
            id: 'tallerProg',
            habilitacion: {
                tipo: 'OR',
                condiciones: [
                    { tipo: 'AND', aprobadas: ['p4'], exoneradas: ['p3'] },
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
                    { tipo: 'AND', aprobadas: ['p4'], exoneradas: ['p3'] },
                    { tipo: 'AND', aprobadas: [], exoneradas: ['p4'] }
                ]
            }
        };
        const progreso = { aprobadas: ['p4'], exoneradas: ['p4'] };
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

describe('edges', () => {
    test('esEdgeRelacionado detecta relaciones correctas', () => {
        const edge = { from: 'p1', to: 'p2' };
        expect(logic.esEdgeRelacionado(edge, 'p1')).toBe(true);
        expect(logic.esEdgeRelacionado(edge, 'p2')).toBe(true);
        expect(logic.esEdgeRelacionado(edge, 'gal1')).toBe(false);
    });
});
