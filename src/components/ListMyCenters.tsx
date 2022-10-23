import { AuthStoreType, MyCenter, MyCenterItem, StoreAction } from '../types/store';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { MySnackbarAction, OPEN_SNACKBAR } from './MySnackbar';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { Dispatch, useState } from 'react';

import FlatListEmptyResults from './FlatListEmptyResults';
import FlatListFooter from './FlatListFooter';
import ListMyCentersCard from './ListMyCentersCard';
import Loading from './Loading';
import { REGISTER_MY_CENTER } from '../stores/actionTypes';
import { customListMyCentersByUser } from '../customGraphqls';
import gql from 'graphql-tag';
import reportSentry from '../functions/reportSentry';
import { useQuery } from '@apollo/react-hooks';
import { getTheme } from '../configs/theme';

interface Props extends NavigationInjectedProps {
  authStore: AuthStoreType;
  snackbarDispatch: (arg: MySnackbarAction) => void;
  storeDispatch: Dispatch<StoreAction>;
  setSelectedMyCenter?: (arg: MyCenter) => void;
  selectedMyCenter?: MyCenter;
}

const LIST_MY_CENTERS = gql(customListMyCentersByUser);

const ListMyCenters = ({ authStore, navigation, snackbarDispatch, storeDispatch, selectedMyCenter, setSelectedMyCenter }: Props) => {
  if (!authStore.user) {
    return null;
  }
  const theme = getTheme(authStore.appearance);
  const styles = getThemedStyles(theme);
  const [refreshing, setRefreshing] = useState(false);

  const { loading, error, data, fetchMore, refetch } = useQuery(LIST_MY_CENTERS, {
    variables: { myCenterUserId: authStore.user.username },
    fetchPolicy: 'cache-and-network',
  });

  const origin = navigation.state.routeName;

  const registerButton = (myCenters: Array<MyCenter>) => {
    const _handleOnPress = () => {
      storeDispatch({
        type: REGISTER_MY_CENTER,
        myCenters,
        origin,
      });
      navigation.navigate('RegisterCenter');
    };
    return (
      <TouchableOpacity
        onPress={_handleOnPress}
        style={[
          styles.registerButtonContainer,
          ...(origin !== 'AddClass' ? [{ backgroundColor: theme.colors.primary, marginBottom: theme.size.big }] : [{}]),
        ]}
      >
        <Text
          style={
            origin === 'AddClass'
              ? { fontSize: theme.fontSize.medium, color: theme.colors.primary, fontWeight: '600' }
              : { fontSize: theme.fontSize.normal, color: theme.colors.background, fontWeight: '700' }
          }
        >
          마이센터 새로 추가
        </Text>
      </TouchableOpacity>
    );
  };

  const _keyExtractor = (item: MyCenterItem) => item.id;

  const renderItem = ({ item }: { item: MyCenterItem }) => {
    const selected = selectedMyCenter?.id === item.center.id;
    return (
      <ListMyCentersCard
        item={item}
        origin={origin}
        username={authStore.user.username}
        snackbarDispatch={snackbarDispatch}
        selected={selected}
        setSelectedMyCenter={setSelectedMyCenter}
        theme={theme}
      />
    );
  };

  if (!data || !data.listMyCentersByUser) {
    return <Loading origin="ListMyCenters" />;
  }
  if (error) {
    reportSentry(error);
    snackbarDispatch({ type: OPEN_SNACKBAR, message: error.message });
    return null;
  }

  const myCentersArray = data.listMyCentersByUser.items.map((item: MyCenterItem) => item.center.id);

  const _handleOnEndReached = () => {
    if (data.listMyCentersByUser.nextToken) {
      fetchMore({
        variables: { nextToken: data.listMyCentersByUser.nextToken },
        updateQuery: (prev: any, { fetchMoreResult }: any) => {
          if (!fetchMoreResult) return prev;
          return Object.assign({}, prev, {
            listMyCentersByUser: {
              items: [...prev.listMyCentersByUser.items, ...fetchMoreResult.listMyCentersByUser.items],
              nextToken: fetchMoreResult.listMyCentersByUser.nextToken,
              __typename: prev.listMyCentersByUser.__typename,
            },
          });
        },
      });
    }
  };

  const _handleRefreshControl = () => {
    setRefreshing(true);
    refetch()
      .then(result => {
        setRefreshing(false);
      })
      .catch(error => {
        reportSentry(error);
        setRefreshing(false);
      });
  };

  return (
    <>
      <FlatList
        data={data.listMyCentersByUser.items}
        keyExtractor={_keyExtractor}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.flatListContainer}
        ListEmptyComponent={<FlatListEmptyResults type="추가한 마이센터가" />}
        ListFooterComponent={
          <FlatListFooter loading={loading} eolMessage="마이센터 리스트의 끝" isEmpty={data.listMyCentersByUser.items.length === 0} />
        }
        keyboardDismissMode="on-drag"
        onEndReached={_handleOnEndReached}
        onEndReachedThreshold={2}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={_handleRefreshControl} />}
      />

      {registerButton(myCentersArray)}
    </>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    registerButtonContainer: {
      // width: '100%',
      marginHorizontal: theme.size.big,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.size.normal,
    },
    listItem: {
      width: '100%',
      marginVertical: theme.size.small,
      borderColor: theme.colors.grey200,
      borderWidth: 1,
    },

    flatListContainer: {
      paddingVertical: theme.size.normal,
      marginHorizontal: theme.size.big,
      // flex: 1,
    },
  });

export default withNavigation(ListMyCenters);
