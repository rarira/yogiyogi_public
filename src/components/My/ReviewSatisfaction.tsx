import React, { memo } from 'react';
import { ReviewType, SatisfactionType } from '../../API';
import { StyleSheet, Text, View } from 'react-native';

import HeadlineSub from '../HeadlineSub';
import Icon from 'react-native-vector-icons/AntDesign';
import { getTheme } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

interface Props {
  satisfactionState: SatisfactionType | null;
  setSatisfactionState: (arg: SatisfactionType) => void;
  revieweeName: string;
  reviewType: ReviewType;
  appearance: AppearanceType;
}

const ReviewSatisfaction = ({
  satisfactionState,
  setSatisfactionState,
  revieweeName,
  reviewType,
  appearance,
}: Props) => {
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const _handleOnPress = (state: SatisfactionType) => () => setSatisfactionState(state);
  const text =
    reviewType === ReviewType.proxyReview
      ? `다음에 기회가 된다면 ${revieweeName}님께 다시 클래스를 맡기시겠습니까?`
      : reviewType === ReviewType.hostReview
      ? `다음에 기회가 된다면 ${revieweeName}님과 다시 함께하시겠습니까?`
      : `${revieweeName}님께 만족하십니까?`;
  return (
    <>
      <HeadlineSub text={text} marginBottom={theme.size.normal} alignCenter bold={satisfactionState === null} />
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Icon
            name={satisfactionState === SatisfactionType.bad ? 'closecircle' : 'closecircleo'}
            size={theme.iconSize.xl}
            color={satisfactionState === SatisfactionType.bad ? theme.colors.error : theme.colors.backdrop}
            onPress={_handleOnPress(SatisfactionType.bad)}
          />
          <Text
            style={[
              styles.iconText,
              {
                color: satisfactionState === SatisfactionType.bad ? theme.colors.error : theme.colors.backdrop,
              },
            ]}
          >
            아니오
          </Text>
        </View>

        <View style={styles.iconContainer}>
          <Icon
            name={satisfactionState === SatisfactionType.good ? 'downcircle' : 'downcircleo'}
            size={theme.iconSize.xl}
            color={satisfactionState === SatisfactionType.good ? theme.colors.primary : theme.colors.backdrop}
            onPress={_handleOnPress(SatisfactionType.good)}
          />
          <Text
            style={[
              styles.iconText,
              {
                color: satisfactionState === SatisfactionType.good ? theme.colors.primary : theme.colors.backdrop,
              },
            ]}
          >
            예!
          </Text>
        </View>
      </View>
    </>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: theme.size.small },
    iconContainer: { flexDirection: 'column', justifyContent: 'center', alignContent: 'center' },
    iconText: { alignSelf: 'center', fontSize: theme.fontSize.small },
  });

export default memo(ReviewSatisfaction);
