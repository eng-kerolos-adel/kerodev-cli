// src/core/parser.ts
import { WEB_FRAMEWORKS, CSS_FRAMEWORKS, UI_LIBRARIES, FLUTTER_ARCHITECTURES, FLUTTER_STATE_MANAGERS, WEB_STATE_MANAGERS, } from '../constants/index.js';
const FLAG_MAP = {
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
    '--src-dir': 'srcDir', // Next.js: use src/ directory
    '--no-src-dir': 'noSrcDir', // Next.js: don't use src/ directory
};
const PM_CHOICES = ['npm', 'pnpm', 'yarn', 'bun'];
export function parseArgs(argv) {
    const positional = [];
    const flags = {};
    let packageManager;
    let verbose = false;
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg.startsWith('--pm=')) {
            const pm = arg.split('=')[1];
            if (PM_CHOICES.includes(pm))
                packageManager = pm;
            continue;
        }
        if (arg === '--pm' && argv[i + 1]) {
            const pm = argv[++i];
            if (PM_CHOICES.includes(pm))
                packageManager = pm;
            continue;
        }
        if (FLAG_MAP[arg]) {
            if (arg === '--verbose')
                verbose = true;
            flags[FLAG_MAP[arg]] = true;
            continue;
        }
        positional.push(arg.toLowerCase());
    }
    const [projectName = '', ecosystemRaw = ''] = positional;
    const rest = positional.slice(2);
    const ecosystem = (ecosystemRaw === 'flutter' ? 'flutter' : 'web');
    return ecosystem === 'flutter'
        ? parseFlutterArgs(projectName, rest, flags, packageManager, verbose)
        : parseWebArgs(projectName, rest, flags, packageManager, verbose);
}
function parseWebArgs(projectName, tokens, flags, packageManager, verbose) {
    let framework;
    let css;
    let ui;
    let language;
    let stateManager;
    for (const token of tokens) {
        if (WEB_FRAMEWORKS.includes(token))
            framework = token;
        else if (CSS_FRAMEWORKS.includes(token))
            css = token;
        else if (UI_LIBRARIES.includes(token))
            ui = token;
        else if (token === 'ts' || token === 'typescript')
            language = 'ts';
        else if (token === 'js' || token === 'javascript')
            language = 'js';
        else if (WEB_STATE_MANAGERS.includes(token))
            stateManager = token;
    }
    return { projectName, ecosystem: 'web', framework, css, ui, language: language ?? 'ts', stateManager, flags, packageManager, verbose };
}
function parseFlutterArgs(projectName, tokens, flags, packageManager, verbose) {
    let architecture;
    let stateManager;
    for (const token of tokens) {
        if (FLUTTER_ARCHITECTURES.includes(token))
            architecture = token;
        else if (FLUTTER_STATE_MANAGERS.includes(token))
            stateManager = token;
    }
    return { projectName, ecosystem: 'flutter', architecture, stateManager, flags, packageManager, verbose };
}
//# sourceMappingURL=parser.js.map