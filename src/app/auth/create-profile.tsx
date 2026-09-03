import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthScreenLayout } from '@/components/auth/auth-screen-layout';
import { FilledTextField } from '@/components/auth/filled-text-field';
import { LegalFooter } from '@/components/auth/legal-footer';
import { PillButton } from '@/components/auth/pill-button';
import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/lib/api/client';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CreateProfileScreen() {
  const router = useRouter();
  const { phase, submitProfile } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (phase !== 'awaitingProfile') {
    return <Redirect href="/auth/phone" />;
  }

  const isValid = firstName.trim().length > 0 && lastName.trim().length > 0 && EMAIL_REGEX.test(email);

  async function handleSubmit() {
    if (!isValid || loading) return;
    setLoading(true);
    setError(null);
    try {
      await submitProfile({ first_name: firstName.trim(), last_name: lastName.trim(), email: email.trim() });
      router.replace('/(tabs)/index');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Не удалось создать профиль. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreenLayout
      title="Создайте ваш профиль"
      showBack
      footer={
        <>
          <LegalFooter />
          <PillButton label="Завершить" onPress={handleSubmit} disabled={!isValid} loading={loading} />
        </>
      }>
      <View style={styles.row}>
        <View style={styles.half}>
          <FilledTextField placeholder="Имя" value={firstName} onChangeText={setFirstName} autoFocus />
        </View>
        <View style={styles.half}>
          <FilledTextField placeholder="Фамилия" value={lastName} onChangeText={setLastName} />
        </View>
      </View>
      <FilledTextField
        placeholder="Электронная почта"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        error={error ?? undefined}
      />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
});
