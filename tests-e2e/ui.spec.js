const { test, expect } = require('@playwright/test');

test.describe('UI basica', () => {
    test('hover resalta flechas relacionadas', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.asignatura');
        await page.waitForSelector('.edges-layer');

        const target = page.locator('#cdivv');
        await target.scrollIntoViewIfNeeded();
        await target.hover();

        await page.waitForFunction(() => {
            return document.querySelectorAll('.edge[marker-end="url(#edge-arrow)"]').length > 0;
        });
    });

    test('click cambia estado visual de una materia', async ({ page }) => {
        await page.goto('/');
        const button = page.locator('#gal1');
        await expect(button).toBeVisible();

        await button.click();
        await page.waitForFunction(() => {
            const el = document.getElementById('gal1');
            return el && el.classList.contains('btn-primary');
        });

        await button.click();
        await page.waitForFunction(() => {
            const el = document.getElementById('gal1');
            return el && el.classList.contains('btn-success');
        });
    });

    test('persiste estado en localStorage', async ({ page }) => {
        await page.goto('/');
        const button = page.locator('#gal1');
        await expect(button).toBeVisible();

        await button.click();
        await page.waitForFunction(() => {
            const el = document.getElementById('gal1');
            return el && el.classList.contains('btn-primary');
        });

        await page.reload();
        await page.waitForSelector('#gal1');

        const stored = await page.evaluate(() => {
            const raw = window.localStorage.getItem('previas.estado.v1');
            return raw ? JSON.parse(raw) : null;
        });

        expect(stored).not.toBeNull();
        expect(stored.progreso.aprobadas).toContain('gal1');
    });

    test('reiniciar restaura estados y limpia progreso', async ({ page }) => {
        await page.goto('/');
        const button = page.locator('#gal1');
        await expect(button).toBeVisible();

        await button.click();
        await page.waitForFunction(() => {
            const el = document.getElementById('gal1');
            return el && el.classList.contains('btn-primary');
        });

        await page.locator('#reiniciar').click();

        await page.waitForFunction(() => {
            const el = document.getElementById('gal1');
            return el && el.classList.contains('btn-danger') && !el.classList.contains('btn-primary');
        });

        const stored = await page.evaluate(() => {
            const raw = window.localStorage.getItem('previas.estado.v1');
            return raw ? JSON.parse(raw) : null;
        });
        expect(stored).toBeNull();
    });

    test('switch de matematica inicial actualiza estado', async ({ page }) => {
        await page.goto('/');
        const slider = page.locator('label#checkboxDesktop .slider');
        await expect(slider).toBeVisible();
        await slider.click({ force: true });

        const stored = await page.evaluate(() => {
            const raw = window.localStorage.getItem('previas.estado.v1');
            return raw ? JSON.parse(raw) : null;
        });

        expect(stored).not.toBeNull();
        expect(stored.matInicialChecked).toBe(true);
    });

    test('boton de ayuda abre y cierra modal', async ({ page }) => {
        await page.goto('/');
        await page.locator('#ayuda-icon').click();
        await expect(page.locator('#previasModal')).toHaveClass(/show/);

        await page.locator('#previasModal .modal-footer .btn-success').click();
        await expect(page.locator('#previasModal')).not.toHaveClass(/show/);
    });

    test('boton de colaboradores abre y cierra modal', async ({ page }) => {
        await page.goto('/');
        await page.locator('.footer-colaboradores-container .colaboradores').click();
        await expect(page.locator('#previasModal')).toHaveClass(/show/);

        await page.locator('#previasModal .modal-footer .btn-success').click();
        await expect(page.locator('#previasModal')).not.toHaveClass(/show/);
    });

    test('link de sugerencias existe y apunta al formulario', async ({ page }) => {
        await page.goto('/');
        const link = page.locator('.support-data a:has-text("Soporte/Sugerencias")');
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute('href', 'https://forms.gle/TMGnrjNLAfcbaB8b7');
        await expect(link).toHaveAttribute('target', '_blank');
    });

    test('los botones muestran texto con creditos', async ({ page }) => {
        await page.goto('/');
        const button = page.locator('#gal1');
        await expect(button).toBeVisible();
        await expect(button).toContainText('Cr.');
    });
});
