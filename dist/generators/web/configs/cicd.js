// src/generators/web/configs/cicd.ts
export function generateGitHubActions(config) {
    const pm = config.packageManager;
    const installCmd = pm === 'npm' ? 'npm ci' :
        pm === 'pnpm' ? 'pnpm install --frozen-lockfile' :
            pm === 'yarn' ? 'yarn install --frozen-lockfile' : 'bun install --frozen-lockfile';
    const buildCmd = pm === 'npm' ? 'npm run build' : `${pm} run build`;
    const lintCmd = pm === 'npm' ? 'npm run lint' : `${pm} run lint`;
    return `name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '20'
  ${pm === 'pnpm' ? "PNPM_VERSION: '9'" : ''}

jobs:
  lint-and-type-check:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          ${pm !== 'pnpm' && pm !== 'bun' ? `cache: '${pm}'` : ''}

${pm === 'pnpm' ? `      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: \${{ env.PNPM_VERSION }}
          run_install: false

      - name: Get pnpm store directory
        shell: bash
        run: echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV

      - name: Setup pnpm cache
        uses: actions/cache@v4
        with:
          path: \${{ env.STORE_PATH }}
          key: \${{ runner.os }}-pnpm-store-\${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            \${{ runner.os }}-pnpm-store-
` : ''}

      - name: Install dependencies
        run: ${installCmd}

${config.features.eslint ? `      - name: Lint
        run: ${lintCmd}
` : ''}
${config.language === 'ts' ? `      - name: Type check
        run: ${pm === 'npm' ? 'npm run type-check' : `${pm} run type-check`}
` : ''}

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: lint-and-type-check
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}

      - name: Install dependencies
        run: ${installCmd}

      - name: Build
        run: ${buildCmd}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: |
            .next/
            dist/
          retention-days: 7
`;
}
export function generateGitLabCI(config) {
    const pm = config.packageManager;
    const installCmd = pm === 'npm' ? 'npm ci' : `${pm} install --frozen-lockfile`;
    const buildCmd = pm === 'npm' ? 'npm run build' : `${pm} run build`;
    return `image: node:20-alpine

stages:
  - install
  - lint
  - build
  - deploy

cache:
  key:
    files:
      - package-lock.json
      - pnpm-lock.yaml
  paths:
    - node_modules/
    - .pnpm-store/

install:
  stage: install
  script:
    - ${installCmd}

lint:
  stage: lint
  script:
    - ${pm === 'npm' ? 'npm run lint' : `${pm} run lint`}
  needs: [install]

build:
  stage: build
  script:
    - ${buildCmd}
  artifacts:
    paths:
      - dist/
      - .next/
    expire_in: 1 week
  needs: [lint]
`;
}
//# sourceMappingURL=cicd.js.map