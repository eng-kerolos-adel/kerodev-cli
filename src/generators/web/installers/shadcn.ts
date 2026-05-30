// src/generators/web/installers/shadcn.ts
//
// ShadCN/UI initialization for Tailwind v4.
// ShadCN now supports Tailwind v4 natively.
// No tailwind.config.js is created or expected.

import path from 'path';
import type { GeneratorContext, WebProjectConfig } from '../../../types/index.js';
import { run } from '../../../utils/exec.js';
import { writeFile } from '../../../utils/fs.js';
import { getAddCommand } from '../../../utils/packageManager.js';

export async function installShadcn(ctx: GeneratorContext): Promise<void> {
  const cfg = ctx.config as WebProjectConfig;
  const pm = cfg.packageManager;
  const dlx = pm === 'npm' ? 'npx' :
    pm === 'pnpm' ? 'pnpm dlx' :
    pm === 'yarn' ? 'yarn dlx' : 'bunx';

  // Determine CSS file path based on framework + srcDir choice
  const cssPath = cfg.framework === 'next'
    ? (cfg.srcDir ? 'src/app/globals.css' : 'app/globals.css')
    : 'src/styles/globals.css';

  // Determine alias paths based on srcDir choice
  const aliasBase = cfg.framework === 'next' && !cfg.srcDir ? './*' : './src/*';

  // Write components.json — ShadCN v4 compatible config
  // NOTE: no tailwind.config reference — ShadCN v4 reads from CSS
  const componentsJson = {
    '$schema': 'https://ui.shadcn.com/schema.json',
    style: 'default',
    rsc: cfg.framework === 'next',
    tsx: cfg.language === 'ts',
    tailwind: {
      // ShadCN v4 uses the CSS file for configuration, not tailwind.config
      css: cssPath,
      baseColor: 'slate',
      cssVariables: true,
      prefix: '',
    },
    aliases: {
      components: '@/components',
      utils: '@/lib/utils',
      ui: '@/components/ui',
      lib: '@/lib',
      hooks: '@/hooks',
    },
    iconLibrary: 'lucide',
  };

  await writeFile(
    path.join(ctx.targetDir, 'components.json'),
    JSON.stringify(componentsJson, null, 2)
  );

  // Install core ShadCN dependencies
  await run(
    getAddCommand(pm, false, 'class-variance-authority', 'clsx', 'tailwind-merge', 'lucide-react'),
    { cwd: ctx.targetDir }
  );

  // Run shadcn init (non-interactive, uses components.json defaults)
  // shadcn@latest supports Tailwind v4 from v2.3+
  await run(`${dlx} shadcn@latest init --yes --defaults`, { cwd: ctx.targetDir });
}
