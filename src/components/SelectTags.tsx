import { CLASS_TAG_LIMIT, TAGS_CREATED_AT, USER_TAG_LIMIT } from '../configs/variables';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import { NavigationState, TabBar, TabView } from 'react-native-tab-view';
import React, { memo, useEffect, useState } from 'react';
import { Tag, Tags } from '../types/store';
import { getTheme, normalize } from '../configs/theme';

import AndroidDivider from './AndroidDivider';
import FocusText from './FocusText';
import Loading from './Loading';
import { MySnackbarAction } from './MySnackbar';
import PageCounter from './PageCounter';
import TabTagList from './TabTagList';
import TagChips from './TagChips';
import asyncForEach from '../functions/asyncForEach';
import { getTags } from '../customGraphqls';
import gql from 'graphql-tag';
import guestClient from '../configs/guestClient';
import reportSentry from '../functions/reportSentry';
import sort from 'js-flock/sort';
import { useQuery } from '@apollo/react-hooks';
import { useStoreState } from '../stores/initStore';

interface Props {
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  snackbarDispatch?: (arg: MySnackbarAction) => void;
  includeRegionTags?: boolean;
  isSubsScreen?: boolean;
  isSearchTerm?: boolean;
  isPostTags?: boolean;
  shadowNeedless?: boolean;
}
interface NonRegionTags {
  yogaTags: Tag[];
  pilatesTags: Tag[];
  targetTags: Tag[];
  groupTags?: Tag[];
  etcTags?: Tag[];
  updated: boolean;
}

// interface NonRegionPostTags {
//   yogaTags: Tag[];
//   pilatesTags: Tag[];
//   targetTags: Tag[];
//   updated: boolean;
// }

const initialRoutes: any[] = [
  { key: 'yoga', title: '요가' },
  { key: 'pilates', title: '필라테스' },
  { key: 'target', title: '대상' },
  { key: 'group', title: '규모' },
  { key: 'etc', title: '기타' },
];

const initialIsPostRoutes: any[] = [
  { key: 'yoga', title: '요가' },
  { key: 'pilates', title: '필라테스' },
  { key: 'target', title: '대상' },
];

const GET_TAGS = gql(getTags);

const nonRegionTagsInitialState: NonRegionTags = {
  yogaTags: [],
  pilatesTags: [],
  targetTags: [],
  groupTags: [],
  etcTags: [],
  updated: false,
};
const nonRegionPostTagsInitialState: NonRegionTags = {
  yogaTags: [],
  pilatesTags: [],
  targetTags: [],
  updated: false,
};

const SelectTags = ({
  selectedTags,
  setSelectedTags,
  snackbarDispatch,
  includeRegionTags,
  isSubsScreen,
  isSearchTerm,
  isPostTags,
  shadowNeedless,
}: Props) => {
  const {
    authStore: { user, appearance },
  } = useStoreState();
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme, isSearchTerm);

  const [tabViewState, setTabViewState] = useState<NavigationState<any>>({
    index: 0,
    routes: isPostTags ? initialIsPostRoutes : initialRoutes,
  });
  const [regionTags, setRegionTags] = useState<Array<Tag>>([]);
  const [nonRegionTags, setNonRegionTags] = useState<NonRegionTags>(
    isPostTags ? nonRegionPostTagsInitialState : nonRegionTagsInitialState,
  );
  const { yogaTags, pilatesTags, targetTags, groupTags, etcTags, updated } = nonRegionTags;

  const { loading: regionTagsLoading, data: regionTagsData, error: regionTagsError } = useQuery(GET_TAGS, {
    variables: {
      id: 'region-tags',
      createdAt: TAGS_CREATED_AT,
    },
    fetchPolicy: 'network-only',
    skip: !includeRegionTags,
    ...(!user && { client: guestClient }),
  });

  const { loading: nonRegionTagsLoading, data: nonRegionTagsData, error: nonRegionTagsError } = useQuery(GET_TAGS, {
    variables: {
      id: 'non-region-tags',
      createdAt: TAGS_CREATED_AT,
    },
    fetchPolicy: 'network-only',
    ...(!user && { client: guestClient }),
  });

  useEffect(() => {
    let _mounted = true;
    if (_mounted) {
      if (regionTagsData?.getNews?.extraData) {
        const regionTagsRaw: Tags = JSON.parse(regionTagsData.getNews.extraData);
        const regionTagsTempArray = Object.values(regionTagsRaw);
        const tempArray = sort(regionTagsTempArray).asc((tag: Tag) => {
          return tag.index;
        });
        setRegionTags(tempArray);
        if (tabViewState.routes[0].key !== 'region') {
          const newRoutes = [{ key: 'region', title: '지역' }].concat(tabViewState.routes);
          setTabViewState({ index: 0, routes: newRoutes });
        }
      }

      if (nonRegionTagsData?.getNews?.extraData) {
        const nonRegionTagsRaw: Tags = JSON.parse(nonRegionTagsData.getNews.extraData);
        if (isPostTags) {
          delete nonRegionTagsRaw['규모'];
          delete nonRegionTagsRaw['기타'];
        }
        const nonRegionTagsTempArray = Object.entries(nonRegionTagsRaw);

        (async function() {
          let tempState: NonRegionTags = {
            yogaTags: [],
            pilatesTags: [],
            targetTags: [],
            groupTags: [],
            etcTags: [],
            updated: false,
          };
          if (isPostTags) {
            tempState = {
              yogaTags: [],
              pilatesTags: [],
              targetTags: [],
              updated: false,
            };
          }
          try {
            await asyncForEach(nonRegionTagsTempArray, (item: any) => {
              switch (item[0]) {
                case '요가':
                  tempState.yogaTags = sort(Object.values(item[1])).asc((tag: Tag) => {
                    return tag.index;
                  });
                  break;
                case '필라테스':
                  tempState.pilatesTags = sort(Object.values(item[1])).asc((tag: Tag) => {
                    return tag.index;
                  });
                  break;
                case '대상':
                  tempState.targetTags = sort(Object.values(item[1])).asc((tag: Tag) => {
                    return tag.index;
                  });
                  break;
                case '규모':
                  tempState.groupTags = sort(Object.values(item[1])).asc((tag: Tag) => {
                    return tag.index;
                  });
                  break;
                default:
                  tempState.etcTags = sort(Object.values(item[1])).asc((tag: Tag) => {
                    return tag.index;
                  });
                  break;
              }
            });

            tempState.updated = true;
            setNonRegionTags(tempState);
          } catch (e) {
            reportSentry(e);
            // console.log(e);
          }
        })();
      }
    }
    return () => {
      _mounted = false;
    };
  }, [regionTagsData, nonRegionTagsData]);

  if (nonRegionTagsLoading || regionTagsLoading || !updated) {
    return <Loading origin="SelectTags" />;
  }

  const _handleIndexChange = (index: number) => setTabViewState({ index, routes: tabViewState.routes });

  const RegionTagList = (
    <TabTagList
      data={regionTags}
      selectedTags={selectedTags}
      setSelectedTags={setSelectedTags}
      snackbarDispatch={snackbarDispatch}
      isSubsScreen={isSubsScreen}
      isRegion
      appearance={appearance}
    />
  );

  const YogaTagList = (
    <TabTagList
      data={yogaTags}
      selectedTags={selectedTags}
      setSelectedTags={setSelectedTags}
      snackbarDispatch={snackbarDispatch}
      isSubsScreen={isSubsScreen}
      isSearchTerm={isSearchTerm}
      appearance={appearance}
    />
  );

  const PilatesTagList = (
    <TabTagList
      data={pilatesTags}
      selectedTags={selectedTags}
      setSelectedTags={setSelectedTags}
      snackbarDispatch={snackbarDispatch}
      isSubsScreen={isSubsScreen}
      isSearchTerm={isSearchTerm}
      appearance={appearance}
    />
  );

  const TargetTagList = (
    <TabTagList
      data={targetTags}
      selectedTags={selectedTags}
      setSelectedTags={setSelectedTags}
      snackbarDispatch={snackbarDispatch}
      isSubsScreen={isSubsScreen}
      isSearchTerm={isSearchTerm}
      appearance={appearance}
    />
  );

  const GroupTagList = (
    <TabTagList
      data={groupTags!}
      selectedTags={selectedTags}
      setSelectedTags={setSelectedTags}
      snackbarDispatch={snackbarDispatch}
      isSubsScreen={isSubsScreen}
      isSearchTerm={isSearchTerm}
      appearance={appearance}
    />
  );

  const EtcTagList = (
    <TabTagList
      data={etcTags!}
      selectedTags={selectedTags}
      setSelectedTags={setSelectedTags}
      snackbarDispatch={snackbarDispatch}
      isSubsScreen={isSubsScreen}
      isSearchTerm={isSearchTerm}
      appearance={appearance}
    />
  );

  const renderTabBar = (props: any) => {
    return (
      <TabBar
        {...props}
        indicatorStyle={styles.tabBarIndicatorStyle}
        activeColor={theme.colors.primary}
        inactiveColor={theme.colors.placeholder}
        style={styles.tabBarStyle}
        scrollEnabled
        tabStyle={styles.tabStyle}
        width="auto"
      />
    );
  };

  return (
    <>
      <View style={[styles.container, { ...(!shadowNeedless ? styles.shadow : {}) }]}>
        <TabView
          swipeEnabled
          navigationState={tabViewState}
          onIndexChange={_handleIndexChange}
          renderScene={({ route }) => {
            switch (route.key) {
              case 'region':
                return RegionTagList;
              case 'yoga':
                return YogaTagList;
              case 'pilates':
                return PilatesTagList;
              case 'target':
                return TargetTagList;
              case 'group':
                return GroupTagList;
              case 'etc':
                return EtcTagList;
              default:
                return null;
            }
          }}
          initialLayout={{ width: Dimensions.get('window').width }}
          renderTabBar={renderTabBar}
          sceneContainerStyle={styles.screenMarginHorizontal}
        />
      </View>
      {!isSearchTerm && (
        <>
          {Platform.OS === 'android' && <AndroidDivider needMinusMarginHorizontal />}

          <View style={styles.focusContainer}>
            <View style={styles.textRowSpaceBetween}>
              <FocusText appearance={appearance}>{isSubsScreen ? '구독 중인' : '선택한'} 키워드들 </FocusText>
              <PageCounter
                pageNumber={`현재 ${selectedTags.length}`}
                totalPageNumber={`최대 ${isSubsScreen ? USER_TAG_LIMIT : CLASS_TAG_LIMIT}`}
              />
            </View>
            <TagChips
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              isSubsScreen={isSubsScreen}
              appearance={appearance}
            />
          </View>
        </>
      )}
    </>
  );
};

const getThemedStyles = (theme: any, isSearchTerm: boolean) =>
  StyleSheet.create({
    focusContainer: {
      flexDirection: 'column',
      marginVertical: theme.size.small,
      maxHeight: 160,
      minHeight: 100,
    },
    screenMarginHorizontal: { marginHorizontal: theme.size.big },
    container: {
      flex: 1,
      backgroundColor: isSearchTerm ? theme.colors.uiBackground : theme.colors.background,
      marginHorizontal: -theme.size.big,
      paddingBottom: theme.size.normal,
      // elevation: 4,
    },
    shadow: {
      shadowColor: theme.colors.grey200,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.4,
      shadowRadius: 3,
    },

    textRowSpaceBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    tabBarStyle: {
      backgroundColor: isSearchTerm ? theme.colors.uiBackground : theme.colors.background,
      marginHorizontal: theme.size.normal,
      elevation: 0,
      // shadowColor: theme.colors.placeholder,
      shadowOpacity: 0,
      borderColor: theme.colors.disabled,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    tabBarIndicatorStyle: { backgroundColor: theme.colors.primary },
    tabStyle: {
      width: normalize(70),
    },
  });

export default memo(SelectTags);
