// src/core/configBuilder.ts

import type {
  ParsedArgs, ProjectConfig, WebProjectConfig, FlutterProjectConfig,
  WebFeatureFlags, FlutterFeatureFlags, DevOpsConfig, PackageManager,
} from '../types/index.js';
import { getDefaultPackageManager } from '../utils/packageManager.js';

export async function buildWebConfig(args: ParsedArgs, pm?: PackageManager): Promise<WebProjectConfig> {
  const resolvedPm = args.packageManager ?? pm ?? await getDefaultPackageManager();
  const flags = args.flags;

  const features: WebFeatureFlags = {
    eslint: flags['eslint'] ?? true,
    prettier: flags['prettier'] ?? true,
    husky: flags['husky'] ?? false,
    commitlint: flags['commitlint'] ?? false,
    storybook: flags['storybook'] ?? false,
    pwa: flags['pwa'] ?? false,
    i18n: flags['i18n'] ?? false,
    darkMode: flags['darkMode'] ?? false,
    authStarter: flags['authStarter'] ?? false,
    firebase: flags['firebase'] ?? false,
    supabase: flags['supabase'] ?? false,
    docker: flags['docker'] ?? false,
    git: !flags['noGit'],
  };

  return {
    name: args.projectName,
    ecosystem: 'web',
    framework: args.framework ?? 'next',
    language: args.language ?? 'ts',
    css: args.css ?? 'tailwind',
    ui: args.ui ?? 'none',
    stateManager: (args.stateManager as WebProjectConfig['stateManager']) ?? 'none',
    testing: 'none',
    packageManager: resolvedPm,
    // --src-dir flag or default true for Next.js CLI mode
    srcDir: flags['srcDir'] ?? (args.framework === 'next' ? true : false),
    features,
    devops: {
      docker: features.docker,
      ci: flags['ci'] ? 'github' : 'none',
      deployTarget: 'none',
    },
  };
}

export async function buildFlutterConfig(args: ParsedArgs): Promise<FlutterProjectConfig> {
  const flags = args.flags;

  const features: FlutterFeatureFlags = {
    firebase: flags['firebase'] ?? false,
    supabase: flags['supabase'] ?? false,
    goRouter: true,
    localization: flags['i18n'] ?? false,
    flavors: flags['flavors'] ?? false,
    hive: false,
    isar: false,
    dio: true,
    retrofit: false,
    docker: flags['docker'] ?? false,
    git: !flags['noGit'],
  };

  return {
    name: args.projectName,
    ecosystem: 'flutter',
    architecture: args.architecture ?? 'clean',
    stateManager: (args.stateManager as FlutterProjectConfig['stateManager']) ?? 'riverpod',
    features,
    devops: { docker: features.docker, ci: flags['ci'] ? 'github' : 'none' },
  };
}

export async function buildProjectConfig(args: ParsedArgs): Promise<ProjectConfig> {
  return args.ecosystem === 'flutter' ? buildFlutterConfig(args) : buildWebConfig(args);
}
