import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import theme, { getThemeColor } from '../configs/theme';

import { ActivityIndicator } from 'react-native-paper';
import { AppearanceType } from '../types/store';
import KoreanParagraph from './KoreanParagraph';
import reportSentry from '../functions/reportSentry';
import { useStoreState } from '../stores/initStore';
import wait from '../functions/wait';

interface Props extends NavigationInjectedProps {
  size?: 'small' | 'large' | number;
  color?: string;
  style?: ViewStyle;
  auth?: boolean;
  text?: string;
  origin?: string;
  textStyle?: TextStyle;
  paragraphStyle?: ViewStyle;
}
const Loading = ({ size, color, style, navigation, auth, text, origin, textStyle, paragraphStyle }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const styles = getThemedStyles(appearance);
  const [error, setError] = useState(false);

  useEffect(() => {
    let _mounted = true;

    wait(20000).then(() => {
      if (_mounted && !auth) {
        reportSentry(`Loading takes too long@${origin}`);
        setError(true);
      }
    });
    // .catch(error => reportSentry(error));
    return () => {
      _mounted = false;
    };
  }, [origin]);

  const _handleError = () => navigation.navigate('Home');

  return (
    <View style={[styles.container, style]}>
      {error ? (
        <>
          <Text style={styles.errorText}>알 수 없는 에러가 발생하였습니다</Text>
          <TouchableOpacity onPress={_handleError}>
            <Text style={styles.errorButton}>홈으로 돌아가기</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <ActivityIndicator size={size ? size : 'large'} color={color ? color : getThemeColor('focus', appearance)} />
          {text && (
            <KoreanParagraph
              text={text}
              textStyle={[styles.errorButton, textStyle]}
              paragraphStyle={[styles.paragraph, paragraphStyle]}
            />
          )}
        </>
      )}
    </View>
  );
};

const getThemedStyles = (appearance: AppearanceType) =>
  StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: getThemeColor('error', appearance), fontSize: theme.fontSize.normal, fontWeight: '600' },
    errorButton: { color: getThemeColor('primary', appearance), fontSize: theme.fontSize.medium, fontWeight: '700' },
    paragraph: { marginTop: theme.size.small, marginHorizontal: theme.size.big },
  });
export default withNavigation(Loading);
