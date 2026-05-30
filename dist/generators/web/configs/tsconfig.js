// src/generators/web/configs/tsconfig.ts
export function generateTsConfig(framework) {
    const base = {
        compilerOptions: {
            target: 'ES2022',
            lib: ['dom', 'dom.iterable', 'ES2022'],
            allowJs: true,
            skipLibCheck: true,
            strict: true,
            noEmit: true,
            esModuleInterop: true,
            module: 'esnext',
            moduleResolution: 'bundler',
            resolveJsonModule: true,
            isolatedModules: true,
            jsx: 'preserve',
            incremental: true,
            plugins: [],
            paths: {
                '@/*': ['./src/*'],
            },
        },
        include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
        exclude: ['node_modules'],
    };
    const frameworkOverrides = {
        next: {
            compilerOptions: {
                ...base.compilerOptions,
                plugins: [{ name: 'next' }],
            },
        },
        vite: {
            compilerOptions: {
                ...base.compilerOptions,
                target: 'ES2020',
                useDefineForClassFields: true,
                module: 'ESNext',
                moduleResolution: 'bundler',
                allowImportingTsExtensions: true,
                noEmit: true,
            },
            include: ['src'],
        },
        react: {
            compilerOptions: {
                ...base.compilerOptions,
                target: 'ES2020',
                module: 'ESNext',
            },
        },
        angular: {
            compilerOptions: {
                ...base.compilerOptions,
                target: 'ES2022',
                module: 'ES2022',
                useDefineForClassFields: false,
                experimentalDecorators: true,
                emitDecoratorMetadata: true,
            },
        },
        vue: {
            compilerOptions: {
                ...base.compilerOptions,
                jsx: undefined,
                module: 'ESNext',
            },
        },
        nuxt: {
            extends: './.nuxt/tsconfig.json',
        },
        astro: {
            compilerOptions: {
                ...base.compilerOptions,
                jsx: 'react-jsx',
                jsxImportSource: 'react',
            },
        },
    };
    const config = frameworkOverrides[framework] ?? base;
    return JSON.stringify(config, null, 2);
}
//# sourceMappingURL=tsconfig.js.map