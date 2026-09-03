import { useRouter } from 'expo-router';
import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthColors } from '@/constants/auth-theme';

type AuthScreenLayoutProps = {
  title: string;
  subtitle?: ReactNode;
  showBack?: boolean;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthScreenLayout({
  title,
  subtitle,
  showBack,
  children,
  footer,
}: AuthScreenLayoutProps) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <View style={styles.header}>
            {showBack && (
              <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backArrowPressable}>
                <Text style={styles.backArrow}>{'←'}</Text>
              </Pressable>
            )}
            <Text style={styles.title}>{title}</Text>
            {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>

          <View style={styles.form}>{children}</View>

          <View style={styles.footer}>{footer}</View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AuthColors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: 16,
    gap: 12,
  },
  backArrowPressable: {
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  backArrow: {
    fontSize: 22,
    color: AuthColors.text,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: AuthColors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: AuthColors.textSecondary,
    lineHeight: 20,
  },
  form: {
    gap: 16,
  },
  footer: {
    gap: 16,
    paddingBottom: 16,
  },
});
