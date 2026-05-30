// src/utils/exec.ts
import { execa } from 'execa';
export async function run(command, opts = {}) {
    const [cmd, ...args] = command.split(' ');
    try {
        const result = await execa(cmd, args, {
            cwd: opts.cwd,
            env: { ...process.env, ...opts.env },
            stdio: opts.verbose ? 'inherit' : 'pipe',
        });
        return {
            stdout: result.stdout ?? '',
            stderr: result.stderr ?? '',
        };
    }
    catch (err) {
        const error = err;
        throw new Error(error.stderr ?? error.message ?? `Command failed: ${command}`);
    }
}
export async function runSafe(command, opts = {}) {
    try {
        const result = await run(command, opts);
        return { ok: true, ...result };
    }
    catch (err) {
        const error = err;
        return { ok: false, stdout: '', stderr: error.message };
    }
}
export async function commandExists(cmd) {
    const result = await runSafe(`${cmd} --version`);
    return result.ok;
}
export async function getNodeVersion() {
    const { stdout } = await run('node --version');
    const match = stdout.match(/v(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
}
export async function getFlutterVersion() {
    const result = await runSafe('flutter --version');
    if (!result.ok)
        return null;
    const match = result.stdout.match(/Flutter (\S+)/);
    return match ? match[1] : null;
}
export async function runSequential(commands, verbose = false) {
    for (const { cmd, opts = {} } of commands) {
        await run(cmd, { ...opts, verbose });
    }
}
//# sourceMappingURL=exec.js.map