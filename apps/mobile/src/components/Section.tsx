import { PropsWithChildren, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../theme/theme-context';

type Props = PropsWithChildren<{
  title: string;
  count?: number;
  defaultOpen?: boolean;
}>;

export function Section({ title, count, defaultOpen, children }: Props) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const { colors } = useAppTheme();

  return (
    <View style={[styles.section, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <Pressable style={styles.header} onPress={() => setOpen((value) => !value)}>
        <View style={styles.titleRow}>
          <Ionicons name={open ? 'chevron-down' : 'chevron-forward'} size={18} color={colors.muted} />
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        </View>
        {typeof count === 'number' ? <Text style={[styles.count, { color: colors.muted }]}>{count}</Text> : null}
      </Pressable>
      {open ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { borderWidth: 1, borderRadius: 8, overflow: 'hidden' },
  header: { minHeight: 48, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 16, fontWeight: '700' },
  count: { fontSize: 13, fontWeight: '700' },
  body: { padding: 14, gap: 12 }
});
