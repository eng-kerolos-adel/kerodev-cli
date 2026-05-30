// src/constants/index.ts

import type {
  WebFramework, CSSFramework, UILibrary, FlutterArchitecture,
  FlutterStateManager, TestingFramework, StateManager
} from '../types/index.js';

export const CLI_NAME = 'kerodev';
export const CLI_ALIAS = 'kd';
export const CLI_VERSION = '1.0.0';
export const CLI_DESCRIPTION = 'Enterprise-grade universal project scaffolding CLI';
export const CLI_AUTHOR = 'KeroDev';
export const CLI_WEBSITE = 'https://kerodev.dev';

export const WEB_FRAMEWORKS: WebFramework[] = [
  'next', 'react', 'vue', 'angular', 'vite', 'astro', 'sveltekit', 'remix', 'nuxt'
];

export const CSS_FRAMEWORKS: CSSFramework[] = [
  'tailwind', 'bootstrap', 'sass', 'styled-components', 'css-modules', 'none'
];

export const UI_LIBRARIES: UILibrary[] = [
  'shadcn', 'mui', 'chakra', 'antd', 'heroui', 'none'
];

export const WEB_STATE_MANAGERS: StateManager[] = [
  'redux', 'zustand', 'jotai', 'recoil', 'react-query', 'none'
];

export const FLUTTER_ARCHITECTURES: FlutterArchitecture[] = [
  'clean', 'feature-first', 'layered', 'mvc', 'mvvm', 'modular'
];

export const FLUTTER_STATE_MANAGERS: FlutterStateManager[] = [
  'riverpod', 'bloc', 'cubit', 'getx', 'provider'
];

export const TESTING_FRAMEWORKS: TestingFramework[] = [
  'jest', 'vitest', 'playwright', 'cypress', 'none'
];

export const FRAMEWORK_DISPLAY_NAMES: Record<string, string> = {
  next: 'Next.js',
  react: 'React',
  vue: 'Vue',
  angular: 'Angular',
  vite: 'Vite',
  astro: 'Astro',
  sveltekit: 'SvelteKit',
  remix: 'Remix',
  nuxt: 'Nuxt',
  tailwind: 'Tailwind CSS v4',
  bootstrap: 'Bootstrap',
  sass: 'Sass/SCSS',
  'styled-components': 'Styled Components',
  'css-modules': 'CSS Modules',
  shadcn: 'ShadCN/UI',
  mui: 'Material UI',
  chakra: 'Chakra UI',
  antd: 'Ant Design',
  heroui: 'Hero UI',
  riverpod: 'Riverpod',
  bloc: 'BLoC',
  cubit: 'Cubit',
  getx: 'GetX',
  provider: 'Provider',
  clean: 'Clean Architecture',
  'feature-first': 'Feature-First',
  layered: 'Layered Architecture',
  mvc: 'MVC',
  mvvm: 'MVVM',
  modular: 'Modular Architecture',
};

// Compatibility matrix
export const UI_REQUIRES_TAILWIND: UILibrary[] = ['shadcn', 'heroui'];
export const FRAMEWORK_SUPPORTS_SHADCN: WebFramework[] = [
  'next', 'react', 'vite', 'remix', 'astro'
];
export const FRAMEWORK_SUPPORTS_VUE_STATE: WebFramework[] = ['vue', 'nuxt'];
export const NODE_MIN_VERSION = 18;

// Tailwind v4 — no tailwind.config.js
// Vite-based frameworks use @tailwindcss/vite plugin
export const TAILWIND_VITE_FRAMEWORKS: WebFramework[] = [
  'vite', 'react', 'astro', 'sveltekit'
];
// Next.js / Angular / Remix / Nuxt use @tailwindcss/postcss
export const TAILWIND_POSTCSS_FRAMEWORKS: WebFramework[] = [
  'next', 'angular', 'remix', 'nuxt', 'vue'
];
