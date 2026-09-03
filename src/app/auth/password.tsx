import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';

import { AuthScreenLayout } from '@/components/auth/auth-screen-layout';
import { FilledTextField } from '@/components/auth/filled-text-field';
import { LegalFooter } from '@/components/auth/legal-footer';
import { PillButton } from '@/components/auth/pill-button';
import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/lib/api/client';

const MIN_PASSWORD_LENGTH = 6;

export default function PasswordScreen() {
  const router = useRouter();
  const { phone, isRegistrated, submitPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!phone || isRegistrated === null) {
    return <Redirect href="/auth/phone" />;
  }

  const isNewAccount = !isRegistrated;
  const isValid = isNewAccount
    ? password.length >= MIN_PASSWORD_LENGTH && password === confirmPassword
    : password.length > 0;

  async function handleSubmit() {
    if (!isValid || loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await submitPassword(password);
      if (result.isRegistrated) {
        router.replace('/(tabs)/index');
      } else {
        router.push('/auth/create-profile');
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Не удалось проверить пароль. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreenLayout
      title={isNewAccount ? 'Придумайте пароль' : 'Введите пароль'}
      subtitle={`Для номера ${phone}`}
      showBack
      footer={
        <>
          <LegalFooter />
          <PillButton label="Продолжить" onPress={handleSubmit} disabled={!isValid} loading={loading} />
        </>
      }>
      <FilledTextField
        placeholder="Пароль"
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          setError(null);
        }}
        secureToggle
        autoFocus
        error={error ?? undefined}
      />
      {isNewAccount && (
        <FilledTextField
          placeholder="Повторите пароль"
          value={confirmPassword}
          onChangeText={(value) => {
            setConfirmPassword(value);
            setError(null);
          }}
          secureToggle
          error={
            confirmPassword.length > 0 && confirmPassword !== password
              ? 'Пароли не совпадают'
              : undefined
          }
        />
      )}
    </AuthScreenLayout>
  );
}
