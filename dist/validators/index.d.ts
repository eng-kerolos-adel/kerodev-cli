import type { ProjectConfig, WebProjectConfig, ValidationResult } from '../types/index.js';
export declare class ProjectValidator {
    private errors;
    private warnings;
    error(msg: string): void;
    warn(msg: string): void;
    result(): ValidationResult;
}
export declare function validateEnvironment(config: ProjectConfig): Promise<ValidationResult>;
export declare function validateWebConfig(config: WebProjectConfig): ValidationResult;
export declare function validateProjectName(name: string): ValidationResult;
export declare function mergeValidations(...results: ValidationResult[]): ValidationResult;
//# sourceMappingURL=index.d.ts.map