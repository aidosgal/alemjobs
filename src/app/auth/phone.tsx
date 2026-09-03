import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { AuthScreenLayout } from '@/components/auth/auth-screen-layout';
import { FilledTextField } from '@/components/auth/filled-text-field';
import { LegalFooter } from '@/components/auth/legal-footer';
import { PillButton } from '@/components/auth/pill-button';
import { AuthColors } from '@/constants/auth-theme';
import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/lib/api/client';

export default function PhoneScreen() {
  const router = useRouter();
  const { startLogin } = useAuth();
  const [digits, setDigits] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isValid = digits.length === 10;

  async function handleSubmit() {
    if (!isValid || loading) return;
    setLoading(true);
    setError(null);
    try {
      await startLogin(`+7${digits}`);
      router.push('/auth/password');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Не удалось отправить запрос. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScreenLayout
      title="Ваш номер телефона"
      subtitle="Мы найдём ваш аккаунт или поможем создать новый"
      footer={
        <>
          <LegalFooter />
          <PillButton label="Продолжить" onPress={handleSubmit} disabled={!isValid} loading={loading} />
        </>
      }>
      <FilledTextField
        placeholder="705 308 16 59"
        keyboardType="number-pad"
        value={digits}
        onChangeText={(value) => setDigits(value.replace(/\D/g, '').slice(0, 10))}
        autoFocus
        error={error ?? undefined}
        leading={
          <View>
            <Text style={{ color: AuthColors.text, fontSize: 16, fontWeight: '600' }}>+7</Text>
          </View>
        }
      />
    </AuthScreenLayout>
  );
}
