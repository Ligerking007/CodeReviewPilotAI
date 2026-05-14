import { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useAppTheme } from '../theme/theme-context';

type Props = {
  children: ReactNode;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
};

export function Button({ children, onPress, disabled, loading, variant = 'primary' }: Props) {
  const { colors } = useAppTheme();
  const primary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: primary ? colors.accent : colors.surfaceMuted,
          borderColor: primary ? colors.accent : colors.border,
          opacity: disabled ? 0.55 : pressed ? 0.85 : 1
        }
      ]}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={[styles.text, { color: primary ? '#fff' : colors.text }]}>{children}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16
  },
  text: { fontSize: 15, fontWeight: '700' }
});
