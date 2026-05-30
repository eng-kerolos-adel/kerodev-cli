// src/utils/exec.ts

import { execa } from 'execa';
import type { Ora } from 'ora';

export interface ExecOptions {
  cwd?: string;
  spinner?: Ora;
  verbose?: boolean;
  env?: Record<string, string>;
}

export async function run(
  command: string,
  opts: ExecOptions = {}
): Promise<{ stdout: string; stderr: string }> {
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
  } catch (err: unknown) {
    const error = err as { stderr?: string; message?: string };
    throw new Error(error.stderr ?? error.message ?? `Command failed: ${command}`);
  }
}

export async function runSafe(
  command: string,
  opts: ExecOptions = {}
): Promise<{ ok: boolean; stdout: string; stderr: string }> {
  try {
    const result = await run(command, opts);
    return { ok: true, ...result };
  } catch (err: unknown) {
    const error = err as Error;
    return { ok: false, stdout: '', stderr: error.message };
  }
}

export async function commandExists(cmd: string): Promise<boolean> {
  const result = await runSafe(`${cmd} --version`);
  return result.ok;
}

export async function getNodeVersion(): Promise<number> {
  const { stdout } = await run('node --version');
  const match = stdout.match(/v(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export async function getFlutterVersion(): Promise<string | null> {
  const result = await runSafe('flutter --version');
  if (!result.ok) return null;
  const match = result.stdout.match(/Flutter (\S+)/);
  return match ? match[1] : null;
}

export async function runSequential(
  commands: Array<{ cmd: string; opts?: ExecOptions; label?: string }>,
  verbose = false
): Promise<void> {
  for (const { cmd, opts = {} } of commands) {
    await run(cmd, { ...opts, verbose });
  }
}
