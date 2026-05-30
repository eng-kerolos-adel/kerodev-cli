// src/utils/fs.ts

import fse from 'fs-extra';
import path from 'path';
import type { TemplateVariables } from '../types/index.js';

export async function ensureDir(dirPath: string): Promise<void> {
  await fse.ensureDir(dirPath);
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  await fse.ensureDir(path.dirname(filePath));
  await fse.writeFile(filePath, content, 'utf-8');
}

export async function writeJson(filePath: string, data: unknown, indent = 2): Promise<void> {
  await fse.ensureDir(path.dirname(filePath));
  await fse.writeJSON(filePath, data, { spaces: indent });
}

export async function copyTemplate(src: string, dest: string): Promise<void> {
  await fse.copy(src, dest, { overwrite: true });
}

export async function pathExists(p: string): Promise<boolean> {
  return fse.pathExists(p);
}

export async function removeDir(dirPath: string): Promise<void> {
  await fse.remove(dirPath);
}

export async function createDirStructure(base: string, dirs: string[]): Promise<void> {
  await Promise.all(dirs.map(d => fse.ensureDir(path.join(base, d))));
}

/**
 * Replace {{VARIABLE}} placeholders in template strings.
 */
export function interpolate(template: string, vars: TemplateVariables): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const val = vars[key];
    if (val === undefined) return `{{${key}}}`;
    return String(val);
  });
}

/**
 * Read a file and interpolate variables.
 */
export async function renderTemplate(
  templatePath: string,
  vars: TemplateVariables
): Promise<string> {
  const raw = await fse.readFile(templatePath, 'utf-8');
  return interpolate(raw, vars);
}

/**
 * Write an interpolated template to destination.
 */
export async function writeTemplate(
  templatePath: string,
  destPath: string,
  vars: TemplateVariables
): Promise<void> {
  const rendered = await renderTemplate(templatePath, vars);
  await writeFile(destPath, rendered);
}

export async function appendToFile(filePath: string, content: string): Promise<void> {
  await fse.ensureDir(path.dirname(filePath));
  await fse.appendFile(filePath, content, 'utf-8');
}

export async function readJson(filePath: string): Promise<unknown> {
  return fse.readJSON(filePath);
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fse.access(filePath);
    return true;
  } catch {
    return false;
  }
}
