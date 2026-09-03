import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { AuthColors, AuthRadius } from '@/constants/auth-theme';

type FilledTextFieldProps = TextInputProps & {
  error?: string;
  secureToggle?: boolean;
  leading?: React.ReactNode;
};

export function FilledTextField({
  style,
  error,
  secureToggle,
  secureTextEntry,
  leading,
  ...rest
}: FilledTextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const isSecure = secureToggle ? !revealed : secureTextEntry;

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          focused && styles.containerFocused,
          !!error && styles.containerError,
        ]}>
        {leading}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={AuthColors.placeholder}
          secureTextEntry={isSecure}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          {...rest}
        />
        {secureToggle && (
          <Pressable onPress={() => setRevealed((v) => !v)} hitSlop={8}>
            <Text style={styles.toggle}>{revealed ? 'Скрыть' : 'Показать'}</Text>
          </Pressable>
        )}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: AuthColors.fieldFill,
    borderRadius: AuthRadius.field,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  containerFocused: {
    borderColor: AuthColors.border,
  },
  containerError: {
    borderColor: AuthColors.error,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: AuthColors.text,
  },
  toggle: {
    color: AuthColors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  errorText: {
    color: AuthColors.error,
    fontSize: 12,
    paddingHorizontal: 4,
  },
});
