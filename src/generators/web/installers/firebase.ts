// src/generators/web/installers/firebase.ts
// Full Firebase setup: Auth, Firestore, Storage — with React context + hooks.

import path from 'path';
import type { GeneratorContext, WebProjectConfig } from '../../../types/index.js';
import { run } from '../../../utils/exec.js';
import { writeFile } from '../../../utils/fs.js';
import { getAddCommand } from '../../../utils/packageManager.js';

export async function installFirebase(ctx: GeneratorContext): Promise<void> {
  const cfg = ctx.config as WebProjectConfig;
  const { packageManager: pm } = cfg;
  const base = ctx.targetDir;

  const srcRoot = cfg.framework === 'next'
    ? (cfg.srcDir ? path.join(base, 'src') : base)
    : path.join(base, 'src');

  // ── Install packages ──────────────────────────────────────────────────────
  await run(getAddCommand(pm, false, 'firebase'), { cwd: base });

  // ── Firebase config ───────────────────────────────────────────────────────
  await writeFile(path.join(srcRoot, 'lib', 'firebase', 'config.ts'), generateFirebaseConfig());
  await writeFile(path.join(srcRoot, 'lib', 'firebase', 'auth.ts'), generateFirebaseAuth());
  await writeFile(path.join(srcRoot, 'lib', 'firebase', 'firestore.ts'), generateFirestore());
  await writeFile(path.join(srcRoot, 'lib', 'firebase', 'storage.ts'), generateFirebaseStorage());
  await writeFile(path.join(srcRoot, 'lib', 'firebase', 'index.ts'), generateFirebaseBarrel());

  // ── Auth Context & Hook ───────────────────────────────────────────────────
  await writeFile(
    path.join(srcRoot, 'providers', 'FirebaseAuthProvider.tsx'),
    generateAuthProvider()
  );
  await writeFile(
    path.join(srcRoot, 'hooks', 'useFirebaseAuth.ts'),
    generateAuthHook()
  );

  // ── Auth Pages ────────────────────────────────────────────────────────────
  if (cfg.framework === 'next') {
    const appDir = cfg.srcDir ? path.join(base, 'src', 'app') : path.join(base, 'app');
    await writeFile(path.join(appDir, '(auth)', 'login', 'page.tsx'), generateLoginPage());
    await writeFile(path.join(appDir, '(auth)', 'register', 'page.tsx'), generateRegisterPage());
  }

  // ── Update .env.example ───────────────────────────────────────────────────
  await appendFirebaseEnv(path.join(base, '.env.example'));
  await appendFirebaseEnv(path.join(base, '.env.local'));
}

// ─── Firebase Config ──────────────────────────────────────────────────────────

function generateFirebaseConfig(): string {
  return `import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey:            process.env['NEXT_PUBLIC_FIREBASE_API_KEY'],
  authDomain:        process.env['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'],
  projectId:         process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'],
  storageBucket:     process.env['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'],
  messagingSenderId: process.env['NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'],
  appId:             process.env['NEXT_PUBLIC_FIREBASE_APP_ID'],
};

// Initialize Firebase (singleton pattern — safe for Next.js)
const app: FirebaseApp = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0]!;

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export default app;
`;
}

function generateFirebaseAuth(): string {
  return `import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  type User,
  type UserCredential,
} from 'firebase/auth';
import { auth } from './config';

// ─── Email / Password Auth ────────────────────────────────────────────────────

export async function registerWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(credential.user, { displayName });
  }
  return credential;
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logout(): Promise<void> {
  return signOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email);
}

// ─── Google Auth ──────────────────────────────────────────────────────────────

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function loginWithGoogle(): Promise<UserCredential> {
  return signInWithPopup(auth, googleProvider);
}

// ─── Auth State Observer ──────────────────────────────────────────────────────

export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export { type User };
`;
}

function generateFirestore(): string {
  return `import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type DocumentData,
  type QueryConstraint,
  type WithFieldValue,
} from 'firebase/firestore';
import { db } from './config';

// ─── Generic CRUD helpers ─────────────────────────────────────────────────────

export async function getDocument<T>(
  collectionName: string,
  docId: string
): Promise<T | null> {
  const ref = doc(db, collectionName, docId);
  const snap = await getDoc(ref);
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null;
}

export async function getDocuments<T>(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<T[]> {
  const ref = collection(db, collectionName);
  const q = query(ref, ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as T));
}

export async function createDocument<T extends DocumentData>(
  collectionName: string,
  data: WithFieldValue<T>
): Promise<string> {
  const ref = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function setDocument<T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: WithFieldValue<T>
): Promise<void> {
  await setDoc(doc(db, collectionName, docId), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function updateDocument(
  collectionName: string,
  docId: string,
  data: Partial<DocumentData>
): Promise<void> {
  await updateDoc(doc(db, collectionName, docId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  await deleteDoc(doc(db, collectionName, docId));
}

// Re-export query helpers for convenience
export { where, orderBy, limit };
`;
}

function generateFirebaseStorage(): string {
  return `import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTask,
} from 'firebase/storage';
import { storage } from './config';

export interface UploadProgress {
  progress: number;
  downloadURL?: string;
  error?: Error;
}

/**
 * Upload a file to Firebase Storage with progress tracking.
 */
export function uploadFile(
  file: File,
  storagePath: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, storagePath);
    const uploadTask: UploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.({ progress });
      },
      (error) => {
        onProgress?.({ progress: 0, error });
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        onProgress?.({ progress: 100, downloadURL });
        resolve(downloadURL);
      }
    );
  });
}

/**
 * Delete a file from Firebase Storage.
 */
export async function deleteFile(storagePath: string): Promise<void> {
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
}

/**
 * Get the download URL for a stored file.
 */
export async function getFileURL(storagePath: string): Promise<string> {
  const storageRef = ref(storage, storagePath);
  return getDownloadURL(storageRef);
}
`;
}

function generateFirebaseBarrel(): string {
  return `// Firebase — barrel export
export * from './config';
export * from './auth';
export * from './firestore';
export * from './storage';
`;
}

// ─── Auth Provider ────────────────────────────────────────────────────────────

function generateAuthProvider(): string {
  return `'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChange, type User } from '../lib/firebase/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isAuthenticated: false,
});

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside FirebaseAuthProvider');
  return ctx;
}
`;
}

function generateAuthHook(): string {
  return `'use client';

import { useState } from 'react';
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  logout,
  resetPassword,
} from '../lib/firebase/auth';

/**
 * Hook providing all Firebase Auth actions with loading + error state.
 */
export function useFirebaseAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function clearError() { setError(null); }

  async function signIn(email: string, password: string) {
    setLoading(true); setError(null);
    try {
      await loginWithEmail(email, password);
    } catch (err: unknown) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string, name?: string) {
    setLoading(true); setError(null);
    try {
      await registerWithEmail(email, password, name);
    } catch (err: unknown) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setLoading(true); setError(null);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    setLoading(true);
    try { await logout(); } finally { setLoading(false); }
  }

  async function forgotPassword(email: string) {
    setLoading(true); setError(null);
    try {
      await resetPassword(email);
    } catch (err: unknown) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return { signIn, signUp, signInWithGoogle, signOut, forgotPassword, loading, error, clearError };
}

function getFirebaseErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  const map: Record<string, string> = {
    'auth/user-not-found':      'No account found with this email.',
    'auth/wrong-password':      'Incorrect password.',
    'auth/email-already-in-use':'This email is already registered.',
    'auth/weak-password':       'Password must be at least 6 characters.',
    'auth/invalid-email':       'Please enter a valid email address.',
    'auth/too-many-requests':   'Too many attempts. Please try again later.',
    'auth/popup-closed-by-user':'Sign-in popup was closed.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  };
  return map[code] ?? 'An unexpected error occurred. Please try again.';
}
`;
}

// ─── Auth Pages ───────────────────────────────────────────────────────────────

function generateLoginPage(): string {
  return `'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle, loading, error } = useFirebaseAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await signIn(email, password);
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-md border">
        <h1 className="text-2xl font-bold text-center">Sign in</h1>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-input focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-input focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs text-muted-foreground">
            <span className="bg-card px-2">or continue with</span>
          </div>
        </div>

        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full py-2.5 rounded-lg border hover:bg-muted font-medium disabled:opacity-50"
        >
          Continue with Google
        </button>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <a href="/register" className="text-primary hover:underline font-medium">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
`;
}

function generateRegisterPage(): string {
  return `'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, loading, error } = useFirebaseAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError('');
    if (password !== confirm) { setLocalError('Passwords do not match.'); return; }
    await signUp(email, password, name);
    router.push('/dashboard');
  }

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-md border">
        <h1 className="text-2xl font-bold text-center">Create account</h1>

        {displayError && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-input focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-input focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-input focus:outline-none focus:ring-2 focus:ring-ring"
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-input focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <a href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
`;
}

async function appendFirebaseEnv(envPath: string): Promise<void> {
  const { default: fse } = await import('fs-extra');
  if (!(await fse.pathExists(envPath))) return;

  const existing = await fse.readFile(envPath, 'utf-8');
  if (existing.includes('FIREBASE')) return;

  const firebaseVars = `
# ─── Firebase ────────────────────────────────────────────────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=""
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=""
NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=""
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=""
NEXT_PUBLIC_FIREBASE_APP_ID=""
`;
  await fse.appendFile(envPath, firebaseVars, 'utf-8');
}
