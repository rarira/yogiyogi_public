import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import theme, { getThemeColor } from '../configs/theme';

import { AppearanceType } from '../types/store';
import KoreanParagraph from './KoreanParagraph';
import { useStoreState } from '../stores/initStore';

interface Props {
  type: string;
  showWarning?: boolean;
  warnings?: string;
  needMarginHorizontal?: boolean;
}

const EmptyResults = ({ type, showWarning, warnings, needMarginHorizontal }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const styles = getThemedStyles(appearance);

  return (
    <View style={[styles.container, { marginHorizontal: needMarginHorizontal ? theme.size.big : 0 }]}>
      <KoreanParagraph
        text={`${type} 없습니다`}
        textStyle={styles.emptyResults}
        paragraphStyle={styles.emptyResultsParagraph}
      />
      {/* <Text style={styles.emptyResults}>{type} 없습니다</Text> */}
      {showWarning && <KoreanParagraph text={warnings!} textStyle={styles.warningText} />}
    </View>
  );
};

const getThemedStyles = (appearance: AppearanceType) =>
  StyleSheet.create({
    container: { flexDirection: 'column', alignItems: 'center' },
    emptyResults: {
      fontSize: theme.fontSize.normal,
      color: getThemeColor('error', appearance),
      // marginVertical: theme.size.big,
    },
    emptyResultsParagraph: {
      marginHorizontal: theme.size.big,
      marginVertical: theme.size.big,
      justifyContent: 'center',
      alignItems: 'center',
    },
    warningText: { color: getThemeColor('error', appearance), fontSize: theme.fontSize.medium },
  });

export default memo(EmptyResults);
