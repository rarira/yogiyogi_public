import { StyleSheet, Text, View } from 'react-native';

import { NavigationInjectedProps } from 'react-navigation';
import React from 'react';
import theme, { getThemeColor } from '../../configs/theme';
import { withNavigation } from 'react-navigation';
import ThemedButton from '../ThemedButton';
import { AppearanceType } from '../../types/store';
import { useStoreState } from '../../stores/initStore';

interface Props extends NavigationInjectedProps {}

const AddButton = ({ navigation }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const styles = getThemedStyles(appearance);
  const _handleOnPress = () => navigation.navigate('New');
  return (
    <View style={styles.container}>
      <Text style={styles.textStyle}>요가/필라테스 선생님을 찾으세요?</Text>
      <ThemedButton mode="contained" onPress={_handleOnPress} style={styles.buttonStyle}>
        <Text style={styles.labelStyle}>클래스를 등록하고 구인 개시!</Text>
      </ThemedButton>
    </View>
  );
};

const getThemedStyles = (appearance: AppearanceType) =>
  StyleSheet.create({
    container: {
      backgroundColor: getThemeColor('background', appearance),

      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.size.small,
      paddingHorizontal: theme.size.big,
      // marginHorizontal: theme.size.big,
      borderTopColor: getThemeColor('borderColor', appearance),
      borderTopWidth: StyleSheet.hairlineWidth,
    },
    textStyle: {
      fontSize: theme.fontSize.medium,
      fontWeight: 'bold',
      color: getThemeColor('text', appearance),
      marginBottom: theme.size.small,
    },
    buttonStyle: {
      width: '100%',
    },
    labelStyle: {
      fontSize: theme.fontSize.normal,
      fontWeight: 'bold',
      color: getThemeColor('background', appearance),
    },
  });

export default withNavigation(AddButton);
