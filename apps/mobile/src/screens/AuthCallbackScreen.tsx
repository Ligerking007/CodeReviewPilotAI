import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';
import { Screen } from '../components/Screen';
import { useAuth } from '../store/auth-context';
import { useAppTheme } from '../theme/theme-context';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'AuthCallback'>;

export function AuthCallbackScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const { setSessionToken } = useAuth();
  const errorMessage = route.params?.error === 'github_user_not_allowed' ? t('githubUserNotAllowed') : t('invalidToken');

  useEffect(() => {
    async function finish() {
      if (route.params?.token) {
        await setSessionToken(route.params.token);
        navigation.replace('Home');
      }
    }
    finish();
  }, [navigation, route.params?.token, setSessionToken]);

  return (
    <Screen>
      <Text style={{ color: route.params?.error ? colors.danger : colors.text }}>{route.params?.error ? errorMessage : t('loginGithub')}</Text>
    </Screen>
  );
}
