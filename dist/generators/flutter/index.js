// src/generators/flutter/index.ts
import path from 'path';
import { log, createSpinner, printSuccessScreen } from '../../utils/ui.js';
import { run } from '../../utils/exec.js';
import { writeFile } from '../../utils/fs.js';
import { initGit } from '../shared/git.js';
import { generateFlutterStructure } from './structure.js';
import { generatePubspec } from './configs/pubspec.js';
import { generateFlutterReadme } from './readme.js';
import { generateAnalysisOptions } from './configs/analysis.js';
import { generateFlutterDockerFiles } from './configs/docker.js';
import { generateFlutterGitHubActions } from './configs/cicd.js';
import { generateMainDart, generateAppDart } from './stubs/app.js';
import { generateRouterStub } from './stubs/router.js';
import { generateThemeStub } from './stubs/theme.js';
export async function generateFlutterProject(config) {
    const targetDir = path.resolve(process.cwd(), config.name);
    const ctx = {
        config,
        targetDir,
        templateDir: path.resolve(new URL(import.meta.url).pathname, '../../../templates/flutter'),
        verbose: false,
    };
    // ── Step 1: Flutter create ────────────────────────────────────────────────
    log.step(1, 7, 'Creating Flutter project');
    const s1 = createSpinner('Running flutter create...');
    s1.start();
    try {
        await run(`flutter create --org com.example --project-name ${config.name.replace(/-/g, '_')} ${config.name}`, { verbose: false });
        s1.succeed('Flutter project created');
    }
    catch (err) {
        s1.fail('Flutter create failed — is Flutter installed and in PATH?');
        throw err;
    }
    // ── Step 2: Architecture folder structure ─────────────────────────────────
    log.step(2, 7, `Generating ${config.architecture} folder structure`);
    const s2 = createSpinner('Building architecture scaffold...');
    s2.start();
    await generateFlutterStructure(ctx);
    s2.succeed('Architecture folder structure created');
    // ── Step 3: pubspec.yaml ──────────────────────────────────────────────────
    log.step(3, 7, 'Configuring dependencies');
    const s3 = createSpinner('Writing pubspec.yaml...');
    s3.start();
    const pubspec = generatePubspec(config);
    await writeFile(path.join(targetDir, 'pubspec.yaml'), pubspec);
    s3.succeed('pubspec.yaml generated');
    // ── Step 4: Core stubs ───────────────────────────────────────────────────
    log.step(4, 7, 'Generating starter code');
    const s4 = createSpinner('Writing Dart stubs...');
    s4.start();
    await writeFlutterStubs(ctx);
    s4.succeed('Dart starter files written');
    // ── Step 5: DevOps ───────────────────────────────────────────────────────
    log.step(5, 7, 'Setting up DevOps');
    await setupFlutterDevOps(ctx);
    // ── Step 6: Git ──────────────────────────────────────────────────────────
    log.step(6, 7, 'Initializing Git');
    if (config.features.git) {
        const s6 = createSpinner('Initializing Git...');
        s6.start();
        try {
            await initGit(targetDir, config.name);
            s6.succeed('Git initialized');
        }
        catch {
            s6.warn('Git init skipped');
        }
    }
    // ── Step 7: README ───────────────────────────────────────────────────────
    log.step(7, 7, 'Generating documentation');
    const s7 = createSpinner('Writing README...');
    s7.start();
    const readme = generateFlutterReadme(config);
    await writeFile(path.join(targetDir, 'README.md'), readme);
    s7.succeed('README.md generated');
    printSuccessScreen(config.name, `Flutter (${config.architecture})`, 'flutter', [
        `Install deps: flutter pub get`,
        `Run app:      flutter run`,
        `Analyze:      flutter analyze`,
    ]);
}
async function writeFlutterStubs(ctx) {
    const cfg = ctx.config;
    const libDir = path.join(ctx.targetDir, 'lib');
    const safeProjectName = cfg.name.replace(/-/g, '_');
    const jobs = [
        writeFile(path.join(libDir, 'main.dart'), generateMainDart(cfg, safeProjectName)),
        writeFile(path.join(libDir, 'app.dart'), generateAppDart(cfg)),
        writeFile(path.join(libDir, 'core/theme/app_theme.dart'), generateThemeStub()),
        writeFile(path.join(libDir, 'core/router/app_router.dart'), generateRouterStub(cfg)),
        writeFile(path.join(ctx.targetDir, 'analysis_options.yaml'), generateAnalysisOptions()),
    ];
    await Promise.all(jobs);
}
async function setupFlutterDevOps(ctx) {
    const cfg = ctx.config;
    const jobs = [];
    if (cfg.devops.docker) {
        const [dockerfile, compose] = generateFlutterDockerFiles(cfg);
        jobs.push(writeFile(path.join(ctx.targetDir, 'Dockerfile'), dockerfile));
        jobs.push(writeFile(path.join(ctx.targetDir, 'docker-compose.yml'), compose));
        log.success('Docker files generated');
    }
    if (cfg.devops.ci === 'github') {
        const workflow = generateFlutterGitHubActions(cfg);
        jobs.push(writeFile(path.join(ctx.targetDir, '.github/workflows/ci.yml'), workflow));
        log.success('GitHub Actions CI generated');
    }
    await Promise.all(jobs);
}
//# sourceMappingURL=index.js.map