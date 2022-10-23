import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { getTheme } from '../configs/theme';

import getTagString from '../functions/getTagString';

import { useStoreState } from '../stores/initStore';

interface Props {
  name: string;
  cancelButton?: (arg: string) => void;
  isSubsScreen?: boolean;
  isClassViewScreen?: boolean;
  onPress?: () => void;
  choosed?: boolean;
  fullName?: boolean;
}

const MyChip = ({ name, cancelButton, isSubsScreen, isClassViewScreen, onPress, choosed, fullName }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const height = isClassViewScreen ? theme.iconSize.big : theme.iconSize.small;
  const fontSize = isClassViewScreen ? theme.fontSize.small : theme.fontSize.medium;
  const fontWeight = isClassViewScreen ? '800' : '500';

  const nameString = useMemo(() => getTagString(name), [name]);

  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={onPress}
      style={[
        styles.tagContainer,
        { paddingLeft: height / 2, paddingRight: cancelButton ? 0 : height / 2, height, borderRadius: height / 2 },
        choosed && { backgroundColor: theme.colors.primary },
      ]}
      key={name}
    >
      <Text
        numberOfLines={1}
        style={{
          ...(!fullName && { maxWidth: isSubsScreen ? 120 : 90 }),
          fontSize,
          fontWeight,
          color: choosed ? theme.colors.background : theme.colors.text,
        }}
        ellipsizeMode="tail"
      >
        {nameString}
      </Text>
      {cancelButton && cancelButton(name)}
    </TouchableOpacity>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    tagContainer: {
      marginRight: theme.size.small,
      marginBottom: theme.size.small,
      flexDirection: 'row',
      backgroundColor: theme.colors.grey200,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

export default memo(MyChip);
