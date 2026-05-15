import { PropsWithChildren } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../theme/theme-context';
import { RootStackParamList } from '../types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

function AppHeader() {
  const navigation = useNavigation<Navigation>();
  const { t, i18n } = useTranslation();
  const { colors, mode, cycleMode } = useAppTheme();
  const language = i18n.language === 'th' ? 'th' : 'en';

  return (
    <View style={styles.header}>
      <Pressable style={styles.brand} onPress={() => navigation.navigate('Home')}>
        <Text style={[styles.title, { color: colors.text }]}>{t('appName')}</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>{t('subtitle')}</Text>
      </Pressable>
      <View style={styles.actions}>
        <Pressable accessibilityLabel={t('themeMode')} style={[styles.iconButton, { borderColor: colors.border }]} onPress={cycleMode}>
          <Ionicons name={mode === 'dark' ? 'moon' : mode === 'light' ? 'sunny' : 'phone-portrait-outline'} size={20} color={colors.text} />
        </Pressable>
        <Pressable style={[styles.iconButton, { borderColor: colors.border }]} onPress={() => i18n.changeLanguage(language === 'en' ? 'th' : 'en')}>
          <Text style={[styles.iconButtonText, { color: colors.text }]}>{language.toUpperCase()}</Text>
        </Pressable>
        <Pressable accessibilityLabel={t('history')} style={[styles.iconButton, { borderColor: colors.border }]} onPress={() => navigation.navigate('History')}>
          <Ionicons name="time-outline" size={20} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

export function Screen({ children }: PropsWithChildren) {
  const { colors } = useAppTheme();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <AppHeader />
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, padding: 20 },
  content: { width: '100%', maxWidth: 980, alignSelf: 'center', gap: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' },
  brand: { flex: 1, minWidth: 240 },
  title: { fontSize: 34, fontWeight: '800' },
  subtitle: { marginTop: 8, fontSize: 16, lineHeight: 22, maxWidth: 560 },
  actions: { flexDirection: 'row', gap: 8 },
  iconButton: { width: 44, height: 44, borderWidth: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  iconButtonText: { fontWeight: '800' }
});
