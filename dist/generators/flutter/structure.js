// src/generators/flutter/structure.ts
import path from 'path';
import { createDirStructure, writeFile } from '../../utils/fs.js';
const COMMON_DIRS = [
    'lib/core/constants',
    'lib/core/extensions',
    'lib/core/errors',
    'lib/core/utils',
    'lib/core/theme',
    'lib/core/router',
    'lib/core/network',
    'lib/core/storage',
    'lib/shared/widgets',
    'lib/shared/models',
    'lib/config',
];
const ARCH_DIRS = {
    clean: [
        'lib/features',
        'lib/domain/entities',
        'lib/domain/repositories',
        'lib/domain/usecases',
        'lib/data/models',
        'lib/data/repositories',
        'lib/data/datasources/local',
        'lib/data/datasources/remote',
        'lib/presentation/pages',
        'lib/presentation/widgets',
        'lib/presentation/bloc',
    ],
    'feature-first': [
        'lib/features',
        // Feature dirs created dynamically per feature
    ],
    layered: [
        'lib/presentation/pages',
        'lib/presentation/widgets',
        'lib/presentation/controllers',
        'lib/domain/models',
        'lib/domain/services',
        'lib/data/repositories',
        'lib/data/datasources',
    ],
    mvc: [
        'lib/models',
        'lib/views',
        'lib/controllers',
        'lib/services',
    ],
    mvvm: [
        'lib/models',
        'lib/views',
        'lib/viewmodels',
        'lib/repositories',
        'lib/services',
    ],
    modular: [
        'lib/modules/auth',
        'lib/modules/home',
        'lib/modules/profile',
        'lib/shared/services',
        'lib/shared/repositories',
    ],
};
export async function generateFlutterStructure(ctx) {
    const cfg = ctx.config;
    const base = ctx.targetDir;
    const allDirs = [...COMMON_DIRS, ...(ARCH_DIRS[cfg.architecture] ?? [])];
    // Add state-manager-specific dirs
    if (cfg.stateManager === 'bloc' || cfg.stateManager === 'cubit') {
        allDirs.push('lib/core/bloc');
    }
    if (cfg.stateManager === 'riverpod') {
        allDirs.push('lib/core/providers');
    }
    await createDirStructure(base, allDirs);
    // Write .gitkeep for empty dirs and barrel files
    await Promise.all(allDirs.map(d => writeFile(path.join(base, d, '.gitkeep'), '')));
    // Feature example scaffold
    if (cfg.architecture === 'feature-first') {
        await generateExampleFeature(ctx);
    }
}
async function generateExampleFeature(ctx) {
    const cfg = ctx.config;
    const featureDir = path.join(ctx.targetDir, 'lib/features/example');
    const sm = cfg.stateManager;
    const dirs = [
        `${featureDir}/data/models`,
        `${featureDir}/data/repositories`,
        `${featureDir}/data/datasources`,
        `${featureDir}/domain/entities`,
        `${featureDir}/domain/repositories`,
        `${featureDir}/domain/usecases`,
        `${featureDir}/presentation/pages`,
        `${featureDir}/presentation/widgets`,
        sm === 'bloc' ? `${featureDir}/presentation/bloc` :
            sm === 'riverpod' ? `${featureDir}/presentation/providers` :
                sm === 'getx' ? `${featureDir}/presentation/controllers` :
                    `${featureDir}/presentation/viewmodel`,
    ];
    await createDirStructure('', dirs.filter(Boolean));
    await writeFile(path.join(featureDir, 'README.md'), `# Example Feature\n\nReplace this with your actual feature module.\n`);
}
//# sourceMappingURL=structure.js.map