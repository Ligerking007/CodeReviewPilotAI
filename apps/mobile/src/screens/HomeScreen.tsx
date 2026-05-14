import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, TextInput, useColorScheme, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../i18n';
import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { createReview, loginWithGithubToken } from '../services/api';
import { saveLocalReview } from '../services/storage';
import { useAuth } from '../store/auth-context';
import { buildTheme } from '../theme/theme';
import { RootStackParamList } from '../types/navigation';
import { isValidPullRequestUrl } from '../utils/pr-url';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const colors = buildTheme(useColorScheme() === 'dark');
  const { token, login, logout, setSessionToken } = useAuth();
  const [prUrl, setPrUrl] = useState('');
  const [githubPat, setGithubPat] = useState('');
  const [loading, setLoading] = useState(false);
  const [patLoading, setPatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const language = i18n.language === 'th' ? 'th' : 'en';

  async function onReview() {
    if (!token) {
      setError(t('loginRequired'));
      return;
    }
    if (!isValidPullRequestUrl(prUrl)) {
      setError(t('prPlaceholder'));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const review = await createReview(token, prUrl, language);
      await saveLocalReview(review);
      navigation.navigate('Result', { review });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Review failed');
    } finally {
      setLoading(false);
    }
  }

  async function onConnectPat() {
    setPatLoading(true);
    setError(null);
    setNotice(null);
    try {
      const result = await loginWithGithubToken(githubPat.trim());
      await setSessionToken(result.appToken);
      setGithubPat('');
      setNotice(t('githubPatSaved'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'GitHub token connection failed');
    } finally {
      setPatLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>{t('appName')}</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>{t('subtitle')}</Text>
        </View>
        <View style={styles.actions}>
          <Pressable style={[styles.iconButton, { borderColor: colors.border }]} onPress={() => i18n.changeLanguage(language === 'en' ? 'th' : 'en')}>
            <Text style={[styles.iconButtonText, { color: colors.text }]}>{language.toUpperCase()}</Text>
          </Pressable>
          <Pressable style={[styles.iconButton, { borderColor: colors.border }]} onPress={() => navigation.navigate('History')}>
            <Ionicons name="time-outline" size={20} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.text }]}>{t('pastePr')}</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          value={prUrl}
          onChangeText={setPrUrl}
          placeholder={t('prPlaceholder')}
          placeholderTextColor={colors.muted}
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.codeBackground }]}
        />
        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
        {notice ? <Text style={[styles.notice, { color: colors.success }]}>{notice}</Text> : null}
        <View style={styles.buttonRow}>
          <Button onPress={token ? logout : login} variant="secondary">
            {token ? t('logout') : t('loginGithub')}
          </Button>
          <Button onPress={onReview} loading={loading} disabled={!prUrl}>
            {loading ? t('reviewing') : t('review')}
          </Button>
        </View>
      </View>

      {!token ? (
        <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.text }]}>{t('githubPat')}</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            value={githubPat}
            onChangeText={setGithubPat}
            placeholder={t('githubPatPlaceholder')}
            placeholderTextColor={colors.muted}
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.codeBackground }]}
          />
          <Text style={[styles.help, { color: colors.muted }]}>{t('githubPatHelp')}</Text>
          <View style={styles.buttonRow}>
            <Button onPress={onConnectPat} loading={patLoading} disabled={!githubPat.trim()}>
              {t('connectPat')}
            </Button>
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' },
  title: { fontSize: 34, fontWeight: '800' },
  subtitle: { marginTop: 8, fontSize: 16, lineHeight: 22, maxWidth: 560 },
  actions: { flexDirection: 'row', gap: 8 },
  iconButton: { width: 44, height: 44, borderWidth: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  iconButtonText: { fontWeight: '800' },
  panel: { borderWidth: 1, borderRadius: 8, padding: 18, gap: 12 },
  label: { fontSize: 15, fontWeight: '700' },
  input: { minHeight: 52, borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, fontSize: 15 },
  error: { fontSize: 13 },
  notice: { fontSize: 13, fontWeight: '700' },
  help: { fontSize: 13, lineHeight: 18 },
  buttonRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }
});
