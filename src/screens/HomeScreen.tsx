import * as Animatable from 'react-native-animatable';

import { RefreshControl, SafeAreaView, ScrollView } from 'react-native';
import {
  ClassStatusType,
  NewsStatus,
  NewsType,
  PostStatus,
  SearchClasssQueryVariables,
  SearchableClassSortableFields,
  SearchableSortDirection,
  ModelSortDirection,
  PostCategory,
} from '../API';
import React, { useEffect, useMemo, useRef, useState } from 'react';
// TODO: ㄴㅏ중에 클래스가 쌓이면 적용
// import addDays from 'date-fns/add_days';
import { customListNewsByType, customListPostsByCategory, customSearchCarouselClasss } from '../customGraphqls';
import useHomeState, { CarouselTimeOption } from '../functions/useHomeState';

import AD_IDS from '../static/data/AD_IDS';
// import ClassCarousel from '../components/home/ClassCarousel';
// import ClassSoon from '../components/home/ClassSoon';
import EventList from '../components/home/EventList';
import HomeNavBar from '../components/home/HomeNavBar';
import HotNotice from '../components/home/HotNotice';
import ListPosts from '../components/home/ListPosts';
import MyBannerAd from '../components/Ad/MyBannerAd';
import { NavigationTabScreenProps } from 'react-navigation-tabs';
import NeedAuthBottomSheet from '../components/NeedAuthBottomSheet';
import NoticeList from '../components/home/NoticeList';
import OnBoarding from '../components/home/OnBoarding';
import StatusBarNormal from '../components/StatusBarNormal';
import checkHotNoticeRead from '../functions/checkHotNoticeRead';
import exitAlert from '../functions/exitAlert';
import { getStyles } from '../configs/styles';
import gql from 'graphql-tag';
import guestClient from '../configs/guestClient';
// import hideSplashScreen from '../functions/hideSplashScreen';
import reportSentry from '../functions/reportSentry';
import useHandleAndroidBack from '../functions/handleAndroidBack';
import { useQuery } from '@apollo/react-hooks';
import { useStoreState } from '../stores/initStore';
import { withNavigationFocus } from 'react-navigation';
import { allPromisesSettled } from '../functions/allPromisesSettled';

interface Props extends NavigationTabScreenProps {
  isFocused: boolean;
}
const LIST_NEWS = gql(customListNewsByType);
const LIST_POSTS = gql(customListPostsByCategory);
// const SEARCH_CLASS = gql(customSearchCarouselClasss);

// const limitSize = 20;
// const initialSearchVariables: SearchClasssQueryVariables = {
//   limit: limitSize,
//   filter: {
//     and: [
//       {
//         or: [{ classStatus: { eq: ClassStatusType.open } }, { classStatus: { eq: ClassStatusType.reserved } }],
//       },
//     ],
//   },
//   sort: { field: SearchableClassSortableFields.createdAtEpoch, direction: SearchableSortDirection.asc },
// };

const now = new Date().toISOString();

// const nowDate = new Date();
// TODO: ㄴㅏ중에 클래스가 쌓이면 적용
// const time3DaysFromNow = Math.floor(addDays(nowDate, 3).getTime() / 1000);
// const nowEpoch = Math.floor(nowDate.getTime() / 1000);
// const soonVariables = {
//   limit: 1,
//   filter: {
//     and: [
//       { classStatus: { eq: ClassStatusType.open } },
//       {
//         timeStart: {
//           // TODO: ㄴㅏ중에 클래스가 쌓이면 적용
//           // lte: time3DaysFromNow,
//           gte: nowEpoch,
//         },
//       },
//     ],
//   },
//   sort: { field: SearchableClassSortableFields.timeStart, direction: SearchableSortDirection.asc },
// };

const HomeScreen = ({ navigation, isFocused }: Props) => {
  useHandleAndroidBack(navigation, exitAlert);

  // const [variables, setVariables] = useState<SearchClasssQueryVariables>(initialSearchVariables);
  // const [refreshing, setRefreshing] = useState(false);
  const [needAuthVisible, setNeedAuthVisible] = useState(false);
  const [hotNoticeVisible, setHotNoticeVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { homeState, homeDispatch } = useHomeState();

  // const { choosedTag, choosedTimeOption } = homeState;
  // const carouselEl = useRef<any>(null);

  const {
    authStore: { user, lastReadClassAt, appState, appearance },
  } = useStoreState();

  // useEffect(() => {
  //   let _mounted = true;

  //   if (_mounted) {
  //     const { filter: filters, ...others } = variables;

  //     let newAndFilter = [...initialSearchVariables!.filter!.and!];
  //     if (lastReadClassAt && choosedTimeOption === CarouselTimeOption.NEW) {
  //       newAndFilter.push({ createdAtEpoch: { gt: lastReadClassAt } });
  //     }

  //     if (choosedTag) {
  //       choosedTag.forEach((tag: string) => {
  //         newAndFilter.push({
  //           or: [{ tagSearchable: { matchPhrase: tag } }, { regionSearchable: { matchPhrase: tag } }],
  //         });
  //       });
  //     }

  //     const newFilter = { and: newAndFilter };

  //     setVariables({
  //       ...others,
  //       filter: newFilter,
  //     });

  //     if (carouselEl && carouselEl.current) {
  //       carouselEl.current.snapToItem(0);
  //     }
  //   }
  //   return () => {
  //     _mounted = false;
  //   };
  // }, [lastReadClassAt, choosedTimeOption, choosedTag]);

  const styles = getStyles(appearance);
  const {
    data: hotNoticeData,
    refetch: hotNoticeRefetch,
    networkStatus: hotNoticeNetworkStatus,
    // loading: hotNoticeLoading,
  } = useQuery(LIST_NEWS, {
    variables: {
      newsType: NewsType.hot,
      filter: {
        and: [
          {
            newsStatus: { eq: NewsStatus.valid },
          },
          {
            validDate: { ge: now },
          },
        ],
      },
      sortDirection: ModelSortDirection.DESC,
    },
    fetchPolicy: 'network-only',
    ...(!user && { client: guestClient }),
    notifyOnNetworkStatusChange: true,
  });

  const { error: postInfoError, data: postInfoData, refetch: postInfoRefetch } = useQuery(LIST_POSTS, {
    variables: {
      postCategory: 'info',
      limit: 5,
      sortDirection: ModelSortDirection.DESC,
      filter: { postStatus: { eq: PostStatus.open } },
    },
    // skip: !breed,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
    ...(!user && { client: guestClient }),
  });

  const { error: postPrError, data: postPrData, refetch: postPrRefetch } = useQuery(LIST_POSTS, {
    variables: {
      postCategory: 'pr',
      limit: 3,
      sortDirection: ModelSortDirection.DESC,
      filter: { postStatus: { eq: PostStatus.open } },
    },
    // skip: !breed,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
    ...(!user && { client: guestClient }),
  });

  const { error: postMiscError, data: postMiscData, refetch: postMiscRefetch } = useQuery(LIST_POSTS, {
    variables: {
      postCategory: 'misc',
      limit: 3,
      sortDirection: ModelSortDirection.DESC,
      filter: { postStatus: { eq: PostStatus.open } },
    },
    // skip: !breed,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
    ...(!user && { client: guestClient }),
  });

  const { data: eventData, error: eventError, refetch: eventRefetch, networkStatus: eventNetworkStatus } = useQuery(LIST_NEWS, {
    variables: {
      newsType: NewsType.event,
      filter: {
        and: [
          {
            newsStatus: { eq: NewsStatus.valid },
          },
          {
            validDate: { ge: now },
          },
        ],
      },
      sortDirection: ModelSortDirection.DESC,
    },
    fetchPolicy: 'network-only',
    ...(!user && { client: guestClient }),
    notifyOnNetworkStatusChange: true,
  });
  const { data: noticeData, error: noticeError, refetch: noticeRefetch, networkStatus: noticeNetworkStatus } = useQuery(LIST_NEWS, {
    variables: {
      newsType: NewsType.notice,
      filter: {
        and: [
          {
            newsStatus: { eq: NewsStatus.valid },
          },
          {
            validDate: { ge: now },
          },
        ],
      },
      limit: 3,
      sortDirection: ModelSortDirection.DESC,
    },
    fetchPolicy: 'network-only',
    ...(!user && { client: guestClient }),
    notifyOnNetworkStatusChange: true,
  });

  // const {
  //   error: ccError,
  //   data: ccData,
  //   fetchMore: ccFetchMore,
  //   refetch: ccRefetch,
  //   networkStatus: ccNetworkStatus,
  // } = useQuery(SEARCH_CLASS, {
  //   variables,
  //   fetchPolicy: 'cache-and-network',
  //   ...(!user && { client: guestClient }),
  // });

  // const { error: soonError, data: soonData, refetch: soonRefetch, networkStatus: soonNetworkStatus } = useQuery(
  //   SEARCH_CLASS,
  //   {
  //     variables: soonVariables,
  //     fetchPolicy: 'cache-and-network',
  //     ...(!user && { client: guestClient }),
  //   },
  // );

  useHandleAndroidBack(navigation, exitAlert);

  const _handleOnRefresh = () => {
    if (
      // !!ccRefetch &&
      // && !!soonRefetch
      !!hotNoticeRefetch &&
      !!eventRefetch &&
      !!postInfoRefetch &&
      !!postPrRefetch &&
      !!postMiscRefetch &&
      !!noticeRefetch
    ) {
      allPromisesSettled([
        // ccRefetch(),
        // soonRefetch(),
        hotNoticeRefetch(),
        eventRefetch(),
        postInfoRefetch(),
        postMiscRefetch(),
        postPrRefetch(),
        noticeRefetch(),
      ])
        // .then(result => console.log(result))
        .catch(e => reportSentry(e));
    }
  };

  useEffect(() => {
    let _mounted = true;
    if (_mounted && isFocused && appState === 'active') {
      _handleOnRefresh();
    }
    return () => {
      _mounted = false;
    };
  }, [appState, isFocused]);

  // useEffect(() => {
  //   let _mounted = true;
  //   if (_mounted) {
  //     if (
  //       hotNoticeNetworkStatus === 4 ||
  //       eventNetworkStatus === 4 ||
  //       noticeNetworkStatus === 4 ||
  //       postInfoNetworkStatus === 4 ||
  //       ccNetworkStatus === 4 ||
  //       soonNetworkStatus === 4
  //     ) {
  //       // console.log('refetching somethjing');
  //       if (!refreshing) {
  //         setRefreshing(true);
  //       }
  //     } else {
  //       if (refreshing) {
  //         setRefreshing(false);
  //       }
  //     }
  //   }

  //   return () => {
  //     _mounted = false;
  //   };
  // }, [
  //   hotNoticeNetworkStatus,
  //   eventNetworkStatus,
  //   noticeNetworkStatus,
  //   postInfoNetworkStatus,
  //   ccNetworkStatus,
  //   soonNetworkStatus,
  // ]);

  useEffect(() => {
    let _mounted = true;
    if (
      _mounted &&
      hotNoticeNetworkStatus === 7
      //  &&       hotNoticeData.listNewsByType &&
      // hotNoticeData.listNewsByType.items.length > 0
    ) {
      if (hotNoticeData?.listNewsByType?.items?.length && hotNoticeData.listNewsByType.items.length > 0) {
        // console.log('will make hotnotice visible', hotNoticeData);
        const { id } = hotNoticeData.listNewsByType.items[0];

        checkHotNoticeRead(id, !!user ? user.username : undefined).then(result => {
          if (!result) {
            setHotNoticeVisible(true);
          } else {
            setHotNoticeVisible(false);
          }
        });
      }
    }
    return () => {
      _mounted = false;
    };
  }, [hotNoticeNetworkStatus]);

  const _handleRefreshControl = () => {
    setRefreshing(true);
    allPromisesSettled([
      // ccRefetch(), soonRefetch(),
      hotNoticeRefetch(),
      eventRefetch(),
      postInfoRefetch(),
      noticeRefetch(),
    ])
      .then(result => setRefreshing(false))
      .catch(e => reportSentry(e));
  };

  return (
    <SafeAreaView style={styles.contentContainerView}>
      <StatusBarNormal appearance={appearance} />

      <HomeNavBar isFocused={isFocused} />
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={_handleRefreshControl} />}>
        {hotNoticeVisible && hotNoticeNetworkStatus === 7 && !!hotNoticeData?.listNewsByType?.items?.[0] && (
          <HotNotice data={hotNoticeData.listNewsByType.items} setHotNoticeVisible={setHotNoticeVisible} />
        )}
        <Animatable.View useNativeDriver animation={hotNoticeVisible ? 'fadeInDown' : 'fadeInUp'}>
          {/* <ClassCarousel
            isFocused={isFocused}
            data={ccData}
            error={ccError}
            fetchMore={ccFetchMore}
            // networkStatus={ccNetworkStatus}
            carouselEl={carouselEl}
            homeState={homeState}
            homeDispatch={homeDispatch}
            setNeedAuthVisible={setNeedAuthVisible}
          /> */}
          <EventList data={eventData} error={eventError} />
          {/* <ClassSoon
            data={soonData}
            error={soonError}
            networkStatus={soonNetworkStatus}
            now={nowDate}
            setNeedAuthVisible={setNeedAuthVisible}
            appearance={appearance}
          /> */}
          <ListPosts data={postInfoData} error={postInfoError} category={PostCategory.info} />
          <ListPosts data={postPrData} error={postPrError} category={PostCategory.pr} />
          <ListPosts data={postMiscData} error={postMiscError} category={PostCategory.misc} />
          {/* {!isOnBoardingFinished && <OnBoarding />} */}
          <NoticeList data={noticeData} error={noticeError} />
          <MyBannerAd advId={AD_IDS.HomeBanner} needMarginHorizontal needMarginBottom />
        </Animatable.View>
      </ScrollView>

      {needAuthVisible && (
        <NeedAuthBottomSheet
          navigation={navigation}
          isFocused={isFocused}
          setNeedAuthVisible={setNeedAuthVisible}
          // params={{ classId: id }}
          origin="Home"
        />
      )}
    </SafeAreaView>
  );
};

export default withNavigationFocus(HomeScreen);
