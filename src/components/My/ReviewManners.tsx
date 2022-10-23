import { BAD_MANNERS, GOOD_MANNERS, Manner } from '../../configs/variables';
import { Keyboard, StyleSheet, View } from 'react-native';
import React, { memo, useEffect } from 'react';
import { ReviewType, SatisfactionType } from '../../API';
import { getTheme, normalize } from '../../configs/theme';

import AndroidDivider from '../AndroidDivider';
import HeadlineSub from '../HeadlineSub';
import Icon from 'react-native-vector-icons/Ionicons';
import KoreanParagraph from '../KoreanParagraph';
import NextProcessButton from '../NextProcessButton';
import ReviewTextButton from './ReviewTextButton';
import SingleLineInputField from '../SingleLineInputField';
import getDimensions from '../../functions/getDimensions';
import { AppearanceType } from '../../types/store';

interface Props {
  satisfactionState: SatisfactionType | null;
  choosedManners: string[];
  setChoosedManners: (arg: string[]) => void;
  revieweeName: string;
  reviewType: ReviewType;
  handleOnChangeText: (arg: string) => void;
  handleComplete: () => void;
  content: string;
  loading: boolean;
  appearance: AppearanceType;
}

const { SCREEN_WIDTH } = getDimensions();

const ReviewManners = ({
  satisfactionState,
  revieweeName,
  choosedManners,
  setChoosedManners,
  reviewType,
  handleOnChangeText,
  handleComplete,
  content,
  loading,
  appearance,
}: Props) => {
  if (satisfactionState === null) return null;

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);
  // const [height, setHeight] = useState(0);

  useEffect(() => {
    setChoosedManners([]);
  }, [satisfactionState]);

  const subText =
    satisfactionState === SatisfactionType.good
      ? `${revieweeName}님의 어떤 부분이 만족스러웠나요?`
      : `${revieweeName}님의 어떤 부분이 아쉬웠나요?`;

  const renderReviewButtons = (mannersArray: Manner[]) => {
    return mannersArray.map((manner: Manner) => {
      if (manner.type === reviewType || manner.type === ReviewType.mannerReview)
        return (
          <ReviewTextButton
            id={manner.id}
            text={manner.text}
            key={manner.id}
            choosedManners={choosedManners}
            setChoosedManners={setChoosedManners}
            satisfactionState={satisfactionState}
            appearance={appearance}
          />
        );
      else return null;
    });
  };

  const _handleComplete = () => {
    Keyboard.dismiss();
    handleComplete();
  };
  const _handleReset = () => handleOnChangeText('');

  return (
    <>
      <AndroidDivider needMarginVertical />
      <HeadlineSub
        text={subText}
        marginTop={theme.size.normal}
        marginBottom={theme.size.normal}
        alignCenter
        bold={satisfactionState !== null}
      />
      {satisfactionState === SatisfactionType.bad && (
        <KoreanParagraph
          text="리뷰 내용이 사실과 다른 경우 추후 이용의 불이익을 받을 수 있느니 주의하세요"
          textStyle={styles.warningText}
          paragraphStyle={styles.warningParagraph}
        />
      )}
      <View style={styles.container}>
        {satisfactionState === SatisfactionType.good
          ? renderReviewButtons(GOOD_MANNERS)
          : renderReviewButtons(BAD_MANNERS)}
        <View style={styles.marginVerticalSmall} />
        <View>
          <SingleLineInputField
            labelText="그 밖의 남기실 말씀"
            name="memo"
            type="string"
            multiline
            autoCorrect={false}
            placeholder="구체적으로 어떤 부분에서 이런 평가를 하셨는지 남겨주시면 다른 사용자에게 큰 도움이 됩니다(선택)"
            // height={180}
            maxLength={200}
            withFormik={false}
            autoFocus={false}
            onChangeText={handleOnChangeText}
            value={content}
            style={{ height: 160 }}
            // onContentSizeChange={event => {
            //   console.log('will set new height', event.nativeEvent.contentSize.height);
            //   setHeight(event.nativeEvent.contentSize.height);
            // }}
          />
          {!!content && (
            <View style={styles.deleteButton}>
              <Icon name={'md-close'} color={theme.colors.background} size={normalize(16)} onPress={_handleReset} />
            </View>
          )}
        </View>
        <View style={styles.marginVerticalSmall} />

        <NextProcessButton mode="contained" onPress={_handleComplete} loading={loading} marginHorizontalNeedless>
          {reviewType === ReviewType.mannerReview
            ? '사용자'
            : reviewType === ReviewType.hostReview
            ? '호스트'
            : '선생님'}{' '}
          리뷰 작성 완료
        </NextProcessButton>
      </View>
    </>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: { flexDirection: 'column', justifyContent: 'flex-start' },
    warningText: { fontSize: theme.fontSize.small, color: theme.colors.accent },
    warningParagraph: { marginBottom: theme.size.small, marginHorizontal: theme.size.small },
    marginVerticalSmall: { marginVertical: theme.size.small },
    deleteButton: {
      position: 'absolute',
      top: normalize(30),
      left: SCREEN_WIDTH - theme.size.big - normalize(40),
      width: normalize(16),
      height: normalize(16),
      backgroundColor: theme.colors.accent,
      borderRadius: normalize(8),
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default memo(ReviewManners);
