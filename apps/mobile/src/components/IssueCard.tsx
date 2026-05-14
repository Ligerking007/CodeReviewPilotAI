import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../theme/theme-context';
import { ReviewIssue } from '../types/review';

const severityColors = {
  critical: '#f85149',
  high: '#ff7b72',
  medium: '#d29922',
  low: '#3fb950',
  info: '#58a6ff'
};

export function IssueCard({ issue }: { issue: ReviewIssue }) {
  const { colors } = useAppTheme();
  const badgeColor = severityColors[issue.severity];

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
      <View style={styles.topRow}>
        <Text style={[styles.title, { color: colors.text }]}>{issue.title}</Text>
        <Text style={[styles.badge, { backgroundColor: badgeColor }]}>{issue.severity.toUpperCase()}</Text>
      </View>
      {issue.file ? (
        <Text style={[styles.file, { color: colors.accent }]}>
          {issue.file}
          {issue.line ? `:${issue.line}` : ''}
        </Text>
      ) : null}
      <Text style={[styles.body, { color: colors.text }]}>{issue.description}</Text>
      <Text style={[styles.recommendation, { color: colors.muted }]}>{issue.recommendation}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 8, padding: 14, gap: 8 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  title: { flex: 1, fontSize: 15, fontWeight: '700' },
  badge: { color: '#fff', fontSize: 11, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: 'hidden' },
  file: { fontFamily: 'Courier', fontSize: 13 },
  body: { fontSize: 14, lineHeight: 20 },
  recommendation: { fontSize: 14, lineHeight: 20 }
});
