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
});
