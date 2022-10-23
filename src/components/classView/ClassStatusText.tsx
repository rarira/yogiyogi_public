import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ClassStatusType } from '../../API';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import getClassStatus from '../../functions/getClassStatus';
import { getTheme } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

interface Props {
  classStatus: ClassStatusType;
  numOfConvs?: string | number;
  blackText?: boolean;
  appearance: AppearanceType;
}
const ClassStatusText = ({ classStatus, numOfConvs, blackText, appearance }: Props) => {
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const classStatusText = useMemo(() => getClassStatus(classStatus, appearance).text, [classStatus]);
  return (
    <View style={[{ borderColor: blackText ? 'black' : theme.colors.background }, styles.container]}>
      <Text style={[{ color: blackText ? 'black' : theme.colors.background }, styles.text]}>
        {classStatusText}

        {numOfConvs !== undefined && (
          <Text style={[{ color: blackText ? 'black' : theme.colors.background }, styles.text]}>
            {',  '}
            <Icon name="message-text-outline" color={theme.colors.background} /> {numOfConvs}
          </Text>
        )}
      </Text>
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      borderWidth: 1,
      padding: 2,
      borderRadius: 4,
      marginVertical: theme.size.small,
      paddingHorizontal: theme.size.small,
    },
    text: { fontSize: theme.fontSize.medium, fontWeight: '800' },
    chatIcon: { marginLeft: theme.size.medium, fontWeight: '800' },
  });

export default memo(ClassStatusText);
