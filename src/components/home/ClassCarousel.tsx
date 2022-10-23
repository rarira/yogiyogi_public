import {
  CarouselTimeOption,
  HomeState,
  SET_HOME_STATE,
  TOGGLE_IS_COLLAPSED_TAG_VISIBLE,
  TOGGLE_IS_COLLAPSED_TIME_VISIBLE,
} from '../../functions/useHomeState';
import React, { Dispatch, memo, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { addHeart, removeHeart } from '../../functions/manageHearts';
import { getTheme, normalize } from '../../configs/theme';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import Carousel from 'react-native-snap-carousel';
import ClassCarouselCard from './ClassCarouselCard';
import Collapsible from 'react-native-collapsible';
import FlatListEmptyResults from '../FlatListEmptyResults';
import Icon from 'react-native-vector-icons/AntDesign';
import KoreanText from '../KoreanText';
import Loading from '../Loading';
import MySubHeadline from '../MySubHeadline';
import { SET_AUTHSTORE_STATE } from '../../stores/actionTypes';
import SelectTagScroll from './SelectTagScroll';
import SelectTimeLimit from './SelectTimeLimit';
import getDimensions from '../../functions/getDimensions';
import gql from 'graphql-tag';
import reportSentry from '../../functions/reportSentry';
import { updateUserVisitTime } from '../../customGraphqls';
import { useMutation } from '@apollo/react-hooks';

interface Props {
  isFocused: boolean;
  data: any;
  error?: any;
  // networkStatus: number;
  fetchMore: any;
  carouselEl: any;
  homeState: HomeState;
  homeDispatch: Dispatch<any>;
  setNeedAuthVisible: (arg: boolean) => void;
}

const UPDATE_USER_VISIT_TIME = gql(updateUserVisitTime);
const { SCREEN_WIDTH } = getDimensions();

const ClassCarousel = ({
  isFocused,
  data,
  error,
  // networkStatus,
  fetchMore,
  carouselEl,
  homeState,
  homeDispatch,
  setNeedAuthVisible,
}: Props) => {
  const { choosedTag, choosedTimeOption, lastCardCreatedAtEpoch, currentIndex } = homeState;

  const [updateUserVisitTime] = useMutation(UPDATE_USER_VISIT_TIME);
  const {
    authStore: { user, lastReadClassAt, subscribedTags, appState, hearts, appearance },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const itemWidth = Math.min(SCREEN_WIDTH - normalize(70), normalize(300));
  // console.log(lastCardCreatedAtEpoch, lastReadClassAt);
  useEffect(() => {
    let _mounted = true;
    if (
      _mounted &&
      user &&
      lastCardCreatedAtEpoch &&
      // lastCardCreatedAtEpoch > lastReadClassAt &&
      (lastReadClassAt === null || (appState === 'active' && !isFocused) || appState === 'background')
    ) {
      (async function() {
        try {
          await updateUserVisitTime({
            variables: {
              input: {
                id: user.username,
                lastReadClassAt: lastCardCreatedAtEpoch,
              },
            },
            optimisticResponse: {
              __typename: 'Mutation',
              updateUser: {
                __typename: 'User',
                id: user.username,
                lastReadClassAt: lastCardCreatedAtEpoch,
              },
            },
          });

          storeDispatch({ type: SET_AUTHSTORE_STATE, lastReadClassAt: lastCardCreatedAtEpoch });
        } catch (e) {
          reportSentry(e);
        }
      })();
    }
    return () => {
      _mounted = false;
    };
  }, [appState, isFocused]);

  if (error) {
    reportSentry(error);
    return null;
  }

  const _handleFetchMore = () => {
    if (data.searchClasss.nextToken) {
      fetchMore({
        variables: { nextToken: data.searchClasss.nextToken },
        updateQuery: (prev: any, { fetchMoreResult }: any) => {
          if (!prev) return null;

          if (!fetchMoreResult) {
            return prev;
          }
          if (fetchMoreResult.searchClasss.nextToken === prev.searchClasss.nextToken) {
            return prev;
          }
          return {
            searchClasss: {
              items: [...prev.searchClasss.items, ...fetchMoreResult.searchClasss.items],
              nextToken: fetchMoreResult.searchClasss.nextToken,
              __typename: prev.searchClasss.__typename,
            },
          };
        },
      });
    }
  };

  const _handleUpdateTime = (slideIndex: number) => {
    if (slideIndex > 0) {
      const time = data.searchClasss.items[slideIndex - 1].createdAtEpoch;
      // console.log(slideIndex, lastCardCreatedAtEpoch, time);
      if (lastCardCreatedAtEpoch === null || time > lastCardCreatedAtEpoch) {
        homeDispatch({ type: SET_HOME_STATE, lastCardCreatedAtEpoch: time, currentIndex: slideIndex });
      } else {
        homeDispatch({ type: SET_HOME_STATE, currentIndex: slideIndex });
      }
    } else {
      homeDispatch({ type: SET_HOME_STATE, currentIndex: slideIndex });
    }
  };

  const renderItem = ({ item, index }: any) => {
    const isCurrent = index === currentIndex;
    const isHearted = hearts && hearts.count > 0 && hearts[item.id] !== undefined;
    const _handleLongPress = () => {
      if (!user) {
        setNeedAuthVisible(true);
      } else if (isHearted) {
        removeHeart({ item, storeDispatch, hearts });
      } else {
        addHeart({ item, storeDispatch, hearts });
      }
    };
    return (
      <ClassCarouselCard
        classItem={item}
        isCurrent={isCurrent}
        itemWidth={itemWidth}
        handleLongPress={_handleLongPress}
        isHearted={isHearted}
        appearance={appearance}
      />
    );
  };

  const renderCondition = () => {
    const toggleVisible = (category: string) => () => {
      homeDispatch({
        type: category === 'tag' ? TOGGLE_IS_COLLAPSED_TAG_VISIBLE : TOGGLE_IS_COLLAPSED_TIME_VISIBLE,
      });
    };

    const { isCollapsedTag, isCollapsedTime } = homeState;
    const tagNonSelected = !choosedTag || choosedTag.length === 0;
    const choosedTagString = tagNonSelected ? '전체' : choosedTag!.length === 1 ? choosedTag![0] : '복합 키워드';
    return (
      <>
        <View style={styles.conditionContainer}>
          {!!user && (
            <TouchableOpacity onPress={toggleVisible('tag')} style={styles.conditionTouchable}>
              <Text style={styles.conditionText}>구독 키워드: </Text>
              <KoreanText
                numberOfLines={2}
                ellipsizeMode="tail"
                textStyle={tagNonSelected ? styles.conditionBeforeText : styles.conditionSelectedText}
                str={choosedTagString}
                appearance={appearance}
              />
              <Icon
                name={isCollapsedTag ? 'downcircle' : 'upcircle'}
                color={isCollapsedTag ? theme.colors.primary : theme.colors.accent}
                size={theme.fontSize.normal}
              />
            </TouchableOpacity>
          )}
          {lastReadClassAt !== null && (
            <TouchableOpacity
              onPress={toggleVisible('time')}
              style={[styles.conditionTouchable, styles.conditionMarginLeft]}
            >
              <Text style={styles.conditionText}>등록 시간: </Text>
              <KoreanText
                numberOfLines={2}
                ellipsizeMode="tail"
                textStyle={
                  choosedTimeOption !== CarouselTimeOption.ALL
                    ? styles.conditionSelectedText
                    : styles.conditionBeforeText
                }
                str={
                  choosedTimeOption === CarouselTimeOption.ALL
                    ? '모두'
                    : choosedTimeOption === CarouselTimeOption.NEW
                    ? '신규'
                    : '마감 임박'
                }
                appearance={appearance}
              />
              <Icon
                name={isCollapsedTime ? 'downcircle' : 'upcircle'}
                color={isCollapsedTime ? theme.colors.primary : theme.colors.accent}
                size={theme.fontSize.normal}
              />
            </TouchableOpacity>
          )}
        </View>
        {!!user && (
          <>
            <Collapsible collapsed={isCollapsedTag} style={styles.uiWindow}>
              <SelectTagScroll
                subscribedTags={subscribedTags || []}
                homeDispatch={homeDispatch}
                choosedTag={choosedTag}
                appearance={appearance}
              />
            </Collapsible>

            <Collapsible collapsed={isCollapsedTime} style={styles.uiWindow}>
              <SelectTimeLimit
                choosedTimeOption={choosedTimeOption}
                homeDispatch={homeDispatch}
                appearance={appearance}
              />
            </Collapsible>
          </>
        )}
      </>
    );
  };

  const emptyTimeText =
    choosedTimeOption === CarouselTimeOption.ALL ? '등록된 모든 클래스' : '지난 번 검색 이후 새로 등록된 클래스';
  const emptyTagText = choosedTag && choosedTag.length > 0 ? '해당 키워드를 가진' : '';

  return (
    <View style={styles.container}>
      <View style={styles.screenMarginHorizontal}>
        <MySubHeadline>새로 등록된 클래스</MySubHeadline>
        {/* <HeadlineSub text="아래 조건에 따라 새로 등록된 클래스를 찾아보세요" /> */}
        {renderCondition()}
      </View>

      {!data || !data.searchClasss ? (
        <Loading style={styles.loadingStyle} origin="ClassCarousel" />
      ) : data.searchClasss.items.length === 0 ? (
        <FlatListEmptyResults
          type={`${emptyTimeText} 중 ${emptyTagText} 현재 구인 중인 클래스가`}
          needMarginHorizontal
        />
      ) : (
        <Carousel
          key={appearance}
          ref={carouselEl}
          data={data.searchClasss.items}
          renderItem={renderItem}
          onEndReachedThreshold={2}
          onEndReached={_handleFetchMore}
          sliderWidth={SCREEN_WIDTH}
          itemWidth={itemWidth}
          onSnapToItem={_handleUpdateTime}
          activeSlideAlignment="center"
          initialNumToRender={3}
          removeClippedSubviews={true}
          containerCustomStyle={styles.classCarouselContainer}
          inactiveSlideOpacity={0.5}
          inactiveSlideScale={0.9}
          loopClonesPerSide={5}
          // enableMomentum={false}
          decelerationRate="fast"
          enableSnap={true}
          lockScrollWhileSnapping
          snapToInterval={1}
        />
      )}
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
      backgroundColor: theme.colors.background,
      // marginBottom: theme.size.big,
    },
    uiWindow: { flex: 1, backgroundColor: theme.colors.background, marginHorizontal: -theme.size.big },
    classCarouselContainer: { marginVertical: theme.size.normal },
    screenMarginHorizontal: { marginHorizontal: theme.size.big },
    conditionContainer: { flexDirection: 'row' },
    conditionTouchable: { flexDirection: 'row', alignItems: 'center' },
    conditionMarginLeft: { marginLeft: theme.size.big },
    conditionSelectedText: { color: theme.colors.primary, fontWeight: '600', fontSize: theme.fontSize.medium },
    conditionBeforeText: { color: theme.colors.placeholder, fontWeight: 'normal', fontSize: theme.fontSize.medium },
    conditionText: { color: theme.colors.text, fontWeight: '600', fontSize: theme.fontSize.medium },
    loadingStyle: { marginVertical: theme.size.big },
  });

export default memo(ClassCarousel);
