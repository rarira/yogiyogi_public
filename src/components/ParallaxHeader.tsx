import { Platform, StyleSheet, View } from 'react-native';
import React, { FunctionComponent } from 'react';

import getDimensions from '../functions/getDimensions';
import { getTheme } from '../configs/theme';
import { AppearanceType } from '../types/store';

const { STATUS_BAR_HEIGHT, HEADER_HEIGHT, NAV_BAR_HEIGHT } = getDimensions();

interface Props {
  headerVisible: boolean;
  appearance: AppearanceType;
}

const ParallaxHeader: FunctionComponent<Props> = ({ headerVisible, appearance, children }) => {
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  return (
    <View style={[styles.navContainer, { ...(!headerVisible && styles.containerBorder) }]}>
      {Platform.OS === 'ios' && <View style={styles.statusBar} />}
      <View style={styles.navBar}>{children}</View>
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    containerBorder: {
      borderBottomColor: theme.colors.borderColor,
      borderBottomWidth: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.background,
    },
    navContainer: {
      height: Platform.OS === 'ios' ? HEADER_HEIGHT : NAV_BAR_HEIGHT,
      marginHorizontal: theme.size.big,
    },
    statusBar: {
      height: STATUS_BAR_HEIGHT,
      backgroundColor: 'transparent',
    },
    navBar: {
      height: NAV_BAR_HEIGHT,
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: 'row',
      backgroundColor: 'transparent',
    },
  });

export default ParallaxHeader;
