// src/utils/packageManager.ts

import { execaCommand } from 'execa';
import which from 'which';
import type { PackageManager, PackageManagerInfo, WebFramework } from '../types/index.js';

const PM_CONFIGS: Record<PackageManager, Omit<PackageManagerInfo, 'available' | 'version'>> = {
  bun:  { name: 'bun',  installCmd: 'bun install',              addCmd: 'bun add',      addDevCmd: 'bun add -d',    runCmd: 'bun run',  dlxCmd: 'bunx' },
  pnpm: { name: 'pnpm', installCmd: 'pnpm install',             addCmd: 'pnpm add',     addDevCmd: 'pnpm add -D',   runCmd: 'pnpm run', dlxCmd: 'pnpm dlx' },
  yarn: { name: 'yarn', installCmd: 'yarn install',             addCmd: 'yarn add',     addDevCmd: 'yarn add -D',   runCmd: 'yarn',     dlxCmd: 'yarn dlx' },
  npm:  { name: 'npm',  installCmd: 'npm install',              addCmd: 'npm install',  addDevCmd: 'npm install -D',runCmd: 'npm run',  dlxCmd: 'npx' },
};

async function checkPM(name: PackageManager): Promise<PackageManagerInfo> {
  const config = PM_CONFIGS[name];
  try {
    await which(name);
    const { stdout } = await execaCommand(`${name} --version`);
    return { ...config, available: true, version: stdout.trim() };
  } catch {
    return { ...config, available: false };
  }
}

export async function detectPackageManagers(): Promise<PackageManagerInfo[]> {
  return Promise.all((['bun', 'pnpm', 'yarn', 'npm'] as PackageManager[]).map(checkPM));
}

export async function getPackageManagerInfo(pm: PackageManager): Promise<PackageManagerInfo> {
  return checkPM(pm);
}

export async function getDefaultPackageManager(): Promise<PackageManager> {
  const available = await detectPackageManagers();
  for (const pm of ['bun', 'pnpm', 'yarn', 'npm'] as PackageManager[]) {
    if (available.find(p => p.name === pm)?.available) return pm;
  }
  return 'npm';
}

/**
 * Builds the create-next-app command.
 * --tailwind is ONLY added when the user selected tailwind.
 * --src-dir is ONLY added when the user chose a src/ directory.
 */
export function getNextCreateCommand(
  pm: PackageManager,
  projectName: string,
  opts: {
    typescript: boolean;
    tailwind: boolean;
    eslint: boolean;
    srcDir: boolean;
  }
): string {
  const dlx = getDlx(pm);
  const flags = [
    opts.typescript ? '--typescript' : '--javascript',
    opts.tailwind ? '--tailwind' : '--no-tailwind',
    opts.eslint ? '--eslint' : '--no-eslint',
    '--app',
    opts.srcDir ? '--src-dir' : '--no-src-dir',
    '--import-alias "@/*"',
  ].join(' ');

  return `${dlx} create-next-app@latest ${projectName} ${flags}`;
}

/** Generic create commands for all other frameworks. */
export function getCreateCommand(
  pm: PackageManager,
  framework: string,
  projectName: string,
  opts?: { typescript?: boolean; tailwind?: boolean; srcDir?: boolean }
): string {
  const dlx = getDlx(pm);

  // Next.js is handled separately
  if (framework === 'next') {
    return getNextCreateCommand(pm, projectName, {
      typescript: opts?.typescript ?? true,
      tailwind: opts?.tailwind ?? false,
      eslint: true,
      srcDir: opts?.srcDir ?? false,
    });
  }

  const createMap: Record<string, string> = {
    react:     `${dlx} create-vite@latest ${projectName} --template ${opts?.typescript ? 'react-ts' : 'react'}`,
    vue:       `${dlx} create-vue@latest ${projectName}`,
    angular:   `${dlx} @angular/cli@latest new ${projectName} --routing --style=css`,
    vite:      `${dlx} create-vite@latest ${projectName} --template ${opts?.typescript ? 'react-ts' : 'react'}`,
    astro:     `${dlx} create-astro@latest ${projectName}`,
    sveltekit: `${dlx} sv@latest create ${projectName}`,
    remix:     `${dlx} create-remix@latest ${projectName}`,
    nuxt:      `${dlx} nuxi@latest init ${projectName}`,
  };

  return createMap[framework] ?? `${dlx} create-${framework}@latest ${projectName}`;
}

function getDlx(pm: PackageManager): string {
  return pm === 'npm' ? 'npx' :
    pm === 'pnpm' ? 'pnpm dlx' :
    pm === 'yarn' ? 'yarn dlx' : 'bunx';
}

export function getAddCommand(pm: PackageManager, dev: boolean, ...packages: string[]): string {
  const pkgList = packages.join(' ');
  if (dev) {
    return pm === 'npm' ? `npm install -D ${pkgList}` :
      pm === 'pnpm' ? `pnpm add -D ${pkgList}` :
      pm === 'yarn' ? `yarn add -D ${pkgList}` : `bun add -d ${pkgList}`;
  }
  return pm === 'npm' ? `npm install ${pkgList}` :
    pm === 'pnpm' ? `pnpm add ${pkgList}` :
    pm === 'yarn' ? `yarn add ${pkgList}` : `bun add ${pkgList}`;
}
