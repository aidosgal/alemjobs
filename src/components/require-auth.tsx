import { Redirect } from 'expo-router';
import { ReactNode } from 'react';

import { useAuth } from '@/contexts/auth-context';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { phase } = useAuth();

  if (phase === 'bootstrapping') {
    return null;
  }

  if (phase !== 'signedIn') {
    return <Redirect href="/auth/phone" />;
  }

  return children;
}
