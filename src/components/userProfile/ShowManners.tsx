import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import KoreanParagraph from '../KoreanParagraph';
import { ReviewType } from '../../API';
import { TOTAL_MANNERS } from '../../configs/variables';
import TextBox from '../TextBox';

import { AppearanceType } from '../../types/store';
import { getTheme } from '../../configs/theme';

interface Props {
  manners: [string, number][];
  appearance: AppearanceType;
}

const ShowManners = ({ manners, appearance }: Props) => {
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const getNumbers = (num: number) => {
    if (num > 10000) return '9,999+';
    if (num > 1000) return '1,000+';
    else return num;
  };
  return (
    <View style={styles.container}>
      {manners.length === 0 ? (
        <KoreanParagraph text="아직 받은 리뷰가 없습니다" textStyle={styles.noReviews} />
      ) : (
        manners.map((manner: [string, number]) => {
          return (
            <View style={styles.row} key={manner[0]}>
              <View style={styles.numberCell}>
                <Text style={styles.listText}>{getNumbers(manner[1])}명</Text>
              </View>
              <View style={{ flex: 1 }}>
                <TextBox
                  text={TOTAL_MANNERS[manner[0]].text}
                  color={manner[0].startsWith('g') ? theme.colors.text : theme.colors.error}
                  fontWeight="normal"
                  subText={
                    TOTAL_MANNERS[manner[0]].type === ReviewType.hostReview
                      ? '호스트리뷰'
                      : TOTAL_MANNERS[manner[0]].type === ReviewType.proxyReview
                      ? '선생님 리뷰'
                      : '일반 매너 리뷰'
                  }
                  appearance={appearance}
                />
              </View>
            </View>
          );
        })
      )}
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      marginHorizontal: theme.size.big + theme.size.small,
      marginBottom: theme.size.normal,
      paddingLeft: theme.size.normal,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      flex: 1,
      // marginBottom: theme.size.small,
    },
    numberCell: {
      width: '20%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    noReviews: {
      color: theme.colors.disabled,
      fontSize: theme.fontSize.medium,
      fontWeight: '600',
      marginVertical: theme.size.small,
    },
    textBoxCell: {
      flex: 1,
      marginRight: theme.size.small,
    },
    listText: {
      // flex: 1,
      fontSize: theme.fontSize.medium,
      marginRight: theme.size.small,
      color: theme.colors.text,
    },
    mannerTypeText: {
      fontSize: theme.fontSize.small,
      color: theme.colors.backdrop,
      marginLeft: theme.size.small,
    },
  });
export default memo(ShowManners);
