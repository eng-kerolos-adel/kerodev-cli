// src/commands/create.ts — KeroDev create command
import { parseArgs } from '../core/parser.js';
import { buildProjectConfig } from '../core/configBuilder.js';
import { runWizard } from '../prompts/wizard.js';
import { validateEnvironment, validateWebConfig, validateProjectName, mergeValidations } from '../validators/index.js';
import { generateWebProject } from '../generators/web/index.js';
import { generateFlutterProject } from '../generators/flutter/index.js';
import { brand, log, box, printKeyValueTable, printErrorScreen } from '../utils/ui.js';
import { FRAMEWORK_DISPLAY_NAMES } from '../constants/index.js';
export function registerCreateCommand(program) {
    program
        .command('create [projectName] [ecosystem] [args...]')
        .description('Scaffold a new project')
        .option('--docker', 'Add Docker support')
        .option('--eslint', 'Add ESLint')
        .option('--prettier', 'Add Prettier')
        .option('--husky', 'Add Husky + lint-staged')
        .option('--ci', 'Add GitHub Actions CI/CD')
        .option('--firebase', 'Add Firebase integration')
        .option('--supabase', 'Add Supabase integration')
        .option('--no-git', 'Skip Git initialization')
        .option('--src-dir', 'Use src/ directory (Next.js)')
        .option('--no-src-dir', 'Skip src/ directory (Next.js)')
        .option('--pm <manager>', 'Package manager (npm|pnpm|yarn|bun)')
        .option('--verbose', 'Verbose output')
        .allowUnknownOption()
        .action(async (projectName, ecosystem, extraArgs, opts) => {
        brand.header();
        try {
            let config;
            // ── Interactive mode ──────────────────────────────────────────────
            if (!projectName) {
                config = await runWizard();
            }
            else {
                // ── CLI mode ──────────────────────────────────────────────────
                const rawArgs = [
                    projectName,
                    ecosystem ?? 'web',
                    ...extraArgs,
                    ...(opts.docker ? ['--docker'] : []),
                    ...(opts.eslint ? ['--eslint'] : []),
                    ...(opts.prettier ? ['--prettier'] : []),
                    ...(opts.husky ? ['--husky'] : []),
                    ...(opts.ci ? ['--ci'] : []),
                    ...(opts.firebase ? ['--firebase'] : []),
                    ...(opts.supabase ? ['--supabase'] : []),
                    ...(opts.git === false ? ['--no-git'] : []),
                    ...(opts.srcDir === true ? ['--src-dir'] : []),
                    ...(opts.srcDir === false ? ['--no-src-dir'] : []),
                    ...(opts.verbose ? ['--verbose'] : []),
                ];
                const parsed = parseArgs(rawArgs);
                if (opts.pm)
                    parsed.packageManager = opts.pm;
                config = await buildProjectConfig(parsed);
            }
            // ── Validate ──────────────────────────────────────────────────────
            log.section('Validating configuration');
            const combined = mergeValidations(validateProjectName(config.name), await validateEnvironment(config), config.ecosystem === 'web' ? validateWebConfig(config) : { valid: true, errors: [], warnings: [] });
            if (!combined.valid) {
                printErrorScreen('Configuration Error', 'Issues found:', combined.errors);
                process.exit(1);
            }
            if (combined.warnings.length > 0) {
                box.warn('Warnings', combined.warnings.map(w => `• ${w}`).join('\n'));
            }
            printConfigSummary(config);
            // ── Generate ──────────────────────────────────────────────────────
            log.blank();
            log.section('Generating project');
            if (config.ecosystem === 'web') {
                await generateWebProject(config);
            }
            else {
                await generateFlutterProject(config);
            }
        }
        catch (err) {
            const error = err;
            printErrorScreen('Generation Failed', error.message, [
                'Check all required tools are installed',
                'Run with --verbose for detailed output',
                'Run: kerodev doctor',
            ]);
            if (process.env['DEBUG'])
                console.error(err);
            process.exit(1);
        }
    });
}
function printConfigSummary(config) {
    log.section('Project Summary');
    if (config.ecosystem === 'web') {
        const cfg = config;
        printKeyValueTable([
            ['Project', cfg.name],
            ['Ecosystem', 'Web'],
            ['Framework', FRAMEWORK_DISPLAY_NAMES[cfg.framework] ?? cfg.framework],
            ['Language', cfg.language === 'ts' ? 'TypeScript' : 'JavaScript'],
            ['CSS', cfg.css !== 'none' ? (FRAMEWORK_DISPLAY_NAMES[cfg.css] ?? cfg.css) : '—'],
            ['UI Library', cfg.ui !== 'none' ? (FRAMEWORK_DISPLAY_NAMES[cfg.ui] ?? cfg.ui) : '—'],
            ['State', cfg.stateManager !== 'none' ? cfg.stateManager : '—'],
            ['PM', cfg.packageManager],
            ...(cfg.framework === 'next' ? [['src/ dir', cfg.srcDir ? '✓ Yes' : '✗ No']] : []),
            ['ESLint', cfg.features.eslint ? '✓' : '✗'],
            ['Prettier', cfg.features.prettier ? '✓' : '✗'],
            ['Docker', cfg.devops.docker ? '✓' : '✗'],
            ['CI/CD', cfg.devops.ci !== 'none' ? cfg.devops.ci : '—'],
            ['Git', cfg.features.git ? '✓' : '✗'],
        ]);
    }
    else {
        const cfg = config;
        printKeyValueTable([
            ['Project', cfg.name],
            ['Ecosystem', 'Flutter'],
            ['Architecture', FRAMEWORK_DISPLAY_NAMES[cfg.architecture] ?? cfg.architecture],
            ['State', FRAMEWORK_DISPLAY_NAMES[cfg.stateManager] ?? cfg.stateManager],
            ['Firebase', cfg.features.firebase ? '✓' : '✗'],
            ['GoRouter', cfg.features.goRouter ? '✓' : '✗'],
            ['Docker', cfg.devops.docker ? '✓' : '✗'],
            ['CI/CD', cfg.devops.ci !== 'none' ? cfg.devops.ci : '—'],
        ]);
    }
}
//# sourceMappingURL=create.js.map