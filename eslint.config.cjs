const noUnsanitized = require('eslint-plugin-no-unsanitized');
const html = require('eslint-plugin-html');

module.exports = [
    {
        ignores: [
            'node_modules/**', 'test-results/**', 'playwright-report/**',
            'coverage/**', 'security-reports/**',
            'assets/js/jQuery_*.js', 'assets/js/Boostrap_*.js'
        ]
    },
    {
        files: ['**/*.js', '**/*.cjs', '**/*.html'],
        plugins: { 'no-unsanitized': noUnsanitized, html },
        languageOptions: { ecmaVersion: 'latest', sourceType: 'script' },
        rules: {
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-new-func': 'error',
            'no-script-url': 'error',
            'no-proto': 'error',
            'no-unsanitized/method': 'error',
            'no-unsanitized/property': 'error',
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'CallExpression[callee.type="MemberExpression"][callee.property.name="html"][arguments.length>0]',
                    message: 'Revisar la insercion de HTML: usar text() para datos o justificar el origen confiable del marcado.'
                }
            ]
        }
    }
];
