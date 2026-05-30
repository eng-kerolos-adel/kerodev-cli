#!/usr/bin/env node
// src/index.ts — KeroDev CLI entry point
import { Command } from 'commander';
import { CLI_NAME, CLI_VERSION, CLI_DESCRIPTION, CLI_WEBSITE } from './constants/index.js';
import { registerCreateCommand } from './commands/create.js';
import { registerListCommand } from './commands/list.js';
import { registerDoctorCommand } from './commands/doctor.js';
import { printHelpBanner, log } from './utils/ui.js';
import chalk from 'chalk';
const program = new Command();
program
    .name(CLI_NAME)
    .version(CLI_VERSION, '-v, --version', 'Output the current version')
    .description(CLI_DESCRIPTION)
    .addHelpText('before', () => { printHelpBanner(); return ''; })
    .addHelpText('after', `
${chalk.bold('Examples:')}
  ${chalk.cyan('kerodev create my-app web next tailwind shadcn ts')}
  ${chalk.cyan('kerodev create my-app web next ts')}                       ${chalk.dim('# No tailwind')}
  ${chalk.cyan('kerodev create my-app web next tailwind ts --no-src-dir')} ${chalk.dim('# No src/ folder')}
  ${chalk.cyan('kerodev create my-app web react bootstrap js --docker')}
  ${chalk.cyan('kerodev create my-app flutter riverpod clean --firebase')}
  ${chalk.cyan('kerodev create')}                    ${chalk.dim('# Interactive wizard')}
  ${chalk.cyan('kerodev list')}                      ${chalk.dim('# Show all options')}
  ${chalk.cyan('kerodev doctor')}                    ${chalk.dim('# Check system requirements')}
  ${chalk.cyan('kd create my-app web next tailwind shadcn ts')}            ${chalk.dim('# Short alias')}

${chalk.bold('Quick reference:')}
  ${chalk.dim('kerodev create <name> web <framework> [css] [ui] [ts|js] [flags]')}
  ${chalk.dim('kerodev create <name> flutter <state-manager> <architecture> [flags]')}

${chalk.bold('Tailwind CSS v4:')}
  ${chalk.dim('• No tailwind.config.js — CSS-first configuration via @theme')}
  ${chalk.dim('• Vite-based projects use @tailwindcss/vite plugin')}
  ${chalk.dim('• PostCSS-based (Next.js, Nuxt etc.) use @tailwindcss/postcss')}
  ${chalk.dim('• All customization in globals.css @theme block')}

${chalk.bold('Next.js options:')}
  ${chalk.dim('--src-dir     Use src/ directory (default: true in wizard)')}
  ${chalk.dim('--no-src-dir  Skip src/ directory')}

${chalk.bold('Flags:')}
  ${chalk.dim('--docker      Add Dockerfile + docker-compose.yml')}
  ${chalk.dim('--eslint      Add ESLint configuration')}
  ${chalk.dim('--prettier    Add Prettier configuration')}
  ${chalk.dim('--husky       Add Husky + lint-staged')}
  ${chalk.dim('--ci          Add GitHub Actions CI/CD')}
  ${chalk.dim('--firebase    Add Firebase integration')}
  ${chalk.dim('--supabase    Add Supabase integration')}
  ${chalk.dim('--no-git      Skip Git initialization')}
  ${chalk.dim('--pm <name>   Package manager: npm | pnpm | yarn | bun')}
  ${chalk.dim('--verbose     Verbose shell output')}

${chalk.dim(`${CLI_WEBSITE}`)}
`);
registerCreateCommand(program);
registerListCommand(program);
registerDoctorCommand(program);
program.action(() => program.help());
program.exitOverride();
try {
    await program.parseAsync(process.argv);
}
catch (err) {
    const error = err;
    if (error.code === 'commander.helpDisplayed' || error.code === 'commander.version') {
        process.exit(0);
    }
    if (error.code !== 'commander.unknownCommand') {
        log.error(error.message ?? 'An unexpected error occurred');
        process.exit(1);
    }
}
//# sourceMappingURL=index.js.map