import { Linking, StyleProp, StyleSheet, TextStyle } from 'react-native';
import { call, sendEmail } from '../functions/dealComm';
import theme, { getThemeColor } from '../configs/theme';

import { AppearanceType } from '../types/store';
import ParsedText from 'react-native-parsed-text';
import React from 'react';
import { phoneRegExp } from '../configs/variables';
import { useStoreState } from '../stores/initStore';

interface Props {
  text: string;
  textStyle?: StyleProp<TextStyle>;
}

const BasicParsedText = ({ text, textStyle }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const styles = getThemedStyles(appearance);

  const _handleUrlPress = (url: string, matchIndex: number) => {
    Linking.openURL(url);
  };

  const _handlePhonePress = (phone: string, matchIndex: number) => {
    call(phone);
  };

  // const _handleNamePress = (name: string, matchIndex: number) => {
  //   Alert.alert(`Hello ${name}`);
  // };

  const _handleEmailPress = (email: string, matchIndex: number) => {
    sendEmail(email, '');
  };

  return (
    <ParsedText
      style={[styles.text, textStyle]}
      parse={[
        { type: 'url', style: styles.url, onPress: _handleUrlPress },
        // { type: 'phone', style: styles.phone, onPress: _handlePhonePress },
        { pattern: phoneRegExp, style: styles.phone, onPress: _handlePhonePress },

        { type: 'email', style: styles.email, onPress: _handleEmailPress },
        // {
        //   pattern: /\[(@[^:]+):([^\]]+)\]/i,
        //   style: styles.username,
        //   onPress: this.handleNamePress,
        //   renderText: this.renderText,
        // },
        // { pattern: /42/, style: styles.magicNumber },
        // { pattern: /#(\w+)/, style: styles.hashTag },
      ]}
      // childrenProps={{ allowFontScaling: false }}
    >
      {text}
    </ParsedText>
  );
};

const getThemedStyles = (appearance: AppearanceType) =>
  StyleSheet.create({
    url: {
      color: getThemeColor('focus', appearance),
      textDecorationLine: 'underline',
    },

    email: {
      color: getThemeColor('indigo700', appearance),
      textDecorationLine: 'underline',
    },

    text: {
      color: getThemeColor('text', appearance),
      fontSize: theme.fontSize.medium,
    },

    phone: {
      color: getThemeColor('accent', appearance),
      textDecorationLine: 'underline',
    },
  });

export default BasicParsedText;
