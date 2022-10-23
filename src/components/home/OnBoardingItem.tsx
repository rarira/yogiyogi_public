import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import theme, { getThemeColor } from '../../configs/theme';

import { AppearanceType } from '../../types/store';
import { Checkbox } from 'react-native-paper';
import KoreanParagraph from '../KoreanParagraph';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useStoreState } from '../../stores/initStore';

interface Props extends NavigationInjectedProps {
  checkState: boolean;
  title: string;
  desc: string;
  activated: boolean;
  navTarget?: string;
  params?: { [key: string]: any };
  onPress?: () => void;
}

const OnBoardingItem = ({ checkState, title, desc, activated, navTarget, params, navigation, onPress }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const styles = getThemedStyles(appearance);

  const _handleNav = () => navigation.navigate(navTarget!, params);
  if (!activated) return null;
  return (
    <View style={styles.container}>
      <View style={styles.checkboxContainer}>
        <Checkbox.Android
          status={checkState ? 'checked' : 'unchecked'}
          // onPress={_toggleCheckBox}
          color={getThemeColor('accent', appearance)}
          uncheckedColor={getThemeColor('accent', appearance)}
          disabled={checkState}
        />
      </View>
      <TouchableOpacity
        onPress={navTarget ? _handleNav : onPress ?? undefined}
        style={styles.textColumn}
        disabled={checkState}
      >
        <Text
          style={[
            styles.titleText,
            { ...(checkState && { textDecorationLine: 'line-through', color: getThemeColor('disabled', appearance) }) },
          ]}
        >
          {title}
        </Text>
        {!checkState && activated && <KoreanParagraph text={desc} textStyle={styles.descText} />}
      </TouchableOpacity>
    </View>
  );
};

const getThemedStyles = (appearance: AppearanceType) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginRight: theme.size.big * 2,
      marginBottom: theme.size.small,
    },
    checkboxContainer: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',

      height: '100%',
    },
    textColumn: { flexDirection: 'column', justifyContent: 'center' },
    titleText: {
      fontSize: theme.fontSize.normal,
      color: getThemeColor('text', appearance),
      marginBottom: theme.size.xs,
    },
    descText: { fontSize: theme.fontSize.medium, color: getThemeColor('placeholder', appearance) },
  });

export default memo(withNavigation(OnBoardingItem));
