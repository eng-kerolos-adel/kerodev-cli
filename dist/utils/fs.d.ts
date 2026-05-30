import type { TemplateVariables } from '../types/index.js';
export declare function ensureDir(dirPath: string): Promise<void>;
export declare function writeFile(filePath: string, content: string): Promise<void>;
export declare function writeJson(filePath: string, data: unknown, indent?: number): Promise<void>;
export declare function copyTemplate(src: string, dest: string): Promise<void>;
export declare function pathExists(p: string): Promise<boolean>;
export declare function removeDir(dirPath: string): Promise<void>;
export declare function createDirStructure(base: string, dirs: string[]): Promise<void>;
/**
 * Replace {{VARIABLE}} placeholders in template strings.
 */
export declare function interpolate(template: string, vars: TemplateVariables): string;
/**
 * Read a file and interpolate variables.
 */
export declare function renderTemplate(templatePath: string, vars: TemplateVariables): Promise<string>;
/**
 * Write an interpolated template to destination.
 */
export declare function writeTemplate(templatePath: string, destPath: string, vars: TemplateVariables): Promise<void>;
export declare function appendToFile(filePath: string, content: string): Promise<void>;
export declare function readJson(filePath: string): Promise<unknown>;
export declare function fileExists(filePath: string): Promise<boolean>;
//# sourceMappingURL=fs.d.ts.map