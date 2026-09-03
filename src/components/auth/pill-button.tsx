import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { AuthColors, AuthRadius } from '@/constants/auth-theme';

type PillButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function PillButton({ label, onPress, disabled, loading }: PillButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && styles.buttonPressed,
      ]}>
      {loading ? (
        <ActivityIndicator color={AuthColors.accentText} />
      ) : (
        <Text style={[styles.label, isDisabled && styles.labelDisabled]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: AuthColors.accent,
    borderRadius: AuthRadius.pill,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    backgroundColor: AuthColors.disabledFill,
  },
  label: {
    color: AuthColors.accentText,
    fontSize: 16,
    fontWeight: '700',
  },
  labelDisabled: {
    color: AuthColors.disabledText,
  },
});
