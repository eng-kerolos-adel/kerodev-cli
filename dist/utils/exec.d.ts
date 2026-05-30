import type { Ora } from 'ora';
export interface ExecOptions {
    cwd?: string;
    spinner?: Ora;
    verbose?: boolean;
    env?: Record<string, string>;
}
export declare function run(command: string, opts?: ExecOptions): Promise<{
    stdout: string;
    stderr: string;
}>;
export declare function runSafe(command: string, opts?: ExecOptions): Promise<{
    ok: boolean;
    stdout: string;
    stderr: string;
}>;
export declare function commandExists(cmd: string): Promise<boolean>;
export declare function getNodeVersion(): Promise<number>;
export declare function getFlutterVersion(): Promise<string | null>;
export declare function runSequential(commands: Array<{
    cmd: string;
    opts?: ExecOptions;
    label?: string;
}>, verbose?: boolean): Promise<void>;
//# sourceMappingURL=exec.d.ts.map