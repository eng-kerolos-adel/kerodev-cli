// src/generators/web/installers/supabase.ts
// Full Supabase setup: Auth, Database (typed), Storage, SSR helpers.

import path from 'path';
import type { GeneratorContext, WebProjectConfig } from '../../../types/index.js';
import { run } from '../../../utils/exec.js';
import { writeFile } from '../../../utils/fs.js';
import { getAddCommand } from '../../../utils/packageManager.js';

export async function installSupabase(ctx: GeneratorContext): Promise<void> {
  const cfg = ctx.config as WebProjectConfig;
  const { packageManager: pm, framework } = cfg;
  const base = ctx.targetDir;

  const srcRoot = framework === 'next'
    ? (cfg.srcDir ? path.join(base, 'src') : base)
    : path.join(base, 'src');

  // ── Install packages ──────────────────────────────────────────────────────
  const packages = ['@supabase/supabase-js'];
  if (framework === 'next') packages.push('@supabase/ssr');
  await run(getAddCommand(pm, false, ...packages), { cwd: base });

  // ── Supabase client ───────────────────────────────────────────────────────
  await writeFile(path.join(srcRoot, 'lib', 'supabase', 'client.ts'), generateBrowserClient());
  await writeFile(path.join(srcRoot, 'lib', 'supabase', 'types.ts'), generateSupabaseTypes());
  await writeFile(path.join(srcRoot, 'lib', 'supabase', 'index.ts'), generateSupabaseBarrel());

  if (framework === 'next') {
    await writeFile(path.join(srcRoot, 'lib', 'supabase', 'server.ts'), generateServerClient());
    await writeFile(path.join(srcRoot, 'lib', 'supabase', 'middleware.ts'), generateSupabaseMiddleware());

    // Auth helpers
    await writeFile(
      path.join(srcRoot, 'lib', 'supabase', 'auth.ts'),
      generateSupabaseAuth()
    );

    // Update or create middleware.ts
    await writeFile(path.join(srcRoot, 'middleware.ts'), generateNextMiddleware());

    // Auth pages
    const appDir = cfg.srcDir ? path.join(base, 'src', 'app') : path.join(base, 'app');
    await writeFile(path.join(appDir, '(auth)', 'login', 'page.tsx'), generateSupabaseLoginPage());
    await writeFile(path.join(appDir, '(auth)', 'register', 'page.tsx'), generateSupabaseRegisterPage());
    await writeFile(path.join(appDir, 'auth', 'callback', 'route.ts'), generateAuthCallback());
  }

  // ── Hook ──────────────────────────────────────────────────────────────────
  await writeFile(
    path.join(srcRoot, 'hooks', 'useSupabaseAuth.ts'),
    generateSupabaseAuthHook()
  );

  // ── Env vars ──────────────────────────────────────────────────────────────
  await appendSupabaseEnv(path.join(base, '.env.local'));
  await appendSupabaseEnv(path.join(base, '.env.example'));
}

// ─── Supabase Clients ─────────────────────────────────────────────────────────

function generateBrowserClient(): string {
  return `import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

/**
 * Supabase browser client — use in Client Components.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!
  );
}
`;
}

function generateServerClient(): string {
  return `import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

/**
 * Supabase server client — use in Server Components, Route Handlers, Server Actions.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    {
      cookies: {
        getAll()  { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch { /* Server Component — ignore */ }
        },
      },
    }
  );
}
`;
}

function generateSupabaseMiddleware(): string {
  return `import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import type { Database } from './types';

/**
 * Refresh the session in middleware so it stays alive across requests.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    {
      cookies: {
        getAll()  { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session (do not remove this line)
  const { data: { user } } = await supabase.auth.getUser();

  // Protect /dashboard routes
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
`;
}

function generateNextMiddleware(): string {
  return `import { type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
`;
}

function generateSupabaseAuth(): string {
  return `import { createClient } from './server';

// ─── Server-side Auth Helpers ─────────────────────────────────────────────────

export async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) return null;
  return user;
}

export async function getSession() {
  const supabase = await createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) return null;
  return session;
}

export async function requireUser() {
  const user = await getUser();
  if (!user) throw new Error('Authentication required');
  return user;
}
`;
}

function generateSupabaseTypes(): string {
  return `// ─── Supabase Database Types ──────────────────────────────────────────────────
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.ts
// to auto-generate these from your database schema.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
`;
}

function generateSupabaseBarrel(): string {
  return `export { createClient as createBrowserClient } from './client';
export { createClient as createServerClient } from './server';
export * from './types';
export * from './auth';
`;
}

// ─── Auth Hook ────────────────────────────────────────────────────────────────

function generateSupabaseAuthHook(): string {
  return `'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

/**
 * Hook providing Supabase Auth state and actions.
 */
export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    setError(null); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  }

  async function signUp(email: string, password: string, metadata?: { full_name?: string }) {
    setError(null); setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password, options: { data: metadata } });
    if (error) setError(error.message);
    setLoading(false);
  }

  async function signInWithGoogle() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: \`\${location.origin}/auth/callback\` },
    });
    if (error) setError(error.message);
  }

  async function signOut() {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  }

  async function resetPassword(email: string) {
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: \`\${location.origin}/auth/reset-password\`,
    });
    if (error) setError(error.message);
  }

  return {
    user,
    session,
    loading,
    error,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
  };
}
`;
}

// ─── Auth Pages ───────────────────────────────────────────────────────────────

function generateSupabaseLoginPage(): string {
  return `'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle, loading, error } = useSupabaseAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await signIn(email, password);
    if (!error) router.push('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-md border">
        <h1 className="text-2xl font-bold text-center">Sign in</h1>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-input focus:outline-none focus:ring-2 focus:ring-ring" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-input focus:outline-none focus:ring-2 focus:ring-ring" required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <button onClick={signInWithGoogle} disabled={loading}
          className="w-full py-2.5 rounded-lg border hover:bg-muted font-medium disabled:opacity-50">
          Continue with Google
        </button>

        <p className="text-center text-sm text-muted-foreground">
          No account?{' '}
          <a href="/register" className="text-primary hover:underline font-medium">Register</a>
        </p>
      </div>
    </div>
  );
}
`;
}

function generateSupabaseRegisterPage(): string {
  return `'use client';

import { useState } from 'react';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';

export default function RegisterPage() {
  const { signUp, loading, error } = useSupabaseAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await signUp(email, password, { full_name: name });
    if (!error) setDone(true);
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <h2 className="text-xl font-semibold">Check your email</h2>
          <p className="text-muted-foreground">We sent you a confirmation link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-md border">
        <h1 className="text-2xl font-bold text-center">Create account</h1>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-input focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-input focus:outline-none focus:ring-2 focus:ring-ring" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-input focus:outline-none focus:ring-2 focus:ring-ring" required minLength={8} />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50">
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <a href="/login" className="text-primary hover:underline font-medium">Sign in</a>
        </p>
      </div>
    </div>
  );
}
`;
}

function generateAuthCallback(): string {
  return `import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

/**
 * Supabase OAuth callback handler.
 * Add /auth/callback to your Supabase redirect URLs.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth_failed', url.origin));
}
`;
}

async function appendSupabaseEnv(envPath: string): Promise<void> {
  const { default: fse } = await import('fs-extra');
  if (!(await fse.pathExists(envPath))) return;
  const existing = await fse.readFile(envPath, 'utf-8');
  if (existing.includes('SUPABASE')) return;

  await fse.appendFile(envPath, `
# ─── Supabase ────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
`, 'utf-8');
}
