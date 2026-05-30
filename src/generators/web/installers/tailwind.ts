// src/generators/web/installers/tailwind.ts
//
// Tailwind CSS v4 — CSS-first configuration.
// NO tailwind.config.js is created. Configuration lives entirely in globals.css via @theme.
//
// Installation strategy per framework type:
//   Vite-based (vite, react, astro, sveltekit) → @tailwindcss/vite plugin
//   PostCSS-based (next, nuxt, angular, remix, vue) → @tailwindcss/postcss

import path from 'path';
import type { GeneratorContext, WebProjectConfig } from '../../../types/index.js';
import { run } from '../../../utils/exec.js';
import { writeFile, pathExists, readJson } from '../../../utils/fs.js';
import { getAddCommand } from '../../../utils/packageManager.js';
import { TAILWIND_VITE_FRAMEWORKS } from '../../../constants/index.js';

export async function installTailwind(ctx: GeneratorContext): Promise<void> {
  const cfg = ctx.config as WebProjectConfig;
  const { framework, packageManager: pm } = cfg;

  const isViteBased = TAILWIND_VITE_FRAMEWORKS.includes(framework);

  if (isViteBased) {
    await installTailwindVite(ctx, pm);
  } else {
    await installTailwindPostcss(ctx, pm);
  }
}

/**
 * Vite-based frameworks: use @tailwindcss/vite plugin.
 * No postcss.config, no tailwind.config.
 */
async function installTailwindVite(ctx: GeneratorContext, pm: WebProjectConfig['packageManager']): Promise<void> {
  await run(getAddCommand(pm, true, 'tailwindcss', '@tailwindcss/vite'), { cwd: ctx.targetDir });

  // Patch vite.config.ts to add the tailwind plugin
  const viteCfgPath = path.join(ctx.targetDir, 'vite.config.ts');
  const viteCfgJsPath = path.join(ctx.targetDir, 'vite.config.js');
  const cfgPath = await pathExists(viteCfgPath) ? viteCfgPath : viteCfgJsPath;

  if (await pathExists(cfgPath)) {
    const { default: fse } = await import('fs-extra');
    let content = await fse.readFile(cfgPath, 'utf-8');

    if (!content.includes('@tailwindcss/vite')) {
      content = `import tailwindcss from '@tailwindcss/vite';\n` + content;
      content = content.replace(/plugins:\s*\[/, 'plugins: [\n    tailwindcss(),');
      await fse.writeFile(cfgPath, content, 'utf-8');
    }
  }

  await writeTailwindCss(ctx, true);
}

/**
 * PostCSS-based frameworks (Next.js, Nuxt, Angular, Remix, Vue).
 * Install tailwindcss + @tailwindcss/postcss + postcss.
 * Create postcss.config.mjs.
 * NO tailwind.config.js is created.
 */
async function installTailwindPostcss(ctx: GeneratorContext, pm: WebProjectConfig['packageManager']): Promise<void> {
  await run(getAddCommand(pm, true, 'tailwindcss', '@tailwindcss/postcss', 'postcss'), { cwd: ctx.targetDir });

  // postcss.config.mjs — the only config needed for Tailwind v4
  const postcssCfg = `export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
`;
  await writeFile(path.join(ctx.targetDir, 'postcss.config.mjs'), postcssCfg);

  await writeTailwindCss(ctx, false);
}

/**
 * Write the globals.css (or equivalent) with Tailwind v4 CSS-first config.
 * @theme replaces tailwind.config.js — all customizations live here.
 */
async function writeTailwindCss(ctx: GeneratorContext, _isVite: boolean): Promise<void> {
  const cfg = ctx.config as WebProjectConfig;

  // Determine the CSS entry file path
  const cssFileCandidates = [
    path.join(ctx.targetDir, 'src', 'app', 'globals.css'),    // Next.js with src/
    path.join(ctx.targetDir, 'app', 'globals.css'),            // Next.js without src/
    path.join(ctx.targetDir, 'src', 'styles', 'globals.css'), // Our generated structure
    path.join(ctx.targetDir, 'src', 'index.css'),              // Vite/React
    path.join(ctx.targetDir, 'src', 'styles.css'),             // Angular
    path.join(ctx.targetDir, 'assets', 'css', 'main.css'),    // Nuxt
  ];

  const tailwindCss = generateTailwindV4Css();

  // Write to all likely locations — the framework will pick up the right one
  for (const candidate of cssFileCandidates) {
    if (await pathExists(candidate)) {
      const { default: fse } = await import('fs-extra');
      const existing = await fse.readFile(candidate, 'utf-8');
      // Only prepend @import if not already present
      if (!existing.includes('@import "tailwindcss"')) {
        await fse.writeFile(candidate, tailwindCss + '\n' + existing.replace(/@tailwind\s+(base|components|utilities);?\n?/g, ''), 'utf-8');
      }
      return; // Found and updated existing file
    }
  }

  // If no existing CSS file found, write to our standard generated location
  const fallback = path.join(ctx.targetDir, 'src', 'styles', 'globals.css');
  await writeFile(fallback, tailwindCss);
}

/**
 * Generates Tailwind v4 CSS-first configuration.
 * This replaces tailwind.config.js entirely.
 */
export function generateTailwindV4Css(): string {
  return `/* ─── Tailwind CSS v4 ────────────────────────────────────────────────────────
   CSS-first configuration — no tailwind.config.js needed.
   All theme customization goes here via @theme.
   See: https://tailwindcss.com/docs/v4-beta
──────────────────────────────────────────────────────────────────────────── */
@import "tailwindcss";

@theme {
  /* ── Colors ──────────────────────────────────────────────────────────── */
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.145 0 0);
  --color-primary: oklch(0.623 0.214 255.67);       /* Indigo 500 */
  --color-primary-foreground: oklch(0.985 0.001 106.42);
  --color-secondary: oklch(0.97 0.001 106.42);
  --color-secondary-foreground: oklch(0.205 0.006 285.885);
  --color-muted: oklch(0.967 0.001 286.375);
  --color-muted-foreground: oklch(0.552 0.016 285.938);
  --color-accent: oklch(0.967 0.001 286.375);
  --color-accent-foreground: oklch(0.205 0.006 285.885);
  --color-destructive: oklch(0.577 0.245 27.325);   /* Red */
  --color-border: oklch(0.922 0.004 286.32);
  --color-input: oklch(0.922 0.004 286.32);
  --color-ring: oklch(0.623 0.214 255.67);
  --color-card: oklch(1 0 0);
  --color-card-foreground: oklch(0.145 0 0);
  --color-popover: oklch(1 0 0);
  --color-popover-foreground: oklch(0.145 0 0);

  /* ── Typography ──────────────────────────────────────────────────────── */
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --font-display: 'Cal Sans', 'Inter', sans-serif;

  /* ── Spacing & Radius ────────────────────────────────────────────────── */
  --radius: 0.625rem;
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  /* ── Shadows ─────────────────────────────────────────────────────────── */
  --shadow-sm: 0 1px 2px 0 oklch(0 0 0 / 0.05);
  --shadow: 0 1px 3px 0 oklch(0 0 0 / 0.1), 0 1px 2px -1px oklch(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -2px oklch(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px oklch(0 0 0 / 0.1), 0 4px 6px -4px oklch(0 0 0 / 0.1);
}

/* ── Dark mode via class strategy ────────────────────────────────────────── */
@custom-variant dark (&:where(.dark, .dark *));

@layer base {
  :root {
    color-scheme: light;
  }
  .dark {
    color-scheme: dark;
    --color-background: oklch(0.145 0 0);
    --color-foreground: oklch(0.985 0.001 106.42);
    --color-primary: oklch(0.623 0.214 255.67);
    --color-secondary: oklch(0.269 0.006 285.885);
    --color-muted: oklch(0.269 0.006 285.885);
    --color-muted-foreground: oklch(0.705 0.015 286.067);
    --color-border: oklch(0.269 0.006 285.885);
    --color-card: oklch(0.205 0.006 285.885);
    --color-card-foreground: oklch(0.985 0.001 106.42);
  }

  * {
    border-color: var(--color-border);
  }

  body {
    background-color: var(--color-background);
    color: var(--color-foreground);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
`;
}
