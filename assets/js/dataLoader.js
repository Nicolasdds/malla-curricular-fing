// Carga de datos externos (JSON) sin frameworks.
// Hoy usa archivos locales, manana puede apuntar a una API o BD.
(function() {
    function fetchJson(url) {
        return fetch(url).then(function(res) {
            if (!res.ok) {
                throw new Error('HTTP ' + res.status + ' al cargar ' + url);
            }
            return res.json();
        });
    }

    function publicarDatos(data) {
        window.AppData = data;
        window.dispatchEvent(new Event('appdata:loaded'));
    }

    function cargarDatos() {
        return Promise.all([
            fetchJson('assets/data/config.json'),
            fetchJson('assets/data/textos.json'),
            fetchJson('assets/data/asignaturas.json'),
            fetchJson('assets/data/colaboradores.json')
        ]).then(function(resultados) {
            publicarDatos({
                config: resultados[0],
                textos: resultados[1],
                asignaturas: resultados[2],
                colaboradores: resultados[3]
            });
        }).catch(function(err) {
            console.error('No se pudieron cargar los datos', err);
        });
    }

    if (typeof window !== 'undefined' && typeof fetch === 'function') {
        cargarDatos();
    }
})();
