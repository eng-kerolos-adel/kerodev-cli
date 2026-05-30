// src/generators/web/configs/env.ts
export function generateEnvFiles(config) {
    const prefix = ['next', 'nuxt'].includes(config.framework)
        ? 'NEXT_PUBLIC_'
        : 'VITE_';
    const lines = [
        '# ─── App ─────────────────────────────────────────────────────────────────────',
        `${prefix}APP_NAME="${config.name}"`,
        `${prefix}APP_URL="http://localhost:3000"`,
        `${prefix}API_URL="/api"`,
        '',
    ];
    if (config.features.firebase) {
        lines.push('# ─── Firebase ────────────────────────────────────────────────────────────────', `${prefix}FIREBASE_API_KEY=""`, `${prefix}FIREBASE_AUTH_DOMAIN=""`, `${prefix}FIREBASE_PROJECT_ID=""`, `${prefix}FIREBASE_STORAGE_BUCKET=""`, `${prefix}FIREBASE_MESSAGING_SENDER_ID=""`, `${prefix}FIREBASE_APP_ID=""`, '');
    }
    if (config.features.supabase) {
        lines.push('# ─── Supabase ────────────────────────────────────────────────────────────────', `${prefix}SUPABASE_URL=""`, `${prefix}SUPABASE_ANON_KEY=""`, 'SUPABASE_SERVICE_ROLE_KEY=""', '');
    }
    lines.push('# ─── Database (optional) ─────────────────────────────────────────────────────', '# DATABASE_URL="postgresql://user:password@localhost:5432/dbname"', '', '# ─── Auth (optional) ─────────────────────────────────────────────────────────', '# AUTH_SECRET="your-secret-here"', '# AUTH_URL="http://localhost:3000"', '');
    const content = lines.join('\n');
    return [content, content]; // .env.local and .env.example have same structure
}
//# sourceMappingURL=env.js.map