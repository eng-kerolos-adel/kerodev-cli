import type { PackageManager, PackageManagerInfo } from '../types/index.js';
export declare function detectPackageManagers(): Promise<PackageManagerInfo[]>;
export declare function getPackageManagerInfo(pm: PackageManager): Promise<PackageManagerInfo>;
export declare function getDefaultPackageManager(): Promise<PackageManager>;
/**
 * Builds the create-next-app command.
 * --tailwind is ONLY added when the user selected tailwind.
 * --src-dir is ONLY added when the user chose a src/ directory.
 */
export declare function getNextCreateCommand(pm: PackageManager, projectName: string, opts: {
    typescript: boolean;
    tailwind: boolean;
    eslint: boolean;
    srcDir: boolean;
}): string;
/** Generic create commands for all other frameworks. */
export declare function getCreateCommand(pm: PackageManager, framework: string, projectName: string, opts?: {
    typescript?: boolean;
    tailwind?: boolean;
    srcDir?: boolean;
}): string;
export declare function getAddCommand(pm: PackageManager, dev: boolean, ...packages: string[]): string;
//# sourceMappingURL=packageManager.d.ts.map