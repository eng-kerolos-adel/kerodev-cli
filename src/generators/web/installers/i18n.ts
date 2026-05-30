// src/generators/web/installers/i18n.ts
// Installs and configures next-intl for Arabic + English with full RTL support.

import path from 'path';
import type { GeneratorContext, WebProjectConfig } from '../../../types/index.js';
import { run } from '../../../utils/exec.js';
import { writeFile } from '../../../utils/fs.js';
import { getAddCommand } from '../../../utils/packageManager.js';

export async function installI18n(ctx: GeneratorContext): Promise<void> {
  const cfg = ctx.config as WebProjectConfig;
  const { packageManager: pm, framework } = cfg;
  const base = ctx.targetDir;

  // Determine src root based on Next.js srcDir setting
  const srcRoot = framework === 'next'
    ? (cfg.srcDir ? path.join(base, 'src') : base)
    : path.join(base, 'src');

  // ── Install next-intl ────────────────────────────────────────────────────
  await run(getAddCommand(pm, false, 'next-intl'), { cwd: base });

  // ── Messages (translation files) ─────────────────────────────────────────
  const messagesDir = path.join(base, 'messages');

  await writeFile(path.join(messagesDir, 'en.json'), generateEnMessages());
  await writeFile(path.join(messagesDir, 'ar.json'), generateArMessages());

  // ── i18n config ──────────────────────────────────────────────────────────
  await writeFile(path.join(base, 'i18n.ts'), generateI18nConfig());

  // ── Middleware ────────────────────────────────────────────────────────────
  await writeFile(path.join(srcRoot, 'middleware.ts'), generateMiddleware());

  // ── Navigation helpers (typed) ────────────────────────────────────────────
  await writeFile(path.join(srcRoot, 'lib', 'navigation.ts'), generateNavigation());

  // ── Providers ────────────────────────────────────────────────────────────
  await writeFile(
    path.join(srcRoot, 'providers', 'I18nProvider.tsx'),
    generateI18nProvider()
  );

  // ── Custom hook ───────────────────────────────────────────────────────────
  await writeFile(
    path.join(srcRoot, 'hooks', 'useDirection.ts'),
    generateDirectionHook()
  );

  // ── Language Switcher component ───────────────────────────────────────────
  await writeFile(
    path.join(srcRoot, 'components', 'shared', 'LanguageSwitcher.tsx'),
    generateLanguageSwitcher()
  );

  // ── Update next.config.ts to include next-intl plugin ────────────────────
  if (framework === 'next') {
    await patchNextConfig(base);
  }
}

// ─── Translation Files ────────────────────────────────────────────────────────

function generateEnMessages(): string {
  return JSON.stringify({
    metadata: {
      title: 'My App',
      description: 'Welcome to my application',
    },
    nav: {
      home: 'Home',
      about: 'About',
      dashboard: 'Dashboard',
      settings: 'Settings',
      logout: 'Logout',
    },
    auth: {
      login: 'Login',
      register: 'Register',
      email: 'Email address',
      password: 'Password',
      confirmPassword: 'Confirm password',
      forgotPassword: 'Forgot password?',
      noAccount: "Don't have an account?",
      haveAccount: 'Already have an account?',
      loginSuccess: 'Logged in successfully',
      registerSuccess: 'Account created successfully',
      logoutSuccess: 'Logged out successfully',
      invalidCredentials: 'Invalid email or password',
    },
    common: {
      loading: 'Loading...',
      error: 'Something went wrong',
      retry: 'Try again',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      search: 'Search',
      noResults: 'No results found',
    },
    errors: {
      required: 'This field is required',
      invalidEmail: 'Please enter a valid email',
      passwordMin: 'Password must be at least 8 characters',
      passwordMatch: 'Passwords do not match',
      serverError: 'Server error. Please try again later.',
    },
  }, null, 2);
}

function generateArMessages(): string {
  return JSON.stringify({
    metadata: {
      title: 'تطبيقي',
      description: 'مرحباً بك في تطبيقي',
    },
    nav: {
      home: 'الرئيسية',
      about: 'من نحن',
      dashboard: 'لوحة التحكم',
      settings: 'الإعدادات',
      logout: 'تسجيل الخروج',
    },
    auth: {
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور',
      forgotPassword: 'نسيت كلمة المرور؟',
      noAccount: 'ليس لديك حساب؟',
      haveAccount: 'لديك حساب بالفعل؟',
      loginSuccess: 'تم تسجيل الدخول بنجاح',
      registerSuccess: 'تم إنشاء الحساب بنجاح',
      logoutSuccess: 'تم تسجيل الخروج بنجاح',
      invalidCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    },
    common: {
      loading: 'جاري التحميل...',
      error: 'حدث خطأ ما',
      retry: 'حاول مجدداً',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      confirm: 'تأكيد',
      back: 'رجوع',
      next: 'التالي',
      search: 'بحث',
      noResults: 'لا توجد نتائج',
    },
    errors: {
      required: 'هذا الحقل مطلوب',
      invalidEmail: 'يرجى إدخال بريد إلكتروني صحيح',
      passwordMin: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
      passwordMatch: 'كلمتا المرور غير متطابقتين',
      serverError: 'خطأ في الخادم. يرجى المحاولة لاحقاً.',
    },
  }, null, 2);
}

// ─── Config Files ─────────────────────────────────────────────────────────────

function generateI18nConfig(): string {
  return `import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // Supported locales
  locales: ['en', 'ar'],

  // Default locale
  defaultLocale: 'en',

  // Locale detection
  localeDetection: true,
});

// Type-safe locale type
export type Locale = (typeof routing.locales)[number];

// RTL locales — used for direction detection
export const RTL_LOCALES: Locale[] = ['ar'];

export function isRTL(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}
`;
}

function generateMiddleware(): string {
  return `import createMiddleware from 'next-intl/middleware';
import { routing } from '../i18n';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for:
  // - api routes
  // - next internal files
  // - static files
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/([\\w-]+)?/users/(.+)',
  ],
};
`;
}

function generateNavigation(): string {
  return `import { createNavigation } from 'next-intl/navigation';
import { routing } from '../../i18n';

// Type-safe navigation hooks and components
export const {
  Link,
  redirect,
  usePathname,
  useRouter,
  getPathname,
} = createNavigation(routing);
`;
}

function generateI18nProvider(): string {
  return `'use client';

import { AbstractIntlMessages, NextIntlClientProvider } from 'next-intl';
import { isRTL, type Locale } from '../../i18n';
import { useEffect } from 'react';

interface I18nProviderProps {
  locale: Locale;
  messages: AbstractIntlMessages;
  children: React.ReactNode;
}

export function I18nProvider({ locale, messages, children }: I18nProviderProps) {
  // Apply RTL direction to the document
  useEffect(() => {
    document.documentElement.dir = isRTL(locale) ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
`;
}

function generateDirectionHook(): string {
  return `import { useLocale } from 'next-intl';
import { isRTL, type Locale } from '../i18n';

/**
 * Returns the current text direction based on active locale.
 * Use this hook to apply RTL-aware styles in components.
 *
 * @example
 * const { dir, isRtl } = useDirection();
 * <div dir={dir} className={isRtl ? 'text-right' : 'text-left'}>
 */
export function useDirection() {
  const locale = useLocale() as Locale;
  const rtl = isRTL(locale);

  return {
    dir: rtl ? 'rtl' : 'ltr',
    isRtl: rtl,
    isLtr: !rtl,
    locale,
  } as const;
}
`;
}

function generateLanguageSwitcher(): string {
  return `'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '../../lib/navigation';
import { routing, type Locale } from '../../i18n';

const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
};

const LOCALE_FLAGS: Record<Locale, string> = {
  en: '🇬🇧',
  ar: '🇸🇦',
};

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(newLocale: Locale) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div className="flex items-center gap-2">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleChange(loc as Locale)}
          className={[
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            locale === loc
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted text-muted-foreground',
          ].join(' ')}
          aria-label={\`Switch to \${LOCALE_LABELS[loc as Locale]}\`}
        >
          <span>{LOCALE_FLAGS[loc as Locale]}</span>
          <span>{LOCALE_LABELS[loc as Locale]}</span>
        </button>
      ))}
    </div>
  );
}
`;
}

async function patchNextConfig(base: string): Promise<void> {
  const cfgPath = path.join(base, 'next.config.ts');
  const { default: fse } = await import('fs-extra');

  if (!(await fse.pathExists(cfgPath))) return;

  const content = await fse.readFile(cfgPath, 'utf-8');
  if (content.includes('next-intl')) return; // already patched

  const patched = `import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

` + content.replace('export default nextConfig;', 'export default withNextIntl(nextConfig);');

  await fse.writeFile(cfgPath, patched, 'utf-8');
}
