# ⚡ KeroDev CLI

> **Enterprise-grade universal project scaffolding CLI**
> One command. Zero config. Production-ready.

[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4%20CSS--first-38bdf8)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## Installation

```bash
git clone https://github.com/eng-kerolos-adel/kerodev-cli.git
cd kerodev-cli
npm install && npm run build && npm link

kerodev --help
kd --help   # short alias
```

or

```bash
npm install -g kerodev-cli

kerodev --help
kd --help   # short alias
```

---

## Usage

### Interactive Wizard
```bash
kerodev create
```

### CLI Mode

```bash
# Next.js + TypeScript + Tailwind v4 + ShadCN (with src/ dir)
kerodev create my-app web next tailwind shadcn ts

# Next.js WITHOUT Tailwind (no --tailwind flag passed to create-next-app)
kerodev create my-app web next ts

# Next.js WITHOUT src/ directory
kerodev create my-app web next tailwind ts --no-src-dir

# React (Vite) + Tailwind v4
kerodev create my-app web react tailwind ts

# Vite + Tailwind v4 + Docker + CI
kerodev create dashboard web vite tailwind ts --docker --ci --pm pnpm

# Flutter + Riverpod + Clean Architecture + Firebase
kerodev create finance-app flutter riverpod clean --firebase

# Flutter + BLoC + Modular + Supabase
kerodev create social-app flutter bloc modular --supabase
```

---

## Tailwind CSS v4 — CSS-First

> **No `tailwind.config.js` is ever created. This is intentional.**

KeroDev uses **Tailwind CSS v4** which uses CSS-first configuration:

| Framework | Integration |
|-----------|-------------|
| Next.js, Nuxt, Angular, Remix | `@tailwindcss/postcss` + `postcss.config.mjs` |
| Vite, React (Vite), Astro, SvelteKit | `@tailwindcss/vite` plugin |

All customization goes in your CSS file:

```css
@import "tailwindcss";

@theme {
  --color-primary: oklch(0.623 0.214 255.67);
  --font-sans: 'Inter', sans-serif;
  --radius: 0.625rem;
}
```

---

## Next.js Options

```bash
# With src/ directory (default in wizard)
kerodev create my-app web next tailwind ts --src-dir

# Without src/ directory
kerodev create my-app web next tailwind ts --no-src-dir

# Without Tailwind (create-next-app runs without --tailwind)
kerodev create my-app web next ts
```

The `--tailwind` flag is only passed to `create-next-app` if you selected Tailwind.

---

## Supported Stack

### Web Frameworks
`next` · `react` · `vue` · `angular` · `vite` · `astro` · `sveltekit` · `remix` · `nuxt`

### CSS
`tailwind` (v4) · `bootstrap` · `sass` · `styled-components` · `css-modules`

### UI Libraries
`shadcn` · `mui` · `chakra` · `antd` · `heroui`

### Flutter Architectures
`clean` · `feature-first` · `layered` · `mvc` · `mvvm` · `modular`

### Flutter State Management
`riverpod` · `bloc` · `cubit` · `getx` · `provider`

---

## Commands

```bash
kerodev create   # Scaffold project
kerodev list     # Show all supported options
kerodev doctor   # Check system requirements
```

---

## Flags

| Flag | Description |
|------|-------------|
| `--src-dir` | Use src/ directory (Next.js) |
| `--no-src-dir` | Skip src/ directory (Next.js) |
| `--docker` | Add Dockerfile + docker-compose.yml |
| `--eslint` | Add ESLint |
| `--prettier` | Add Prettier |
| `--husky` | Add Husky + lint-staged |
| `--ci` | Add GitHub Actions CI/CD |
| `--firebase` | Firebase integration |
| `--supabase` | Supabase integration |
| `--no-git` | Skip Git |
| `--pm <name>` | `npm` \| `pnpm` \| `yarn` \| `bun` |
| `--verbose` | Verbose output |

---

## Architecture

```
src/
├── commands/          # CLI commands (create, list, doctor)
├── core/              # Parser + config builder
├── generators/
│   ├── web/
│   │   ├── index.ts          # Orchestrator
│   │   ├── structure.ts      # Folder generation (srcDir-aware)
│   │   ├── readme.ts
│   │   ├── configs/          # eslint, prettier, vite, next, docker, cicd, env, tsconfig
│   │   └── installers/
│   │       ├── tailwind.ts   # Tailwind v4 (no config file, CSS-first)
│   │       └── shadcn.ts     # ShadCN v4 compatible
│   ├── flutter/
│   └── shared/               # Git integration
├── prompts/           # Interactive wizard
├── validators/
├── utils/             # ui, fs, exec, packageManager
├── constants/
└── types/
```

## Requirements

- Node.js 18+
- Flutter 3.19+ (Flutter projects only)
- Git (optional)
- Docker (optional)

---

*KeroDev CLI — Built for engineers who ship.*
