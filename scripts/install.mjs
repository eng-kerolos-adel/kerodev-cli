#!/usr/bin/env node
// scripts/install.js — Global install helper

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

console.log('\n  Installing forge-cli globally...\n');

try {
  execSync('npm link', { cwd: root, stdio: 'inherit' });
  console.log('\n  ✓ forge installed successfully!\n');
  console.log('  Run: forge --help\n');
} catch {
  console.error('\n  ✗ Installation failed. Try: npm install -g .\n');
  process.exit(1);
}
