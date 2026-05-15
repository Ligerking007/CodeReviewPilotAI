import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../i18n';
import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { appInfo } from '../constants/app-info';
import { createReview, loginWithGithubCli, loginWithGithubToken } from '../services/api';
import { saveLocalReview } from '../services/storage';
import { useAuth } from '../store/auth-context';
import { useAppTheme } from '../theme/theme-context';
import { RootStackParamList } from '../types/navigation';
import { isValidPullRequestUrl } from '../utils/pr-url';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;
type LoginMethod = 'oauth' | 'pat' | 'cli';

export function HomeScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const { token, githubUsername, login, logout, setSessionToken } = useAuth();
  const [prUrl, setPrUrl] = useState('');
  const [githubPat, setGithubPat] = useState('');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('cli');
  const [loading, setLoading] = useState(false);
  const [patLoading, setPatLoading] = useState(false);
  const [cliLoading, setCliLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [releaseNotesOpen, setReleaseNotesOpen] = useState(false);
  const language = i18n.language === 'th' ? 'th' : 'en';
  const releaseNotes = appInfo.releaseNotes[language];

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

  async function onConnectCli() {
    setCliLoading(true);
    setError(null);
    setNotice(null);
    try {
      const result = await loginWithGithubCli();
      await setSessionToken(result.appToken);
      setNotice(t('githubCliSaved'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'GitHub CLI connection failed');
    } finally {
      setCliLoading(false);
    }
  }

  return (
    <Screen>
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
          {token && githubUsername ? <Text style={[styles.username, { color: colors.muted }]}>@{githubUsername}</Text> : null}
          {token ? (
            <Button onPress={logout} variant="secondary">
              {t('logout')}
            </Button>
          ) : null}
          <Button onPress={onReview} loading={loading} disabled={!prUrl}>
            {loading ? t('reviewing') : t('review')}
          </Button>
        </View>
      </View>

      {!token ? (
        <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.text }]}>{t('connectGithub')}</Text>
          <View style={[styles.segmented, { borderColor: colors.border, backgroundColor: colors.codeBackground }]}>
            {(['cli', 'pat', 'oauth'] as LoginMethod[]).map((method) => {
              const active = loginMethod === method;
              return (
                <Pressable
                  key={method}
                  accessibilityRole="button"
                  onPress={() => {
                    setLoginMethod(method);
                    setError(null);
                    setNotice(null);
                  }}
                  style={[styles.segment, { backgroundColor: active ? colors.accent : 'transparent' }]}
                >
                  <Text style={[styles.segmentText, { color: active ? '#fff' : colors.text }]}>
                    {method === 'pat' ? t('patMethod') : method === 'oauth' ? t('oauthMethod') : t('cliMethod')}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {loginMethod === 'pat' ? (
            <>
              <Text style={[styles.help, { color: colors.muted }]}>{t('patMethodHelp')}</Text>
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
            </>
          ) : loginMethod === 'oauth' ? (
            <Text style={[styles.help, { color: colors.muted }]}>{t('oauthMethodHelp')}</Text>
          ) : (
            <Text style={[styles.help, { color: colors.muted }]}>{t('cliMethodHelp')}</Text>
          )}
          <View style={styles.buttonRow}>
            {loginMethod === 'pat' ? (
              <Button onPress={onConnectPat} loading={patLoading} disabled={!githubPat.trim()}>
                {t('connectPat')}
              </Button>
            ) : loginMethod === 'oauth' ? (
              <Button onPress={login}>{t('loginGithub')}</Button>
            ) : (
              <Button onPress={onConnectCli} loading={cliLoading}>
                {t('connectCli')}
              </Button>
            )}
          </View>
        </View>
      ) : null}

      <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: colors.muted }]}>{t('appVersion')}</Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>{appInfo.version}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: colors.muted }]}>{t('developer')}</Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>{appInfo.developerName}</Text>
          </View>
        </View>
        <View style={[styles.releaseBlock, { borderColor: colors.border }]}>
          <Pressable style={styles.releaseToggle} onPress={() => setReleaseNotesOpen((open) => !open)}>
            <View style={styles.releaseToggleTitle}>
              <Ionicons name={releaseNotesOpen ? 'chevron-down' : 'chevron-forward'} size={18} color={colors.muted} />
              <Text style={[styles.label, { color: colors.text }]}>{t('releaseNotes')}</Text>
            </View>
            <Text style={[styles.releaseCount, { color: colors.muted }]}>{releaseNotes.length}</Text>
          </Pressable>
          {releaseNotesOpen ? (
            <View style={styles.releaseContent}>
              {releaseNotes.map((release) => (
                <View key={release.version} style={[styles.releaseVersion, { borderColor: colors.border }]}>
                  <View style={styles.releaseHeader}>
                    <Text style={[styles.releaseVersionTitle, { color: colors.text }]}>v{release.version}</Text>
                    <Text style={[styles.releaseDate, { color: colors.muted }]}>{release.date}</Text>
                  </View>
                  <Text style={[styles.releaseTitle, { color: colors.text }]}>{release.title}</Text>
                  {release.items.map((note) => (
                    <View key={note} style={styles.releaseItem}>
                      <View style={[styles.releaseBullet, { backgroundColor: colors.accent }]} />
                      <Text style={[styles.releaseText, { color: colors.text }]}>{note}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: { borderWidth: 1, borderRadius: 8, padding: 18, gap: 12 },
  label: { fontSize: 15, fontWeight: '700' },
  input: { minHeight: 52, borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, fontSize: 15 },
  error: { fontSize: 13 },
  notice: { fontSize: 13, fontWeight: '700' },
  help: { fontSize: 13, lineHeight: 18 },
  segmented: { borderWidth: 1, borderRadius: 8, padding: 4, flexDirection: 'row', gap: 4 },
  segment: { flex: 1, minHeight: 38, borderRadius: 6, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  segmentText: { fontSize: 14, fontWeight: '800', textAlign: 'center' },
  buttonRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' },
  username: { fontSize: 13, fontWeight: '800' },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metaItem: { minWidth: 180, flex: 1, gap: 4 },
  metaLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  metaValue: { fontSize: 16, fontWeight: '800' },
  releaseBlock: { borderTopWidth: 1, paddingTop: 12, gap: 10 },
  releaseToggle: { minHeight: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  releaseToggleTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  releaseCount: { fontSize: 13, fontWeight: '700' },
  releaseContent: { gap: 12 },
  releaseVersion: { borderTopWidth: 1, paddingTop: 12, gap: 8 },
  releaseHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  releaseVersionTitle: { fontSize: 16, fontWeight: '800' },
  releaseDate: { fontSize: 12, fontWeight: '700' },
  releaseTitle: { fontSize: 14, fontWeight: '700', lineHeight: 20 },
  releaseItem: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  releaseBullet: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  releaseText: { flex: 1, fontSize: 14, lineHeight: 20 }
});
