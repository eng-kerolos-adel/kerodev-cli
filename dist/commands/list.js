// src/commands/list.ts
import chalk from 'chalk';
import { brand, log } from '../utils/ui.js';
import Table from 'cli-table3';
export function registerListCommand(program) {
    program
        .command('list')
        .alias('ls')
        .description('List all supported frameworks, UI libraries, and integrations')
        .action(() => {
        brand.header();
        printSection('🌐 Web Frameworks', [
            ['next', 'Next.js', 'React meta-framework — App Router, SSR/SSG, RSC'],
            ['react', 'React (Vite)', 'React UI library scaffolded with Vite'],
            ['vue', 'Vue', 'Progressive JS framework'],
            ['angular', 'Angular', 'Enterprise-grade full framework'],
            ['vite', 'Vite', 'Lightning-fast React + Vite'],
            ['astro', 'Astro', 'Content-first, islands architecture'],
            ['sveltekit', 'SvelteKit', 'Compiler-based meta-framework'],
            ['remix', 'Remix', 'Full-stack React with nested routes'],
            ['nuxt', 'Nuxt', 'Vue meta-framework with SSR/SSG'],
        ]);
        printSection('📱 Flutter Architectures', [
            ['clean', 'Clean Architecture', 'Domain / Data / Presentation layers'],
            ['feature-first', 'Feature-First', 'Self-contained feature modules'],
            ['layered', 'Layered', 'Presentation / Domain / Data separation'],
            ['mvc', 'MVC', 'Model-View-Controller'],
            ['mvvm', 'MVVM', 'Model-View-ViewModel'],
            ['modular', 'Modular', 'Plugin-style module system'],
        ]);
        printSection('🎨 CSS Frameworks', [
            ['tailwind', 'Tailwind CSS v4', 'CSS-first config — no tailwind.config.js'],
            ['bootstrap', 'Bootstrap', 'Component-based CSS framework'],
            ['sass', 'Sass/SCSS', 'CSS preprocessor'],
            ['styled-components', 'Styled Components', 'CSS-in-JS for React'],
            ['css-modules', 'CSS Modules', 'Scoped CSS modules'],
            ['none', 'None', 'Plain CSS / your own setup'],
        ]);
        printSection('🧩 UI Libraries', [
            ['shadcn', 'ShadCN/UI', 'Copy-paste components — requires Tailwind v4'],
            ['heroui', 'Hero UI', 'Beautiful components — requires Tailwind v4'],
            ['mui', 'Material UI', 'Google Material Design'],
            ['chakra', 'Chakra UI', 'Accessible component library'],
            ['antd', 'Ant Design', 'Enterprise React components'],
        ]);
        printSection('📦 State Management (Web)', [
            ['redux', 'Redux Toolkit', 'Predictable global state container'],
            ['zustand', 'Zustand', 'Small, fast, scalable'],
            ['jotai', 'Jotai', 'Atomic state management'],
            ['react-query', 'React Query', 'Server state & async data fetching'],
            ['none', 'None', 'No state library'],
        ]);
        printSection('⚡ State Management (Flutter)', [
            ['riverpod', 'Riverpod', 'Reactive caching and data-binding'],
            ['bloc', 'BLoC', 'Business Logic Component pattern'],
            ['cubit', 'Cubit', 'Simplified BLoC without events'],
            ['getx', 'GetX', 'Microframework — state + routing + DI'],
            ['provider', 'Provider', 'Official Flutter state solution'],
        ]);
        printSection('📦 Package Managers', [
            ['npm', 'npm', 'Default Node.js package manager'],
            ['pnpm', 'pnpm', 'Fast, disk-efficient package manager (recommended)'],
            ['yarn', 'yarn', 'Yarn Classic / Yarn Berry'],
            ['bun', 'bun', 'All-in-one JS runtime & package manager'],
        ]);
        log.blank();
        log.section('💡 Example commands');
        const examples = [
            'kerodev create my-app web next tailwind shadcn ts',
            'kerodev create my-app web next ts                    # No tailwind',
            'kerodev create my-app web next tailwind ts --no-src-dir',
            'kerodev create my-shop web react bootstrap ts --docker --ci',
            'kerodev create dashboard web vite tailwind ts --pm pnpm --eslint',
            'kerodev create my-mobile flutter riverpod clean --firebase',
            'kerodev create social-app flutter bloc modular --supabase --ci',
            'kd create my-app web next tailwind shadcn ts         # Short alias',
        ];
        examples.forEach(e => console.log(chalk.dim(`  ${e}`)));
        log.blank();
        log.section('🌊 Tailwind CSS v4 — CSS-first (no tailwind.config.js)');
        console.log(chalk.dim('  Vite-based  (react, vite, astro, sveltekit) → @tailwindcss/vite plugin'));
        console.log(chalk.dim('  PostCSS     (next, nuxt, angular, remix, vue) → @tailwindcss/postcss'));
        console.log(chalk.dim('  Customize   via @theme {} in your globals.css — not a config file'));
        log.blank();
    });
}
function printSection(title, rows) {
    log.blank();
    console.log(chalk.bold.cyan(title));
    const table = new Table({
        style: { head: ['cyan'], border: ['dim'] },
        head: [chalk.bold('Key'), chalk.bold('Name'), chalk.bold('Description')],
        colWidths: [20, 22, 50],
        chars: {
            top: '─', 'top-mid': '┬', 'top-left': '┌', 'top-right': '┐',
            bottom: '─', 'bottom-mid': '┴', 'bottom-left': '└', 'bottom-right': '┘',
            left: '│', 'left-mid': '├', mid: '─', 'mid-mid': '┼',
            right: '│', 'right-mid': '┤', middle: '│',
        },
    });
    for (const [key, name, desc] of rows) {
        table.push([chalk.cyan(key), chalk.white(name), chalk.dim(desc)]);
    }
    console.log(table.toString());
}
//# sourceMappingURL=list.js.map