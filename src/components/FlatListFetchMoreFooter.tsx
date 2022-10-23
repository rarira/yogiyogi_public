import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import Loading from './Loading';
import React from 'react';

import { AppearanceType } from '../types/store';
import { getTheme } from '../configs/theme';

interface Props {
  loading?: boolean;

  handleFetchMore: () => void;
  nextToken: string | null;
  appearance: AppearanceType;
}

const FlatListFetchMoreFooter = ({ loading, handleFetchMore, nextToken, appearance }: Props) => {
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  if (loading) {
    return <Loading size="small" origin="FlatListFetchMoreFooter" />;
  }
  if (!!nextToken) {
    return (
      <TouchableOpacity onPress={handleFetchMore} style={styles.container}>
        <Text style={styles.buttonText}>.......답글 더 보기.......</Text>
      </TouchableOpacity>
    );
  }
  return null;
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      // width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      // borderColor: 'red',
      // borderWidth: 1,
      marginVertical: theme.size.small,
    },
    buttonText: { color: theme.colors.primary, fontSize: theme.fontSize.small, fontWeight: '600', alignSelf: 'center' },
  });

export default FlatListFetchMoreFooter;
