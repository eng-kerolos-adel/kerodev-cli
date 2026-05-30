import type { ParsedArgs, ProjectConfig, WebProjectConfig, FlutterProjectConfig, PackageManager } from '../types/index.js';
export declare function buildWebConfig(args: ParsedArgs, pm?: PackageManager): Promise<WebProjectConfig>;
export declare function buildFlutterConfig(args: ParsedArgs): Promise<FlutterProjectConfig>;
export declare function buildProjectConfig(args: ParsedArgs): Promise<ProjectConfig>;
//# sourceMappingURL=configBuilder.d.ts.map