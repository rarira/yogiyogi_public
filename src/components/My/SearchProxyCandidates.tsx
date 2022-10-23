import { MySnackbarAction, OPEN_SNACKBAR } from '../MySnackbar';
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import KoreanParagraph from '../KoreanParagraph';
import Loading from '../Loading';
import ProxyCandidatesList from './ProxyCandidatesList';
import { customSearchProxy } from '../../customGraphqls';
import { getSearchChatroomQueryInput } from '../../functions/getSearchChatroomQueryInput';
import gql from 'graphql-tag';
import reportSentry from '../../functions/reportSentry';

import { useQuery } from '@apollo/react-hooks';
import { getTheme } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

interface Props {
  classId: string;
  snackbarDispatch: (arg: MySnackbarAction) => void;
  hostId?: string;
  origin: string;
  allChat?: boolean;
  appearance: AppearanceType;
}

const SEARCH_PROXY_CANDIDATES = gql(customSearchProxy);
const SearchProxyCandidates = ({ classId, snackbarDispatch, hostId, origin, allChat, appearance }: Props) => {
  const variables = !!hostId ? getSearchChatroomQueryInput(hostId, null, allChat) : getSearchChatroomQueryInput(null, classId!, allChat);
  const { error, data, fetchMore, refetch, networkStatus } = useQuery(SEARCH_PROXY_CANDIDATES, {
    variables,
    fetchPolicy: 'cache-and-network',
  });

  if (!data || !data.searchConvs) {
    return <Loading origin="SearchProxyCandidates" />;
  }

  if (error) {
    reportSentry(error);
    snackbarDispatch({ type: OPEN_SNACKBAR, message: error.message });
    return null;
  }

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);
  return (
    <View style={[styles.screenMarginHorizontal, styles.flex1]}>
      <KoreanParagraph
        text="지금까지 대화 상대 목록입니다. 해당 사용자 중에 클래스를 수행하신 선생님이 있으면 선택하세요"
        textStyle={styles.guideText}
        paragraphStyle={styles.guideParagraph}
      />
      <ProxyCandidatesList
        hostId={hostId}
        classId={classId}
        data={data}
        refetch={refetch}
        initialNumToRender={20}
        fetchMore={fetchMore}
        origin={origin}
        appearance={appearance}
      />
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    flex1: {
      flex: 1,
    },
    screenMarginHorizontal: { marginHorizontal: theme.size.big },
    guideText: {
      fontSize: theme.fontSize.medium,
      fontWeight: '600',
      color: theme.colors.text,
    },
    guideParagraph: {
      marginBottom: theme.size.small,
    },
  });

export default memo(SearchProxyCandidates);
