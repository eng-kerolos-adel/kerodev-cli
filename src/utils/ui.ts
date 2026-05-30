// src/utils/ui.ts — KeroDev CLI premium terminal UI layer

import chalk from 'chalk';
import boxen from 'boxen';
import gradient from 'gradient-string';
import ora, { type Ora } from 'ora';
import Table from 'cli-table3';
import { CLI_NAME, CLI_VERSION, CLI_AUTHOR } from '../constants/index.js';

// ─── Brand ───────────────────────────────────────────────────────────────────

const keroBrand = gradient(['#00C6FF', '#7B2FF7', '#FF6B6B']);
const accentGrad = gradient(['#FF6B6B', '#FFE53B']);

export const brand = {
  logo(): string {
    return keroBrand(`
  ██╗  ██╗███████╗██████╗  ██████╗ ██████╗ ███████╗██╗   ██╗
  ██║ ██╔╝██╔════╝██╔══██╗██╔═══██╗██╔══██╗██╔════╝██║   ██║
  █████╔╝ █████╗  ██████╔╝██║   ██║██║  ██║█████╗  ██║   ██║
  ██╔═██╗ ██╔══╝  ██╔══██╗██║   ██║██║  ██║██╔══╝  ╚██╗ ██╔╝
  ██║  ██╗███████╗██║  ██║╚██████╔╝██████╔╝███████╗ ╚████╔╝ 
  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝  ╚═══╝  `);
  },
  header(): void {
    console.log('\n' + brand.logo());
    console.log(
      chalk.dim(`  ${CLI_AUTHOR} CLI v${CLI_VERSION}`) +
      chalk.dim(' — Enterprise Project Scaffolding\n')
    );
  },
  tagline(): string {
    return accentGrad('  ⚡ Production-ready. Zero config. One command.\n');
  }
};

// ─── Spinner ─────────────────────────────────────────────────────────────────

export function createSpinner(text: string) {
  const s = ora({
    text: chalk.cyan(text),
    spinner: 'dots',
    color: 'cyan',
  });
  return {
    start: () => { s.start(); return s; },
    succeed: (msg?: string) => s.succeed(chalk.green(msg ?? text)),
    fail: (msg?: string) => s.fail(chalk.red(msg ?? text)),
    warn: (msg?: string) => s.warn(chalk.yellow(msg ?? text)),
    update: (msg: string) => { s.text = chalk.cyan(msg); },
    instance: s,
  };
}

// ─── Boxes ───────────────────────────────────────────────────────────────────

export const box = {
  info(title: string, body: string): void {
    console.log(boxen(body, {
      title: chalk.bold.cyan(title),
      titleAlignment: 'left',
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
      borderStyle: 'round',
      borderColor: 'cyan',
    }));
  },
  success(title: string, body: string): void {
    console.log(boxen(body, {
      title: chalk.bold.green(`✓ ${title}`),
      titleAlignment: 'left',
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      margin: { top: 1, bottom: 0, left: 0, right: 0 },
      borderStyle: 'double',
      borderColor: 'green',
    }));
  },
  error(title: string, body: string): void {
    console.log(boxen(body, {
      title: chalk.bold.red(`✗ ${title}`),
      titleAlignment: 'left',
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      margin: { top: 1, bottom: 0, left: 0, right: 0 },
      borderStyle: 'round',
      borderColor: 'red',
    }));
  },
  warn(title: string, body: string): void {
    console.log(boxen(body, {
      title: chalk.bold.yellow(`⚠ ${title}`),
      titleAlignment: 'left',
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      margin: { top: 1, bottom: 0, left: 0, right: 0 },
      borderStyle: 'round',
      borderColor: 'yellow',
    }));
  },
};

// ─── Log helpers ─────────────────────────────────────────────────────────────

export const log = {
  step(n: number, total: number, msg: string): void {
    const tag = chalk.bgHex('#7B2FF7').white(` ${n}/${total} `);
    console.log(`\n${tag} ${chalk.bold(msg)}`);
  },
  info(msg: string): void { console.log(`  ${chalk.cyan('ℹ')} ${msg}`); },
  success(msg: string): void { console.log(`  ${chalk.green('✓')} ${msg}`); },
  warn(msg: string): void { console.log(`  ${chalk.yellow('⚠')} ${chalk.yellow(msg)}`); },
  error(msg: string): void { console.log(`  ${chalk.red('✗')} ${chalk.red(msg)}`); },
  dim(msg: string): void { console.log(chalk.dim(`  ${msg}`)); },
  blank(): void { console.log(''); },
  section(title: string): void { console.log(`\n${chalk.bold.underline(title)}`); },
};

// ─── Tables ──────────────────────────────────────────────────────────────────

export function printKeyValueTable(rows: [string, string][]): void {
  const table = new Table({
    style: { head: ['cyan'], border: ['dim'] },
    chars: {
      top: '─', 'top-mid': '┬', 'top-left': '┌', 'top-right': '┐',
      bottom: '─', 'bottom-mid': '┴', 'bottom-left': '└', 'bottom-right': '┘',
      left: '│', 'left-mid': '├', mid: '─', 'mid-mid': '┼',
      right: '│', 'right-mid': '┤', middle: '│',
    },
  });
  for (const [k, v] of rows) {
    table.push([chalk.dim(k), chalk.white(v)]);
  }
  console.log(table.toString());
}

// ─── Success Screen ──────────────────────────────────────────────────────────

export function printSuccessScreen(
  projectName: string,
  framework: string,
  pm: string,
  extras: string[]
): void {
  log.blank();
  const lines = [
    `${chalk.bold('Project')}  ${chalk.cyan(projectName)}`,
    `${chalk.bold('Stack')}    ${chalk.cyan(framework)}`,
    `${chalk.bold('Manager')}  ${chalk.cyan(pm)}`,
    '',
    chalk.bold('Next steps:'),
    `  ${chalk.cyan('cd')} ${chalk.white(projectName)}`,
    `  ${chalk.cyan(pm)} ${pm === 'npm' ? 'run dev' : 'dev'}`,
    ...extras.map(e => `  ${chalk.dim(e)}`),
  ].join('\n');
  box.success('Project Created Successfully', lines);
  console.log('\n' + accentGrad('  Happy shipping! ⚡  — KeroDev\n'));
}

// ─── Error Screen ─────────────────────────────────────────────────────────────

export function printErrorScreen(title: string, message: string, hints: string[] = []): void {
  const lines = [
    chalk.white(message),
    ...(hints.length ? ['', chalk.bold('Hints:'), ...hints.map(h => `  ${chalk.dim('→')} ${h}`)] : [])
  ].join('\n');
  box.error(title, lines);
}

// ─── Help ────────────────────────────────────────────────────────────────────

export function printHelpBanner(): void {
  brand.header();
  console.log(brand.tagline());
}
