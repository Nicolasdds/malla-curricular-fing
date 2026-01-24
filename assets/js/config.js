// Configuracion movida a JSON para separar datos de la logica.
// Este archivo queda como compatibilidad para cargas antiguas.
var AppConfig = null;

if (typeof window !== 'undefined' && window.AppData && window.AppData.config) {
    AppConfig = window.AppData.config;
    window.AppConfig = AppConfig;
}

if (typeof module === 'object' && module.exports) {
    module.exports = AppConfig;
}
