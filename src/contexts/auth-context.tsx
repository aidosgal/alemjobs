import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import * as authApi from '@/lib/api/auth';
import type { AuthToken, AuthUser } from '@/lib/api/auth';
import { secureStorage } from '@/lib/secure-storage';

const TOKEN_KEY = 'alemjobs.auth.token';
const USER_KEY = 'alemjobs.auth.user';

type AuthPhase = 'bootstrapping' | 'anonymous' | 'awaitingPassword' | 'awaitingProfile' | 'signedIn';

type RegisterProfileInput = {
  first_name: string;
  last_name: string;
  email: string;
};

type AuthContextValue = {
  phase: AuthPhase;
  phone: string | null;
  isRegistrated: boolean | null;
  token: AuthToken | null;
  user: AuthUser | null;
  needsOrganization: boolean;
  startLogin: (phone: string) => Promise<{ isRegistrated: boolean }>;
  submitPassword: (password: string) => Promise<{ isRegistrated: boolean }>;
  submitProfile: (profile: RegisterProfileInput) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<AuthPhase>('bootstrapping');
  const [phone, setPhone] = useState<string | null>(null);
  const [isRegistrated, setIsRegistrated] = useState<boolean | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [pendingPassword, setPendingPassword] = useState<string | null>(null);
  const [token, setToken] = useState<AuthToken | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [needsOrganization, setNeedsOrganization] = useState(false);

  useEffect(() => {
    (async () => {
      const [storedToken, storedUser] = await Promise.all([
        secureStorage.getItem(TOKEN_KEY),
        secureStorage.getItem(USER_KEY),
      ]);

      if (storedToken && storedUser) {
        setToken(JSON.parse(storedToken));
        setUser(JSON.parse(storedUser));
        setPhase('signedIn');
      } else {
        setPhase('anonymous');
      }
    })();
  }, []);

  async function persistSession(nextToken: AuthToken, nextUser: AuthUser) {
    await Promise.all([
      secureStorage.setItem(TOKEN_KEY, JSON.stringify(nextToken)),
      secureStorage.setItem(USER_KEY, JSON.stringify(nextUser)),
    ]);
    setToken(nextToken);
    setUser(nextUser);
  }

  async function startLogin(nextPhone: string) {
    const response = await authApi.login(nextPhone);
    setPhone(nextPhone);
    setAttemptId(response.attempt_id);
    setIsRegistrated(response.is_registrated);
    setPhase('awaitingPassword');
    return { isRegistrated: response.is_registrated };
  }

  async function submitPassword(password: string) {
    if (!attemptId) {
      throw new Error('No active login attempt. Start over from the phone screen.');
    }

    const response = await authApi.confirm(attemptId, password);

    if (isRegistrated) {
      setNeedsOrganization(
        (response.user.role === 'manager' || response.user.role === 'owner') &&
          response.user.organization_id === null,
      );
      await persistSession(response.token, response.user);
      setPhase('signedIn');
      return { isRegistrated: true };
    }

    setPendingPassword(password);
    setPhase('awaitingProfile');
    return { isRegistrated: false };
  }

  async function submitProfile(profile: RegisterProfileInput) {
    if (!attemptId || !pendingPassword) {
      throw new Error('No active registration attempt. Start over from the phone screen.');
    }

    const response = await authApi.register({
      attempt_id: attemptId,
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      password: pendingPassword,
      password_confirm: pendingPassword,
      role: 'user',
    });

    await persistSession(response.token, response.user);
    setPendingPassword(null);
    setPhase('signedIn');
  }

  async function signOut() {
    await Promise.all([secureStorage.deleteItem(TOKEN_KEY), secureStorage.deleteItem(USER_KEY)]);
    setToken(null);
    setUser(null);
    setPhone(null);
    setIsRegistrated(null);
    setAttemptId(null);
    setPendingPassword(null);
    setNeedsOrganization(false);
    setPhase('anonymous');
  }

  const value: AuthContextValue = {
    phase,
    phone,
    isRegistrated,
    token,
    user,
    needsOrganization,
    startLogin,
    submitPassword,
    submitProfile,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
