import { ClassSortType, DurationTermEnum, TermState } from '../stores/ClassStore';
import { ClassStatusType, SearchClasssQueryVariables, SearchableClassSortableFields, SearchableSortDirection } from '../API';
import MySnackbar, { snackbarInitialState, snackbarReducer } from '../components/MySnackbar';
import { NavigationFocusInjectedProps, withNavigationFocus } from 'react-navigation';
import React, { Reducer, useCallback, useEffect, useReducer, useState } from 'react';
import { SafeAreaView, View } from 'react-native';
import { useStoreDispatch, useStoreState } from '../stores/initStore';

import DetailSearch from '../components/search/DetailSearch';
import KoreanParagraph from '../components/KoreanParagraph';
import NeedAuthBottomSheet from '../components/NeedAuthBottomSheet';
import SearchBottomSheet from '../components/search/SearchBottomSheet';
import SearchField from '../components/search/SearchField';
import SearchHeader from '../components/search/SearchHeader';
import SearchHistoryList from '../components/search/SearchHistoryList';
import SearchNavBar from '../components/search/SearchNavBar';
import SearchResults from '../components/search/SearchResults';
import StatusBarNormal from '../components/StatusBarNormal';
import { addSearchHistory } from '../functions/manageSearchHistory';
import format from 'date-fns/format';
import getTime from 'date-fns/get_time';
import parse from 'date-fns/parse';
import { getStyles } from '../configs/styles';

const initialState: TermState = {
  termMode: '',
  searchMode: 'all',
  durationTerm: DurationTermEnum.null,
  dateStartTerm: '',
  timeStartTerm: null,
  regionTerm: '',
  tagTerm: [],
  feeTerm: 0,
  keyword: '',
  resultVisible: true,
  openOnly: false,
  classSort: ClassSortType.createdAtDESC,
  isFirstHistoryItem: false,
};

const reducer: Reducer<any, any> = (state, action) => {
  const { type, ...others } = action;

  switch (type) {
    case 'setTermState': {
      return {
        ...state,
        ...others,
      };
    }
    case 'setTermMode': {
      return {
        ...state,
        termMode: others.termMode,
        resultVisible: false,
      };
    }
    case 'setTerm':
      return {
        ...state,
        termMode: '',
        ...others,
        resultVisible: false,
      };
    case 'setResultVisible':
      return {
        ...state,
        resultVisible: others.resultVisible,
      };
    case 'setKeyword':
      return {
        ...state,
        keyword: others.keyword,
        resultVisible: false,
      };
    case 'setSearchMode':
      return {
        ...state,
        searchMode: others.searchMode,
        resultVisible: false,
        // keyword: '',
      };

    case 'queryHistory':
      return {
        ...state,
        ...others,
        resultVisible: true,
      };
    case 'reset':
      return initialState;
  }
};

const limitSize = 20;
const initialSearchVariables = {
  limit: limitSize,
  filter: {
    and: [{ classStatus: { ne: ClassStatusType.hostDisabled } }],
    // * 개발용
    // and: [
    //   { classStatus: { ne: ClassStatusType.cancelled } },
    //   { classStatus: { ne: ClassStatusType.completed } },
    //   { classStatus: { ne: ClassStatusType.closed } },
    // ],
  },
};

interface Props extends NavigationFocusInjectedProps {}

const SearchScreen = ({ isFocused, navigation }: Props) => {
  const [variables, setVariables] = useState<SearchClasssQueryVariables>(initialSearchVariables);
  const [needAuthVisible, setNeedAuthVisible] = useState(false);

  const [termState, termDispatch] = useReducer(reducer, initialState);
  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);
  const { authStore } = useStoreState();
  const storeDispatch = useStoreDispatch();
  const {
    keyword,
    resultVisible,
    searchMode,
    durationTerm,
    dateStartTerm,
    timeStartTerm,
    regionTerm,
    tagTerm,
    feeTerm,
    openOnly,
    classSort,
    isFirstHistoryItem,
  } = termState;
  const styles = getStyles(authStore.appearance);
  const detailSearchable: boolean = durationTerm || dateStartTerm || timeStartTerm || regionTerm || tagTerm.length || feeTerm !== 0;

  const _setClassSort = useCallback((sort: ClassSortType) => termDispatch({ type: 'setTermState', classSort: sort }), [termDispatch]);
  const _setResultVisible = useCallback(
    (arg: boolean) => {
      termDispatch({ type: 'setResultVisible', resultVisible: arg });
    },
    [termDispatch],
  );
  // history store 조작
  useEffect(() => {
    let _mounted = true;
    const getHistoryObject = () => {
      const epochTimeNow = getTime(new Date());

      if (searchMode === 'simple') {
        return { keyword, searchedAt: epochTimeNow, classSort };
      } else {
        return {
          terms: { durationTerm, dateStartTerm, timeStartTerm, regionTerm, tagTerm, feeTerm },
          searchedAt: epochTimeNow,
          classSort,
        };
      }
    };

    if (_mounted && resultVisible && searchMode !== 'all') {
      const historyItem = getHistoryObject();

      const type = searchMode === 'simple' ? 'simpleSearchHistory' : 'detailSearchHistory';

      if (type !== null && !isFirstHistoryItem) {
        addSearchHistory({
          storeDispatch,
          historyItem,
          type,
          searchHistory: authStore[type],
        });
      }
    }
    return () => {
      _mounted = false;
    };
  }, [resultVisible]);

  // keyword 및 상세 조건이 변경되면 알아서 쿼리 variables　업데이트
  useEffect(() => {
    let _mounted = true;
    const _getSortDirection = () => {
      const sortDirection = { field: SearchableClassSortableFields.timeStart, direction: SearchableSortDirection.desc };
      switch (classSort) {
        case ClassSortType.timeStartASC:
          sortDirection.field = SearchableClassSortableFields.timeStart;
          sortDirection.direction = SearchableSortDirection.asc;
          break;
        case ClassSortType.timeStartDESC:
          sortDirection.field = SearchableClassSortableFields.timeStart;
          break;
        case ClassSortType.createdAtDESC:
          sortDirection.field = SearchableClassSortableFields.createdAt;
          break;
        case ClassSortType.classFeeDESC:
          sortDirection.field = SearchableClassSortableFields.classFee;
          break;
        case ClassSortType.numOfClassDESC:
          sortDirection.field = SearchableClassSortableFields.numOfClass;
          break;
      }
      return sortDirection;
    };

    const _handleSetVariables = () => {
      const { filter: initialFilters, ...others } = initialSearchVariables;

      if (searchMode === 'all') {
        setVariables({
          filter: {
            ...initialFilters,
            ...(openOnly && {
              and: [
                { classStatus: { ne: ClassStatusType.hostDisabled } },
                {
                  or: [{ classStatus: { eq: ClassStatusType.open } }, { classStatus: { eq: ClassStatusType.reserved } }],
                },
              ],
            }),
          },
          sort: _getSortDirection(),
          ...others,
        });
      } else if (searchMode === 'simple' && keyword) {
        setVariables({
          filter: {
            ...initialFilters,
            ...(openOnly && {
              and: [
                { classStatus: { ne: ClassStatusType.hostDisabled } },
                {
                  or: [{ classStatus: { eq: ClassStatusType.open } }, { classStatus: { eq: ClassStatusType.reserved } }],
                },
              ],
            }),
            or: [
              { tagSearchable: { matchPhrase: keyword } },
              { memo: { matchPhrase: keyword } },
              { title: { matchPhrase: keyword } },
              { regionSearchable: { matchPhrase: keyword } },
            ],
          },
          sort: _getSortDirection(),
          ...others,
        });
      } else if (searchMode === 'detail') {
        let filterArray = [];
        if (durationTerm !== DurationTermEnum.null) {
          if (durationTerm !== DurationTermEnum.null) {
            filterArray.push({ isLongTerm: { eq: durationTerm === DurationTermEnum.longTerm } });
          }
        }
        if (dateStartTerm !== '') {
          filterArray.push({ dateStart: { eq: getTime(parse(dateStartTerm)) / 1000 } });
        }
        if (timeStartTerm !== null) {
          filterArray.push({ timeStartString: { matchPhrase: format(timeStartTerm, 'HH:mmZ') } });
        }
        if (regionTerm !== '') {
          // TODO: prod 에선 삭제 필요
          // const revisedRegionTerm = regionTerm.split('_')[1];
          filterArray.push({
            regionSearchable: { eq: regionTerm },
            // or: [
            //   // { regionSearchable: { matchPhrase: revisedRegionTerm } },
            //   { regionSearchable: { eq: regionTerm } },
            // ],
          });
        }
        if (tagTerm.length !== 0) {
          // TODO: prod 에선 삭제 필요

          tagTerm.forEach((tag: string) => {
            // const revisedTagTerm = tag.split('_')[1];

            filterArray.push({
              tagSearchable: { matchPhrase: tag },
              // or: [{ tagSearchable: { matchPhrase: revisedTagTerm } }, { tagSearchable: { matchPhrase: tag } }],
            });
          });
        }
        if (feeTerm !== 0) {
          filterArray.push({ classFee: { gte: feeTerm } });
        }
        const filterObj = {
          and: [
            ...filterArray,
            ...initialFilters.and,
            ...(openOnly
              ? [
                  {
                    or: [{ classStatus: { eq: ClassStatusType.open } }, { classStatus: { eq: ClassStatusType.reserved } }],
                  },
                ]
              : []),
          ],
        };
        if (_mounted) {
          setVariables({
            filter: filterObj,
            sort: _getSortDirection(),
            ...others,
          });
        }
      }
    };

    if (_mounted) {
      _handleSetVariables();
    }
    return () => {
      _mounted = false;
    };
  }, [keyword, durationTerm, dateStartTerm, timeStartTerm, regionTerm, tagTerm, feeTerm, searchMode, classSort, openOnly]);

  const renderBody = () => {
    switch (searchMode) {
      case 'all':
        return (
          <View style={styles.rowWithSort}>
            <KoreanParagraph
              text={`상단의 "${classSort}" 을 터치하시면 정렬 방법을 변경할 수 있습니다`}
              textStyle={styles.guideText}
              paragraphStyle={styles.guideParagraph}
              focusTextStyle={styles.focusText}
            />
          </View>
        );
      case 'simple':
        return (
          <>
            <KoreanParagraph text="입력한 단어가 제목, 추가 정보, 지역, 키워드 등에 포함된 클래스를 검색합니다" textStyle={styles.guideText} />
            <View style={styles.searchBar}>
              <SearchField keyword={keyword} termDispatch={termDispatch} appearance={authStore.appearance} />
            </View>
          </>
        );
      case 'detail':
        return <DetailSearch termState={termState} dispatch={termDispatch} />;
    }
  };

  return (
    <>
      <StatusBarNormal appearance={authStore.appearance} />
      <SafeAreaView style={styles.contentContainerView}>
        <SearchHeader
          searchMode={searchMode}
          keyword={keyword}
          detailSearchable={detailSearchable}
          setResultVisible={_setResultVisible}
          classSort={classSort}
          setClassSort={_setClassSort}
        />
        <SearchNavBar searchMode={searchMode} openOnly={openOnly} termDispatch={termDispatch} appearance={authStore.appearance} />
        <View style={[styles.screenMarginHorizontal, styles.containerMarginVertical]}>{renderBody()}</View>

        <View style={styles.flex1}>
          <SearchResults
            resultVisible={resultVisible}
            variables={variables}
            searchMode={searchMode}
            snackbarDispatch={snackbarDispatch}
            setNeedAuthVisible={setNeedAuthVisible}
            origin="Search"
            isFocused={isFocused}
          />
          {searchMode !== 'all' && <SearchHistoryList searchMode={searchMode} dispatch={termDispatch} resultVisible={resultVisible} />}
        </View>

        <SearchBottomSheet termState={termState} dispatch={termDispatch} appearance={authStore.appearance} />
        <MySnackbar dispatch={snackbarDispatch} snackbarState={snackbarState} />
      </SafeAreaView>
      {needAuthVisible && <NeedAuthBottomSheet navigation={navigation} isFocused={isFocused} setNeedAuthVisible={setNeedAuthVisible} />}
    </>
  );
};

export default withNavigationFocus(SearchScreen);
