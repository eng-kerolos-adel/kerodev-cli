// src/core/parser.ts

import type {
  ParsedArgs, Ecosystem, WebFramework, FlutterArchitecture,
  CSSFramework, UILibrary, Language, FlutterStateManager, StateManager,
  PackageManager
} from '../types/index.js';
import {
  WEB_FRAMEWORKS, CSS_FRAMEWORKS, UI_LIBRARIES,
  FLUTTER_ARCHITECTURES, FLUTTER_STATE_MANAGERS, WEB_STATE_MANAGERS,
} from '../constants/index.js';

const FLAG_MAP: Record<string, string> = {
  '--docker': 'docker',
  '--eslint': 'eslint',
  '--prettier': 'prettier',
  '--husky': 'husky',
  '--commitlint': 'commitlint',
  '--storybook': 'storybook',
  '--pwa': 'pwa',
  '--i18n': 'i18n',
  '--dark-mode': 'darkMode',
  '--auth': 'authStarter',
  '--firebase': 'firebase',
  '--supabase': 'supabase',
  '--git': 'git',
  '--no-git': 'noGit',
  '--ci': 'ci',
  '--playwright': 'playwright',
  '--cypress': 'cypress',
  '--jest': 'jest',
  '--vitest': 'vitest',
  '--verbose': 'verbose',
  '--src-dir': 'srcDir',          // Next.js: use src/ directory
  '--no-src-dir': 'noSrcDir',     // Next.js: don't use src/ directory
};

const PM_CHOICES: PackageManager[] = ['npm', 'pnpm', 'yarn', 'bun'];

export function parseArgs(argv: string[]): ParsedArgs {
  const positional: string[] = [];
  const flags: Record<string, boolean> = {};
  let packageManager: PackageManager | undefined;
  let verbose = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg.startsWith('--pm=')) {
      const pm = arg.split('=')[1] as PackageManager;
      if (PM_CHOICES.includes(pm)) packageManager = pm;
      continue;
    }
    if (arg === '--pm' && argv[i + 1]) {
      const pm = argv[++i] as PackageManager;
      if (PM_CHOICES.includes(pm)) packageManager = pm;
      continue;
    }
    if (FLAG_MAP[arg]) {
      if (arg === '--verbose') verbose = true;
      flags[FLAG_MAP[arg]] = true;
      continue;
    }
    positional.push(arg.toLowerCase());
  }

  const [projectName = '', ecosystemRaw = ''] = positional;
  const rest = positional.slice(2);
  const ecosystem = (ecosystemRaw === 'flutter' ? 'flutter' : 'web') as Ecosystem;

  return ecosystem === 'flutter'
    ? parseFlutterArgs(projectName, rest, flags, packageManager, verbose)
    : parseWebArgs(projectName, rest, flags, packageManager, verbose);
}

function parseWebArgs(
  projectName: string,
  tokens: string[],
  flags: Record<string, boolean>,
  packageManager: PackageManager | undefined,
  verbose: boolean
): ParsedArgs {
  let framework: WebFramework | undefined;
  let css: CSSFramework | undefined;
  let ui: UILibrary | undefined;
  let language: Language | undefined;
  let stateManager: StateManager | undefined;

  for (const token of tokens) {
    if (WEB_FRAMEWORKS.includes(token as WebFramework)) framework = token as WebFramework;
    else if (CSS_FRAMEWORKS.includes(token as CSSFramework)) css = token as CSSFramework;
    else if (UI_LIBRARIES.includes(token as UILibrary)) ui = token as UILibrary;
    else if (token === 'ts' || token === 'typescript') language = 'ts';
    else if (token === 'js' || token === 'javascript') language = 'js';
    else if (WEB_STATE_MANAGERS.includes(token as StateManager)) stateManager = token as StateManager;
  }

  return { projectName, ecosystem: 'web', framework, css, ui, language: language ?? 'ts', stateManager, flags, packageManager, verbose };
}

function parseFlutterArgs(
  projectName: string,
  tokens: string[],
  flags: Record<string, boolean>,
  packageManager: PackageManager | undefined,
  verbose: boolean
): ParsedArgs {
  let architecture: FlutterArchitecture | undefined;
  let stateManager: FlutterStateManager | undefined;

  for (const token of tokens) {
    if (FLUTTER_ARCHITECTURES.includes(token as FlutterArchitecture)) architecture = token as FlutterArchitecture;
    else if (FLUTTER_STATE_MANAGERS.includes(token as FlutterStateManager)) stateManager = token as FlutterStateManager;
  }

  return { projectName, ecosystem: 'flutter', architecture, stateManager, flags, packageManager, verbose };
}
