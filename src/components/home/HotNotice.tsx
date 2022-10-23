import * as Animatable from 'react-native-animatable';

import { AppearanceType, NewsData } from '../../types/store';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { memo, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getTheme, getThemeColor } from '../../configs/theme';

import AsyncStorage from '@react-native-community/async-storage';
import CancelButton from '../CancelButton';
import { HOMEPAGE_URL } from '../../configs/variables';
import Icon from 'react-native-vector-icons/FontAwesome';
import reportSentry from '../../functions/reportSentry';
import { useStoreState } from '../../stores/initStore';

interface Props extends NavigationInjectedProps {
  data: NewsData[];
  setHotNoticeVisible: (arg: boolean) => void;
}

const HotNotice = ({ data, navigation, setHotNoticeVisible }: Props) => {
  const viewEl = useRef(null);
  const {
    authStore: { user, appearance },
  } = useStoreState();

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const { id, newsURL, newsTitle } = data[0];
  const _handleURL = () => {
    const url = `${HOMEPAGE_URL}${newsURL!}`;
    navigation.push('WebView', { url, title: newsTitle });
  };

  const _handleClose = () => {
    (async function() {
      try {
        await AsyncStorage.setItem(
          user ? `${user.username}_hotNotice_${id}_read` : `guest_hotNotice_${id}_read`,
          'true',
        );
        viewEl.current.fadeOutRight();
        setHotNoticeVisible(false);
      } catch (e) {
        reportSentry(e);
      }
    })();
  };

  return (
    <Animatable.View useNativeDriver animation="fadeInLeft" style={styles.container} ref={viewEl}>
      <View style={styles.title}>
        <Icon name="warning" color={theme.colors.accent} size={theme.fontSize.medium} />
        <TouchableOpacity onPress={_handleURL}>
          <Text style={styles.textStyle}>{newsTitle}</Text>
        </TouchableOpacity>
      </View>
      <CancelButton onPress={_handleClose} />
    </Animatable.View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.uiBackground,
      paddingHorizontal: theme.size.big,
      paddingVertical: theme.size.xs,
      borderColor: theme.colors.disabled,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderTopWidth: StyleSheet.hairlineWidth,
    },
    title: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' },
    textStyle: {
      fontSize: theme.fontSize.medium,
      marginLeft: theme.size.small,
      color: theme.colors.text,
    },
  });

export default memo(withNavigation(HotNotice));
