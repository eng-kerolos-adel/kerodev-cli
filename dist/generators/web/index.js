// src/generators/web/index.ts — KeroDev web project orchestrator
import path from 'path';
import { log, createSpinner, printSuccessScreen } from '../../utils/ui.js';
import { run } from '../../utils/exec.js';
import { writeFile, pathExists } from '../../utils/fs.js';
import { getCreateCommand, getAddCommand } from '../../utils/packageManager.js';
import { generateEslintConfig } from './configs/eslint.js';
import { generatePrettierConfig } from './configs/prettier.js';
import { generateViteConfig } from './configs/vite.js';
import { generateNextConfig } from './configs/next.js';
import { generateDockerFiles } from './configs/docker.js';
import { generateGitHubActions } from './configs/cicd.js';
import { generateWebReadme } from './readme.js';
import { generateEnvFiles } from './configs/env.js';
import { generateWebFolderStructure } from './structure.js';
import { installShadcn } from './installers/shadcn.js';
import { installTailwind } from './installers/tailwind.js';
import { installI18n } from './installers/i18n.js';
import { installFirebase } from './installers/firebase.js';
import { installSupabase } from './installers/supabase.js';
import { initGit } from '../shared/git.js';
import { generateTsConfig } from './configs/tsconfig.js';
const TOTAL_STEPS = 10;
export async function generateWebProject(config) {
    const targetDir = path.resolve(process.cwd(), config.name);
    const ctx = {
        config,
        targetDir,
        templateDir: path.resolve(new URL(import.meta.url).pathname, '../../../templates/web'),
        verbose: false,
    };
    // ── Step 1: Scaffold base framework ──────────────────────────────────────
    log.step(1, TOTAL_STEPS, 'Scaffolding base project');
    const s1 = createSpinner(`Creating ${config.framework} project...`);
    s1.start();
    try {
        const createCmd = getCreateCommand(config.packageManager, config.framework, config.name, {
            typescript: config.language === 'ts',
            tailwind: config.framework === 'next' && config.css === 'tailwind',
            srcDir: config.srcDir,
        });
        await run(createCmd, { verbose: false });
        s1.succeed(`${config.framework} project scaffolded`);
    }
    catch (err) {
        s1.fail('Framework scaffolding failed');
        throw err;
    }
    // ── Step 2: Folder structure ──────────────────────────────────────────────
    log.step(2, TOTAL_STEPS, 'Generating folder structure');
    const s2 = createSpinner('Creating scalable architecture...');
    s2.start();
    await generateWebFolderStructure(ctx);
    s2.succeed('Folder structure created');
    // ── Step 3: Config files ──────────────────────────────────────────────────
    log.step(3, TOTAL_STEPS, 'Writing configuration files');
    const s3 = createSpinner('Generating configs...');
    s3.start();
    await writeConfigs(ctx);
    s3.succeed('Configuration files generated');
    // ── Step 4: Tailwind CSS v4 ───────────────────────────────────────────────
    log.step(4, TOTAL_STEPS, 'Setting up CSS');
    if (config.css === 'tailwind') {
        const s4 = createSpinner('Installing Tailwind CSS v4...');
        s4.start();
        try {
            await installTailwind(ctx);
            s4.succeed('Tailwind CSS v4 configured (CSS-first, no tailwind.config.js)');
        }
        catch {
            s4.warn('Tailwind setup skipped — configure manually');
        }
    }
    else {
        log.success(`${config.css !== 'none' ? config.css : 'Plain CSS'} — ready`);
    }
    // ── Step 5: UI Library ────────────────────────────────────────────────────
    log.step(5, TOTAL_STEPS, 'Installing UI library');
    if (config.ui === 'shadcn') {
        const s5 = createSpinner('Initializing ShadCN/UI...');
        s5.start();
        try {
            await installShadcn(ctx);
            s5.succeed('ShadCN/UI initialized');
        }
        catch {
            s5.warn('ShadCN init skipped — run "npx shadcn@latest init" manually');
        }
    }
    else if (config.ui !== 'none') {
        await installUiLibrary(ctx);
    }
    else {
        log.success('No UI library selected');
    }
    // ── Step 6: Firebase ──────────────────────────────────────────────────────
    log.step(6, TOTAL_STEPS, 'Setting up integrations');
    if (config.features.firebase) {
        const s6 = createSpinner('Installing Firebase Authentication + Firestore + Storage...');
        s6.start();
        try {
            await installFirebase(ctx);
            s6.succeed('Firebase configured (Auth, Firestore, Storage + Login/Register pages)');
        }
        catch (err) {
            s6.warn('Firebase setup skipped — install manually');
            log.dim(String(err));
        }
    }
    // ── Step 7: Supabase ──────────────────────────────────────────────────────
    if (config.features.supabase) {
        const s7 = createSpinner('Installing Supabase (Auth + Database + SSR)...');
        s7.start();
        try {
            await installSupabase(ctx);
            s7.succeed('Supabase configured (Auth, Database types, SSR helpers + Login/Register pages)');
        }
        catch (err) {
            s7.warn('Supabase setup skipped — install manually');
            log.dim(String(err));
        }
    }
    // ── Step 8: i18n ─────────────────────────────────────────────────────────
    log.step(7, TOTAL_STEPS, 'Setting up i18n');
    if (config.features.i18n) {
        const s8 = createSpinner('Installing i18n (Arabic + English with RTL support)...');
        s8.start();
        try {
            await installI18n(ctx);
            s8.succeed('i18n configured (Arabic + English, RTL support, LanguageSwitcher component)');
        }
        catch (err) {
            s8.warn('i18n setup skipped — install manually');
            log.dim(String(err));
        }
    }
    else {
        log.success('i18n not selected');
    }
    // ── Step 9: DevOps ────────────────────────────────────────────────────────
    log.step(8, TOTAL_STEPS, 'Setting up DevOps');
    await setupDevOps(ctx);
    // ── Step 10: Git ──────────────────────────────────────────────────────────
    log.step(9, TOTAL_STEPS, 'Initializing Git');
    if (config.features.git) {
        const s9 = createSpinner('Initializing Git repository...');
        s9.start();
        try {
            await initGit(targetDir, config.name);
            s9.succeed('Git initialized with initial commit');
        }
        catch {
            s9.warn('Git initialization skipped');
        }
    }
    // ── Step 11: README ───────────────────────────────────────────────────────
    log.step(10, TOTAL_STEPS, 'Generating README');
    const sReadme = createSpinner('Writing README.md...');
    sReadme.start();
    const readme = generateWebReadme(config);
    await writeFile(path.join(targetDir, 'README.md'), readme);
    sReadme.succeed('README.md generated');
    // ── Done ──────────────────────────────────────────────────────────────────
    const runCmd = config.packageManager === 'npm' ? 'npm run dev' : `${config.packageManager} dev`;
    printSuccessScreen(config.name, config.framework, config.packageManager, [
        `Open:    ${config.name}/`,
        `Run:     ${runCmd}`,
        ...(config.ui === 'shadcn' ? ['ShadCN:  npx shadcn@latest add button'] : []),
        ...(config.css === 'tailwind' ? ['Theme:   edit globals.css → @theme {}'] : []),
        ...(config.features.firebase ? ['Firebase: fill NEXT_PUBLIC_FIREBASE_* in .env.local'] : []),
        ...(config.features.supabase ? ['Supabase: fill NEXT_PUBLIC_SUPABASE_* in .env.local'] : []),
        ...(config.features.i18n ? ['i18n:    add translations in /messages/en.json + /messages/ar.json'] : []),
    ].filter(Boolean));
}
// ─── Config Writer ────────────────────────────────────────────────────────────
async function writeConfigs(ctx) {
    const { config, targetDir } = ctx;
    const cfg = config;
    const jobs = [];
    // TypeScript (not for Next.js — create-next-app handles it)
    if (cfg.language === 'ts' && cfg.framework !== 'next') {
        jobs.push(writeFile(path.join(targetDir, 'tsconfig.json'), generateTsConfig(cfg.framework)));
    }
    // ESLint (not for Next.js — create-next-app handles it)
    if (cfg.features.eslint && cfg.framework !== 'next') {
        jobs.push(writeFile(path.join(targetDir, 'eslint.config.js'), generateEslintConfig(cfg)));
    }
    // Prettier
    if (cfg.features.prettier) {
        jobs.push(writeFile(path.join(targetDir, '.prettierrc'), generatePrettierConfig(cfg)));
        jobs.push(writeFile(path.join(targetDir, '.prettierignore'), 'node_modules\ndist\n.next\nbuild\n'));
    }
    // Vite config
    if (['vite', 'react'].includes(cfg.framework)) {
        jobs.push(writeFile(path.join(targetDir, 'vite.config.ts'), generateViteConfig(cfg)));
    }
    // Next.js config
    if (cfg.framework === 'next') {
        jobs.push(writeFile(path.join(targetDir, 'next.config.ts'), generateNextConfig(cfg)));
    }
    // Env files
    const [envLocal, envExample] = generateEnvFiles(cfg);
    jobs.push(writeFile(path.join(targetDir, '.env.local'), envLocal));
    jobs.push(writeFile(path.join(targetDir, '.env.example'), envExample));
    // .gitignore
    jobs.push(writeFile(path.join(targetDir, '.gitignore'), generateGitignore(cfg.framework)));
    // Enhance package.json scripts
    jobs.push(enhancePackageJson(ctx));
    await Promise.all(jobs);
}
async function enhancePackageJson(ctx) {
    const pkgPath = path.join(ctx.targetDir, 'package.json');
    if (!(await pathExists(pkgPath)))
        return;
    const { default: fse } = await import('fs-extra');
    const pkg = await fse.readJSON(pkgPath);
    const cfg = ctx.config;
    pkg.scripts = {
        ...pkg.scripts,
        ...(cfg.features.eslint ? { lint: 'eslint . --ext .ts,.tsx,.js,.jsx' } : {}),
        ...(cfg.features.prettier ? { format: 'prettier --write .' } : {}),
        ...(cfg.language === 'ts' ? { 'type-check': 'tsc --noEmit' } : {}),
    };
    await fse.writeJSON(pkgPath, pkg, { spaces: 2 });
}
async function installUiLibrary(ctx) {
    const cfg = ctx.config;
    const pm = cfg.packageManager;
    const s = createSpinner(`Installing ${cfg.ui}...`);
    s.start();
    const pkgMap = {
        mui: ['@mui/material', '@emotion/react', '@emotion/styled'],
        chakra: ['@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion'],
        antd: ['antd'],
        heroui: ['@heroui/react', 'framer-motion'],
    };
    const pkgs = pkgMap[cfg.ui];
    if (!pkgs) {
        s.warn(`${cfg.ui} install skipped`);
        return;
    }
    try {
        await run(getAddCommand(pm, false, ...pkgs), { cwd: ctx.targetDir });
        s.succeed(`${cfg.ui} installed`);
    }
    catch {
        s.warn(`${cfg.ui} install failed — run manually`);
    }
}
async function setupDevOps(ctx) {
    const cfg = ctx.config;
    const jobs = [];
    if (cfg.devops.docker) {
        const [dockerfile, compose] = generateDockerFiles(cfg);
        jobs.push(writeFile(path.join(ctx.targetDir, 'Dockerfile'), dockerfile));
        jobs.push(writeFile(path.join(ctx.targetDir, 'docker-compose.yml'), compose));
        jobs.push(writeFile(path.join(ctx.targetDir, '.dockerignore'), 'node_modules\n.next\ndist\n.git\n'));
        log.success('Docker files generated');
    }
    if (cfg.devops.ci === 'github') {
        const workflow = generateGitHubActions(cfg);
        jobs.push(writeFile(path.join(ctx.targetDir, '.github/workflows/ci.yml'), workflow));
        log.success('GitHub Actions workflow generated');
    }
    await Promise.all(jobs);
}
function generateGitignore(framework) {
    return `# Dependencies
node_modules/
.pnp
.pnp.js

# Build
dist/
build/
out/
.next/
.nuxt/
.svelte-kit/

# Environment
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*

# Editor
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db
`;
}
//# sourceMappingURL=index.js.map