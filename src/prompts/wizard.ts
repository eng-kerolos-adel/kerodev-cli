// src/prompts/wizard.ts — KeroDev interactive setup wizard

import { input, select, checkbox, confirm } from '@inquirer/prompts';
import type {
  ProjectConfig, WebProjectConfig, FlutterProjectConfig,
  WebFeatureFlags, FlutterFeatureFlags, DevOpsConfig, PackageManager,
} from '../types/index.js';
import { detectPackageManagers } from '../utils/packageManager.js';
import { brand, log } from '../utils/ui.js';
import chalk from 'chalk';

export async function runWizard(): Promise<ProjectConfig> {
  log.info(chalk.bold('Interactive Setup Wizard'));
  log.dim('Answer a few questions to scaffold your project.\n');

  const name = await input({
    message: 'Project name:',
    default: 'my-app',
    validate: (v: string) =>
      /^[a-z][a-z0-9-_.]*$/.test(v) || 'Lowercase letters, numbers, hyphens only',
  });

  const ecosystem = await select<'web' | 'flutter'>({
    message: 'Project type:',
    choices: [
      { name: '🌐  Web Application', value: 'web' },
      { name: '📱  Flutter App', value: 'flutter' },
    ],
  });

  return ecosystem === 'flutter' ? runFlutterWizard(name) : runWebWizard(name);
}

async function runWebWizard(name: string): Promise<WebProjectConfig> {
  const framework = await select<WebProjectConfig['framework']>({
    message: 'Framework:',
    choices: [
      { name: '▲  Next.js', value: 'next' },
      { name: '⚛  React (Vite)', value: 'react' },
      { name: '💚  Vue', value: 'vue' },
      { name: '🔴  Angular', value: 'angular' },
      { name: '⚡  Vite (React)', value: 'vite' },
      { name: '🚀  Astro', value: 'astro' },
      { name: '🔥  SvelteKit', value: 'sveltekit' },
      { name: '💿  Remix', value: 'remix' },
      { name: '💚  Nuxt', value: 'nuxt' },
    ],
  });

  // ── Next.js: ask about src/ directory ─────────────────────────────────────
  let srcDir = false;
  if (framework === 'next') {
    srcDir = await confirm({
      message: 'Use src/ directory? (Next.js)',
      default: true,
    });
  }

  const language = await select<'ts' | 'js'>({
    message: 'Language:',
    choices: [
      { name: '📘 TypeScript', value: 'ts' },
      { name: '📙 JavaScript', value: 'js' },
    ],
    default: 'ts',
  });

  const css = await select<WebProjectConfig['css']>({
    message: 'CSS framework:',
    choices: [
      { name: '🌊 Tailwind CSS v4 (CSS-first, no config file)', value: 'tailwind' },
      { name: '🎨 Bootstrap', value: 'bootstrap' },
      { name: '💅 Sass/SCSS', value: 'sass' },
      { name: '💄 Styled Components', value: 'styled-components' },
      { name: '📦 CSS Modules', value: 'css-modules' },
      { name: '🚫 None', value: 'none' },
    ],
  });

  // UI library — filter by CSS compatibility
  const uiChoices = [
    ...(css === 'tailwind' ? [
      { name: '🎭 ShadCN/UI', value: 'shadcn' as const },
      { name: '🦸 Hero UI', value: 'heroui' as const },
    ] : []),
    { name: '📦 Material UI', value: 'mui' as const },
    { name: '🔮 Chakra UI', value: 'chakra' as const },
    { name: '🐜 Ant Design', value: 'antd' as const },
    { name: '🚫 None', value: 'none' as const },
  ];

  const ui = await select<WebProjectConfig['ui']>({
    message: 'UI Library:',
    choices: uiChoices,
  });

  const stateManager = await select<WebProjectConfig['stateManager']>({
    message: 'State management:',
    choices: [
      { name: '🗃  Redux Toolkit', value: 'redux' },
      { name: '🐻 Zustand', value: 'zustand' },
      { name: '🔮 Jotai', value: 'jotai' },
      { name: '📡 React Query', value: 'react-query' },
      { name: '🚫 None', value: 'none' },
    ],
  });

  const extras = await checkbox<string>({
    message: 'Extra tools (space to select):',
    choices: [
      { name: '🔍 ESLint', value: 'eslint', checked: true },
      { name: '✨ Prettier', value: 'prettier', checked: true },
      { name: '🐶 Husky + lint-staged', value: 'husky' },
      { name: '📝 Commitlint', value: 'commitlint' },
      { name: '📚 Storybook', value: 'storybook' },
      { name: '🌍 i18n', value: 'i18n' },
      { name: '🌙 Dark mode setup', value: 'darkMode' },
      { name: '🔐 Auth starter', value: 'authStarter' },
      { name: '🔥 Firebase', value: 'firebase' },
      { name: '🟢 Supabase', value: 'supabase' },
      { name: '📱 PWA support', value: 'pwa' },
    ],
  });

  const withDocker = await confirm({ message: 'Add Docker support?', default: false });
  const withCI = await confirm({ message: 'Add GitHub Actions CI/CD?', default: false });
  const withGit = await confirm({ message: 'Initialize Git?', default: true });

  const availablePMs = (await detectPackageManagers()).filter(p => p.available);
  const packageManager = await select<PackageManager>({
    message: 'Package manager:',
    choices: availablePMs.length > 0
      ? availablePMs.map(p => ({ name: `${p.name} ${p.version ? chalk.dim(`(${p.version})`) : ''}`, value: p.name as PackageManager }))
      : [{ name: 'npm', value: 'npm' as PackageManager }],
  });

  const extSet = new Set(extras);
  const features: WebFeatureFlags = {
    eslint: extSet.has('eslint'),
    prettier: extSet.has('prettier'),
    husky: extSet.has('husky'),
    commitlint: extSet.has('commitlint'),
    storybook: extSet.has('storybook'),
    pwa: extSet.has('pwa'),
    i18n: extSet.has('i18n'),
    darkMode: extSet.has('darkMode'),
    authStarter: extSet.has('authStarter'),
    firebase: extSet.has('firebase'),
    supabase: extSet.has('supabase'),
    docker: withDocker,
    git: withGit,
  };

  return {
    name,
    ecosystem: 'web',
    framework,
    language,
    css,
    ui,
    stateManager,
    testing: 'none',
    packageManager,
    srcDir,
    features,
    devops: { docker: withDocker, ci: withCI ? 'github' : 'none', deployTarget: 'none' },
  };
}

async function runFlutterWizard(name: string): Promise<FlutterProjectConfig> {
  const architecture = await select<FlutterProjectConfig['architecture']>({
    message: 'Architecture:',
    choices: [
      { name: '🏗  Clean Architecture', value: 'clean' },
      { name: '🧩  Feature-First', value: 'feature-first' },
      { name: '📚  Layered Architecture', value: 'layered' },
      { name: '🔄  MVC', value: 'mvc' },
      { name: '👁  MVVM', value: 'mvvm' },
      { name: '🔌  Modular', value: 'modular' },
    ],
  });

  const stateManager = await select<FlutterProjectConfig['stateManager']>({
    message: 'State management:',
    choices: [
      { name: '🎯 Riverpod', value: 'riverpod' },
      { name: '🧱 BLoC', value: 'bloc' },
      { name: '🧊 Cubit', value: 'cubit' },
      { name: '⚡ GetX', value: 'getx' },
      { name: '🔌 Provider', value: 'provider' },
    ],
  });

  const extras = await checkbox<string>({
    message: 'Integrations:',
    choices: [
      { name: '🌐 Dio (HTTP client)', value: 'dio', checked: true },
      { name: '📡 GoRouter (navigation)', value: 'goRouter', checked: true },
      { name: '🔥 Firebase', value: 'firebase' },
      { name: '🟢 Supabase', value: 'supabase' },
      { name: '🌍 Localization', value: 'localization' },
      { name: '🎭 Flavor system', value: 'flavors' },
      { name: '🐝 Hive (local DB)', value: 'hive' },
      { name: '💎 Isar (local DB)', value: 'isar' },
    ],
  });

  const withDocker = await confirm({ message: 'Add Docker support?', default: false });
  const withCI = await confirm({ message: 'Add GitHub Actions CI/CD?', default: false });
  const withGit = await confirm({ message: 'Initialize Git?', default: true });

  const extSet = new Set(extras);
  const features: FlutterFeatureFlags = {
    firebase: extSet.has('firebase'),
    supabase: extSet.has('supabase'),
    goRouter: extSet.has('goRouter'),
    localization: extSet.has('localization'),
    flavors: extSet.has('flavors'),
    hive: extSet.has('hive'),
    isar: extSet.has('isar'),
    dio: extSet.has('dio'),
    retrofit: false,
    docker: withDocker,
    git: withGit,
  };

  return {
    name,
    ecosystem: 'flutter',
    architecture,
    stateManager,
    features,
    devops: { docker: withDocker, ci: withCI ? 'github' : 'none' },
  };
}
