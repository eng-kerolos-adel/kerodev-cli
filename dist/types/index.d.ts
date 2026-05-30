export type Ecosystem = 'web' | 'flutter';
export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';
export type Language = 'ts' | 'js';
export type CIProvider = 'github' | 'gitlab' | 'none';
export type WebFramework = 'next' | 'react' | 'vue' | 'angular' | 'vite' | 'astro' | 'sveltekit' | 'remix' | 'nuxt';
export type CSSFramework = 'tailwind' | 'bootstrap' | 'sass' | 'styled-components' | 'css-modules' | 'none';
export type UILibrary = 'shadcn' | 'mui' | 'chakra' | 'antd' | 'heroui' | 'none';
export type StateManager = 'redux' | 'zustand' | 'jotai' | 'recoil' | 'react-query' | 'none';
export type FlutterArchitecture = 'clean' | 'feature-first' | 'layered' | 'mvc' | 'mvvm' | 'modular';
export type FlutterStateManager = 'riverpod' | 'bloc' | 'cubit' | 'getx' | 'provider';
export type TestingFramework = 'jest' | 'vitest' | 'playwright' | 'cypress' | 'none';
export interface WebProjectConfig {
    name: string;
    ecosystem: 'web';
    framework: WebFramework;
    language: Language;
    css: CSSFramework;
    ui: UILibrary;
    stateManager: StateManager;
    testing: TestingFramework;
    packageManager: PackageManager;
    /** Only relevant for Next.js: whether to use a src/ directory */
    srcDir: boolean;
    features: WebFeatureFlags;
    devops: DevOpsConfig;
}
export interface FlutterProjectConfig {
    name: string;
    ecosystem: 'flutter';
    architecture: FlutterArchitecture;
    stateManager: FlutterStateManager;
    features: FlutterFeatureFlags;
    devops: DevOpsConfig;
}
export type ProjectConfig = WebProjectConfig | FlutterProjectConfig;
export interface WebFeatureFlags {
    eslint: boolean;
    prettier: boolean;
    husky: boolean;
    commitlint: boolean;
    storybook: boolean;
    pwa: boolean;
    i18n: boolean;
    darkMode: boolean;
    authStarter: boolean;
    firebase: boolean;
    supabase: boolean;
    docker: boolean;
    git: boolean;
}
export interface FlutterFeatureFlags {
    firebase: boolean;
    supabase: boolean;
    goRouter: boolean;
    localization: boolean;
    flavors: boolean;
    hive: boolean;
    isar: boolean;
    dio: boolean;
    retrofit: boolean;
    docker: boolean;
    git: boolean;
}
export interface DevOpsConfig {
    docker: boolean;
    ci: CIProvider;
    deployTarget?: 'vercel' | 'netlify' | 'none';
}
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
export interface GeneratorContext {
    config: ProjectConfig;
    targetDir: string;
    templateDir: string;
    verbose: boolean;
}
export interface PackageManagerInfo {
    name: PackageManager;
    available: boolean;
    version?: string;
    installCmd: string;
    addCmd: string;
    addDevCmd: string;
    runCmd: string;
    dlxCmd: string;
}
export interface TemplateVariables {
    [key: string]: string | boolean | number | string[];
}
export interface GeneratorStep {
    name: string;
    run: (ctx: GeneratorContext) => Promise<void>;
}
export interface ParsedArgs {
    projectName: string;
    ecosystem: Ecosystem;
    framework?: WebFramework;
    architecture?: FlutterArchitecture;
    css?: CSSFramework;
    ui?: UILibrary;
    language?: Language;
    stateManager?: string;
    flags: Record<string, boolean>;
    packageManager?: PackageManager;
    verbose: boolean;
}
//# sourceMappingURL=index.d.ts.map