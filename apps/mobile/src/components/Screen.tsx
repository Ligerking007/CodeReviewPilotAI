import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { buildTheme } from '../theme/theme';

export function Screen({ children }: PropsWithChildren) {
  const colors = buildTheme(useColorScheme() === 'dark');
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, padding: 20 },
  content: { width: '100%', maxWidth: 980, alignSelf: 'center', gap: 16 }
});
