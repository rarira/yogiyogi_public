import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { memo } from 'react';
import { StyleSheet, Text } from 'react-native';

import { TouchableOpacity } from 'react-native-gesture-handler';

import ThemedButton from '../ThemedButton';
import { getTheme } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

interface Props extends NavigationInjectedProps {
  classId: string;
  isClassList?: boolean;
  origin: string;
  hostId: string;
  hostName: string;
  appearance: AppearanceType;
}

const ClassHostReviewButton = ({ classId, isClassList, origin, hostId, hostName, navigation, appearance }: Props) => {
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);
  const _handleNavigate = () => {
    navigation.navigate('HostReview', { classId, hostId, hostName, origin });
  };

  if (isClassList) {
    return (
      <TouchableOpacity onPress={_handleNavigate} style={styles.buttonContainer}>
        <Text style={styles.classButtonText}>클래스 호스트 리뷰 남기기</Text>
      </TouchableOpacity>
    );
  }
  return (
    <ThemedButton
      compact
      mode={'contained'}
      onPress={_handleNavigate}
      color={theme.colors.primary}
      style={styles.buttonStyle}
    >
      <Text style={styles.buttonText}>클래스 호스트 리뷰 남기기</Text>
    </ThemedButton>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    buttonContainer: { alignSelf: 'center' },
    buttonStyle: {
      justifyContent: 'flex-end',
      marginTop: theme.size.normal,
      marginBottom: theme.size.normal,
    },
    buttonText: { fontSize: theme.fontSize.medium, color: theme.colors.text },
    classButtonText: { fontSize: theme.fontSize.medium, fontWeight: '600', color: theme.colors.primary },
    marginLeft: { marginLeft: theme.size.normal },
  });

export default memo(withNavigation(ClassHostReviewButton));
