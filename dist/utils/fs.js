// src/utils/fs.ts
import fse from 'fs-extra';
import path from 'path';
export async function ensureDir(dirPath) {
    await fse.ensureDir(dirPath);
}
export async function writeFile(filePath, content) {
    await fse.ensureDir(path.dirname(filePath));
    await fse.writeFile(filePath, content, 'utf-8');
}
export async function writeJson(filePath, data, indent = 2) {
    await fse.ensureDir(path.dirname(filePath));
    await fse.writeJSON(filePath, data, { spaces: indent });
}
export async function copyTemplate(src, dest) {
    await fse.copy(src, dest, { overwrite: true });
}
export async function pathExists(p) {
    return fse.pathExists(p);
}
export async function removeDir(dirPath) {
    await fse.remove(dirPath);
}
export async function createDirStructure(base, dirs) {
    await Promise.all(dirs.map(d => fse.ensureDir(path.join(base, d))));
}
/**
 * Replace {{VARIABLE}} placeholders in template strings.
 */
export function interpolate(template, vars) {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        const val = vars[key];
        if (val === undefined)
            return `{{${key}}}`;
        return String(val);
    });
}
/**
 * Read a file and interpolate variables.
 */
export async function renderTemplate(templatePath, vars) {
    const raw = await fse.readFile(templatePath, 'utf-8');
    return interpolate(raw, vars);
}
/**
 * Write an interpolated template to destination.
 */
export async function writeTemplate(templatePath, destPath, vars) {
    const rendered = await renderTemplate(templatePath, vars);
    await writeFile(destPath, rendered);
}
export async function appendToFile(filePath, content) {
    await fse.ensureDir(path.dirname(filePath));
    await fse.appendFile(filePath, content, 'utf-8');
}
export async function readJson(filePath) {
    return fse.readJSON(filePath);
}
export async function fileExists(filePath) {
    try {
        await fse.access(filePath);
        return true;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=fs.js.map