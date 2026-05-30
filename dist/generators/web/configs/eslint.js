// src/generators/web/configs/eslint.ts
export function generateEslintConfig(config) {
    const isNext = config.framework === 'next';
    const isReact = ['next', 'react', 'vite', 'remix', 'astro'].includes(config.framework);
    const isVue = ['vue', 'nuxt'].includes(config.framework);
    return `import js from '@eslint/js';
import globals from 'globals';
${config.language === 'ts' ? "import tseslint from 'typescript-eslint';" : ''}
${isReact && !isNext ? "import reactHooks from 'eslint-plugin-react-hooks';\nimport reactRefresh from 'eslint-plugin-react-refresh';" : ''}
${isNext ? "import nextPlugin from '@next/eslint-plugin-next';" : ''}

export default [
  { ignores: ['dist', '.next', 'build', 'node_modules'] },
  {
    files: ['**/*.{${config.language === 'ts' ? 'ts,tsx,' : ''}js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  ${config.language === 'ts' ? '...tseslint.configs.recommended,' : 'js.configs.recommended,'}
  ${isReact && !isNext ? `{
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },` : ''}
  ${isNext ? `{
    plugins: { '@next/next': nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },` : ''}
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'off',
      ${config.language === 'ts' ? `'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',` : ''}
    },
  },
];
`;
}
//# sourceMappingURL=eslint.js.map