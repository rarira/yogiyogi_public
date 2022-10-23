import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { memo } from 'react';
import { StyleSheet, Text } from 'react-native';

import { TouchableOpacity } from 'react-native-gesture-handler';
import theme, { getThemeColor } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

interface Props extends NavigationInjectedProps {
  classId: string;
  origin: string;
  hostId: string;
  appearance: AppearanceType;
}

const ClassCompleteButton = ({ classId, origin, hostId, navigation, appearance }: Props) => {
  const styles = getThemedStyles(appearance);

  const _handleNavigate = () => {
    navigation.navigate('ClassComplete', { classId, hostId, origin });
  };

  return (
    <TouchableOpacity onPress={_handleNavigate} style={styles.buttonContainer}>
      <Text style={styles.classButtonText}>클래스 수행 완료하고 선생님 리뷰</Text>
    </TouchableOpacity>
  );
};

const getThemedStyles = (appearance: AppearanceType) =>
  StyleSheet.create({
    buttonContainer: { alignSelf: 'center' },
    classButtonText: {
      fontSize: theme.fontSize.medium,
      fontWeight: '600',
      color: getThemeColor('primary', appearance),
    },
    marginLeft: { marginLeft: theme.size.normal },
  });

export default memo(withNavigation(ClassCompleteButton));
