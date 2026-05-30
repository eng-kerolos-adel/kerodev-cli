// src/generators/web/configs/prettier.ts
//
// NOTE: prettier-plugin-tailwindcss v0.6+ supports Tailwind v4 CSS-first config.
// It reads from the CSS file directly — no tailwind.config.js needed.
export function generatePrettierConfig(config) {
    const withTailwindPlugin = config?.css === 'tailwind';
    const cfg = {
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'es5',
        printWidth: 100,
        bracketSpacing: true,
        arrowParens: 'avoid',
        endOfLine: 'lf',
    };
    // Only add the Tailwind plugin when Tailwind is actually used.
    // prettier-plugin-tailwindcss v0.6+ works with Tailwind v4 CSS-first config.
    if (withTailwindPlugin) {
        cfg.plugins = ['prettier-plugin-tailwindcss'];
    }
    return JSON.stringify(cfg, null, 2);
}
//# sourceMappingURL=prettier.js.map