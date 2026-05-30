// src/generators/web/structure.ts
import path from 'path';
import { createDirStructure, writeFile } from '../../utils/fs.js';
export async function generateWebFolderStructure(ctx) {
    const cfg = ctx.config;
    const base = ctx.targetDir;
    // For Next.js: respect the user's src/ choice
    // For others: always use src/
    const srcRoot = cfg.framework === 'next'
        ? (cfg.srcDir ? path.join(base, 'src') : base)
        : path.join(base, 'src');
    const commonDirs = [
        'components/ui',
        'components/shared',
        'components/layout',
        'hooks',
        'utils',
        'types',
        'constants',
        'config',
        'lib',
        'styles',
        'services',
        'features',
    ];
    const frameworkDirs = {
        next: [
            'app/(auth)',
            'app/(dashboard)',
            'app/api',
            'providers',
        ],
        react: ['pages', 'router', 'store', 'providers'],
        vite: ['pages', 'router', 'store', 'providers'],
        vue: ['composables', 'views', 'router', 'stores', 'plugins'],
        nuxt: ['composables', 'middleware', 'plugins', 'layouts', 'pages'],
        angular: ['app/core', 'app/shared', 'app/features', 'environments'],
        astro: ['pages', 'layouts', 'content'],
        sveltekit: ['lib/server', 'routes'],
        remix: ['routes', 'components', 'utils'],
    };
    const extraDirs = frameworkDirs[cfg.framework] ?? [];
    const allRelDirs = [...commonDirs, ...extraDirs];
    // State management dirs
    if (cfg.stateManager === 'redux')
        allRelDirs.push('store/slices', 'store/middleware');
    if (cfg.stateManager === 'zustand')
        allRelDirs.push('store');
    if (cfg.stateManager === 'jotai')
        allRelDirs.push('atoms');
    // Create directories relative to srcRoot
    await createDirStructure(srcRoot, allRelDirs);
    // Write starter files
    await Promise.all([
        writeFile(path.join(srcRoot, 'lib', 'utils.ts'), generateUtilsStub()),
        writeFile(path.join(srcRoot, 'types', 'index.ts'), generateTypesStub()),
        writeFile(path.join(srcRoot, 'constants', 'index.ts'), generateConstantsStub(cfg)),
        writeFile(path.join(srcRoot, 'config', 'index.ts'), generateConfigStub()),
        writeFile(path.join(srcRoot, 'hooks', 'index.ts'), '// Custom hooks — barrel export\n'),
        writeFile(path.join(srcRoot, 'services', 'index.ts'), generateServiceStub()),
        writeFile(path.join(srcRoot, 'components', 'ui', 'index.ts'), '// UI components — barrel export\n'),
        writeFile(path.join(srcRoot, 'components', 'shared', 'index.ts'), '// Shared components — barrel export\n'),
        // Only write globals.css if NOT using tailwind (tailwind installer handles the CSS file)
        ...(cfg.css !== 'tailwind'
            ? [writeFile(path.join(srcRoot, 'styles', 'globals.css'), generateBaseCss())]
            : []),
        ...(cfg.stateManager !== 'none'
            ? [writeFile(path.join(srcRoot, 'store', 'index.ts'), generateStoreStub(cfg.stateManager))]
            : []),
    ]);
}
function generateUtilsStub() {
    return `import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes with conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format date to locale string. */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date(date));
}

/** Typed sleep. */
export const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/** Exhaustive switch-case checker. */
export function assertUnreachable(x: never): never {
  throw new Error(\`Unexpected value: \${x}\`);
}
`;
}
function generateTypesStub() {
    return `// ─── Global shared types ────────────────────────────────────────────────────

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Nullable<T> = T | null;
export type AsyncFn<T = void, Args extends unknown[] = []> = (...args: Args) => Promise<T>;
export type ValueOf<T> = T[keyof T];

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}
`;
}
function generateConstantsStub(cfg) {
    return `// ─── Application constants ───────────────────────────────────────────────────

export const APP_NAME = '${cfg.name}';
export const APP_URL = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000';

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  AUTH: { LOGIN: '/auth/login', REGISTER: '/auth/register' },
} as const;

export const API = {
  BASE_URL: process.env['NEXT_PUBLIC_API_URL'] ?? '/api',
  TIMEOUT: 10_000,
} as const;
`;
}
function generateConfigStub() {
    return `// ─── App configuration ───────────────────────────────────────────────────────

export const config = {
  app: {
    name: process.env['NEXT_PUBLIC_APP_NAME'] ?? 'App',
    url: process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000',
    env: process.env['NODE_ENV'] ?? 'development',
  },
  api: {
    baseUrl: process.env['NEXT_PUBLIC_API_URL'] ?? '/api',
    timeout: 10_000,
  },
} as const;

export type Config = typeof config;
`;
}
function generateBaseCss() {
    return `/* ─── Global Styles ──────────────────────────────────────────────────────── */

:root {
  --background: #ffffff;
  --foreground: #171717;
  --primary: #6366f1;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: var(--background);
  color: var(--foreground);
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
`;
}
function generateServiceStub() {
    return `// ─── API service layer ───────────────────────────────────────────────────────

const BASE_URL = process.env['NEXT_PUBLIC_API_URL'] ?? '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(\`\${BASE_URL}\${endpoint}\`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error((error as { message: string }).message ?? 'Request failed');
  }
  return response.json() as Promise<T>;
}

export const api = {
  get:    <T>(endpoint: string) => request<T>(endpoint),
  post:   <T>(endpoint: string, data: unknown) => request<T>(endpoint, { method: 'POST',   body: JSON.stringify(data) }),
  put:    <T>(endpoint: string, data: unknown) => request<T>(endpoint, { method: 'PUT',    body: JSON.stringify(data) }),
  delete: <T>(endpoint: string)               => request<T>(endpoint, { method: 'DELETE' }),
};
`;
}
function generateStoreStub(stateManager) {
    if (stateManager === 'zustand') {
        return `import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AppState {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  devtools(persist(
    (set) => ({
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    { name: 'app-store' }
  ))
);
`;
    }
    if (stateManager === 'redux') {
        return `import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';

export const store = configureStore({
  reducer: {
    // Add your reducers here
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
`;
    }
    return `// State management store — add your state here\n`;
}
//# sourceMappingURL=structure.js.map