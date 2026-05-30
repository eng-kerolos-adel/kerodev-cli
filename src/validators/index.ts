// src/validators/index.ts

import type {
  ProjectConfig, WebProjectConfig, ValidationResult
} from '../types/index.js';
import {
  UI_REQUIRES_TAILWIND,
  FRAMEWORK_SUPPORTS_SHADCN,
  NODE_MIN_VERSION,
} from '../constants/index.js';
import { getNodeVersion, getFlutterVersion } from '../utils/exec.js';

// ─── Core Validator ───────────────────────────────────────────────────────────

export class ProjectValidator {
  private errors: string[] = [];
  private warnings: string[] = [];

  error(msg: string): void { this.errors.push(msg); }
  warn(msg: string): void { this.warnings.push(msg); }

  result(): ValidationResult {
    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
    };
  }
}

// ─── Environment Validators ───────────────────────────────────────────────────

export async function validateEnvironment(config: ProjectConfig): Promise<ValidationResult> {
  const v = new ProjectValidator();

  // Node version
  const nodeVer = await getNodeVersion();
  if (nodeVer < NODE_MIN_VERSION) {
    v.error(`Node.js v${NODE_MIN_VERSION}+ required. Found: v${nodeVer}`);
  }

  // Flutter-specific
  if (config.ecosystem === 'flutter') {
    const flutterVer = await getFlutterVersion();
    if (!flutterVer) {
      v.error('Flutter is not installed. Install from https://flutter.dev/docs/get-started/install');
    }
  }

  return v.result();
}

// ─── Config Validators ────────────────────────────────────────────────────────

export function validateWebConfig(config: WebProjectConfig): ValidationResult {
  const v = new ProjectValidator();

  // ShadCN requires Tailwind
  if (UI_REQUIRES_TAILWIND.includes(config.ui) && config.css !== 'tailwind') {
    v.error(`${config.ui} requires Tailwind CSS. Add "tailwind" to your command or change the UI library.`);
  }

  // ShadCN framework compatibility
  if (config.ui === 'shadcn' && !FRAMEWORK_SUPPORTS_SHADCN.includes(config.framework)) {
    v.warn(`ShadCN has limited support with ${config.framework}. Consider using Next.js or React.`);
  }

  // Angular always uses TypeScript
  if (config.framework === 'angular' && config.language === 'js') {
    v.warn('Angular always uses TypeScript. Language will be set to TypeScript.');
  }

  // Project name
  if (!/^[a-z][a-z0-9-_]*$/.test(config.name)) {
    v.error('Project name must start with a letter and contain only lowercase letters, numbers, hyphens, and underscores.');
  }

  return v.result();
}

export function validateProjectName(name: string): ValidationResult {
  const v = new ProjectValidator();
  if (!name || name.length === 0) v.error('Project name is required.');
  if (name.length > 214) v.error('Project name too long (max 214 chars).');
  if (!/^[a-z][a-z0-9-_.]*$/.test(name)) {
    v.error('Name must start with a letter and contain only lowercase letters, numbers, hyphens, underscores, or dots.');
  }
  if (['node_modules', 'favicon.ico', 'test'].includes(name)) {
    v.error(`"${name}" is a reserved name.`);
  }
  return v.result();
}

export function mergeValidations(...results: ValidationResult[]): ValidationResult {
  return {
    valid: results.every(r => r.valid),
    errors: results.flatMap(r => r.errors),
    warnings: results.flatMap(r => r.warnings),
  };
}
