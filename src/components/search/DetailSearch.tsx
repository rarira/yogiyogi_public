import { DurationTermEnum, TermState } from '../../stores/ClassStore';
import React, { ReducerAction, memo, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import KoreanParagraph from '../KoreanParagraph';
import SearchTermButton from './SearchTermButton';

import format from 'date-fns/format';
import getTagString from '../../functions/getTagString';
import koLocale from 'date-fns/locale/ko';
import { getCompStyles } from '../../configs/compStyles';
import { getTheme } from '../../configs/theme';
import { useStoreState } from '../../stores/initStore';

interface Props {
  termState: TermState;
  dispatch: (arg: ReducerAction<any>) => void;
}

const DetailSearch = ({ termState, dispatch }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();

  const compStyles = getCompStyles(appearance);
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const { durationTerm, dateStartTerm, timeStartTerm, regionTerm, tagTerm } = termState;
  const tagNonSelected = tagTerm.length === 0;

  const tagTermString = tagNonSelected ? '키워드' : tagTerm!.length === 1 ? getTagString(tagTerm![0]) : '복합 키워드';

  const _handleDurationOnPress = useCallback(() => dispatch({ type: 'setTermMode', termMode: 'durationTerm' }), [
    dispatch,
  ]);
  const _hanldeDurationOnCancel = useCallback(
    () => dispatch({ type: 'setTerm', durationTerm: DurationTermEnum.null }),
    [dispatch],
  );

  const _handleDateStartOnPress = useCallback(() => dispatch({ type: 'setTermMode', termMode: 'dateStartTerm' }), [
    dispatch,
  ]);
  const _hanldeDateStartOnCancel = useCallback(() => dispatch({ type: 'setTerm', dateStartTerm: '' }), [dispatch]);

  const _handleTimeStartOnPress = useCallback(() => dispatch({ type: 'setTermMode', termMode: 'timeStartTerm' }), [
    dispatch,
  ]);
  const _hanldeTimeStartOnCancel = useCallback(() => dispatch({ type: 'setTerm', timeStartTerm: null }), [dispatch]);

  const _handleRegionOnPress = useCallback(() => dispatch({ type: 'setTermMode', termMode: 'regionTerm' }), [dispatch]);
  const _hanldeRegionOnCancel = useCallback(() => dispatch({ type: 'setTerm', regionTerm: '' }), [dispatch]);

  const _handleTagOnPress = useCallback(() => dispatch({ type: 'setTermMode', termMode: 'tagTerm' }), [dispatch]);
  const _hanldeTagOnCancel = useCallback(() => dispatch({ type: 'setTerm', tagTerm: [] }), [dispatch]);

  const timeStartTermMessage = useMemo(() => {
    if (timeStartTerm) {
      return format(timeStartTerm, 'A hh:mm', { locale: koLocale });
    }
    return '시작 시간';
  }, [timeStartTerm]);

  return (
    <>
      <View style={compStyles.detailSearchHeadline}>
        <KoreanParagraph
          text={`검색 조건을 하나 이상 설정하시고 상단의 "검색 아이콘 버튼" 을 터치해 주세요`}
          textStyle={styles.guideText}
          paragraphStyle={styles.guideParagraph}
          focusTextStyle={styles.focusText}
        />
      </View>
      <View style={compStyles.searchTermContainer}>
        <SearchTermButton
          onPress={_handleDurationOnPress}
          onCancel={_hanldeDurationOnCancel}
          displayIcon={durationTerm !== DurationTermEnum.null}
          message={durationTerm || `장기/단기`}
          appearance={appearance}
        />
        <SearchTermButton
          onPress={_handleDateStartOnPress}
          onCancel={_hanldeDateStartOnCancel}
          displayIcon={dateStartTerm !== ''}
          message={dateStartTerm || '시작일'}
          appearance={appearance}
        />
        <SearchTermButton
          onPress={_handleTimeStartOnPress}
          onCancel={_hanldeTimeStartOnCancel}
          displayIcon={timeStartTerm !== null}
          message={timeStartTermMessage}
          appearance={appearance}
        />
        <SearchTermButton
          onPress={_handleRegionOnPress}
          onCancel={_hanldeRegionOnCancel}
          displayIcon={regionTerm !== ''}
          message={regionTerm || '지역'}
          appearance={appearance}
        />
        <SearchTermButton
          onPress={_handleTagOnPress}
          onCancel={_hanldeTagOnCancel}
          displayIcon={tagTerm.length !== 0}
          message={tagTermString}
          appearance={appearance}
        />
      </View>
    </>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    guideText: { fontSize: theme.fontSize.medium, color: theme.colors.placeholder },
    focusText: { fontSize: theme.fontSize.medium, color: theme.colors.accent, fontWeight: '600' },
    guideParagraph: { flex: 1, marginRight: theme.size.small },
  });

export default memo(DetailSearch);
