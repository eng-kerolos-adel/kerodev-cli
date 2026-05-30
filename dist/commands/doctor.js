// src/commands/doctor.ts
// Checks system prerequisites and prints a diagnostic report.
import chalk from 'chalk';
import { brand, log, box } from '../utils/ui.js';
import { runSafe, getNodeVersion, getFlutterVersion } from '../utils/exec.js';
import { detectPackageManagers } from '../utils/packageManager.js';
import { NODE_MIN_VERSION } from '../constants/index.js';
export function registerDoctorCommand(program) {
    program
        .command('doctor')
        .description('Check system requirements and tool availability')
        .action(async () => {
        brand.header();
        log.section('System Diagnostics');
        log.blank();
        const checks = [];
        // ── Node.js ────────────────────────────────────────────────────────────
        const nodeVer = await getNodeVersion();
        checks.push({
            name: 'Node.js',
            status: nodeVer >= NODE_MIN_VERSION ? 'ok' : 'fail',
            detail: nodeVer > 0 ? `v${nodeVer} ${nodeVer < NODE_MIN_VERSION ? `(v${NODE_MIN_VERSION}+ required)` : ''}` : 'Not found',
        });
        // ── npm ────────────────────────────────────────────────────────────────
        const npmCheck = await runSafe('npm --version');
        checks.push({
            name: 'npm',
            status: npmCheck.ok ? 'ok' : 'fail',
            detail: npmCheck.ok ? `v${npmCheck.stdout.trim()}` : 'Not found',
        });
        // ── Package managers ───────────────────────────────────────────────────
        const pms = await detectPackageManagers();
        for (const pm of pms.filter(p => p.name !== 'npm')) {
            checks.push({
                name: pm.name,
                status: pm.available ? 'ok' : 'warn',
                detail: pm.available ? `v${pm.version}` : 'Not installed (optional)',
            });
        }
        // ── Git ────────────────────────────────────────────────────────────────
        const gitCheck = await runSafe('git --version');
        checks.push({
            name: 'Git',
            status: gitCheck.ok ? 'ok' : 'warn',
            detail: gitCheck.ok ? gitCheck.stdout.trim().replace('git version ', '') : 'Not found (optional)',
        });
        // ── Flutter ────────────────────────────────────────────────────────────
        const flutterVer = await getFlutterVersion();
        checks.push({
            name: 'Flutter',
            status: flutterVer ? 'ok' : 'warn',
            detail: flutterVer ? `v${flutterVer}` : 'Not found (required for Flutter projects)',
        });
        // ── Docker ────────────────────────────────────────────────────────────
        const dockerCheck = await runSafe('docker --version');
        checks.push({
            name: 'Docker',
            status: dockerCheck.ok ? 'ok' : 'warn',
            detail: dockerCheck.ok ? dockerCheck.stdout.trim().replace('Docker version ', '') : 'Not found (optional)',
        });
        // ── Print results ──────────────────────────────────────────────────────
        for (const check of checks) {
            const icon = check.status === 'ok' ? chalk.green('✓') :
                check.status === 'warn' ? chalk.yellow('⚠') : chalk.red('✗');
            const name = check.status === 'fail' ? chalk.red(check.name.padEnd(16)) :
                check.status === 'warn' ? chalk.yellow(check.name.padEnd(16)) :
                    chalk.white(check.name.padEnd(16));
            console.log(`  ${icon} ${name} ${chalk.dim(check.detail)}`);
        }
        log.blank();
        const failures = checks.filter(c => c.status === 'fail');
        const warnings = checks.filter(c => c.status === 'warn');
        if (failures.length > 0) {
            box.error('Issues Found', failures.map(f => `✗ ${f.name}: ${f.detail}`).join('\n'));
        }
        else if (warnings.length > 0) {
            box.warn('Warnings', warnings.map(w => `⚠ ${w.name}: ${w.detail}`).join('\n'));
            log.success('Core requirements satisfied — ready to scaffold web projects');
        }
        else {
            box.success('All checks passed', 'Your system is ready for web and Flutter projects.');
        }
    });
}
//# sourceMappingURL=doctor.js.map