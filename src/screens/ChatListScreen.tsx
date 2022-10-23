import AccessDenied, { AccessDeniedReason, AccessDeniedTarget } from '../components/AccessDenied';
import MySnackbar, { snackbarInitialState, snackbarReducer } from '../components/MySnackbar';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { SafeAreaView, View } from 'react-native';
import WarningDialog, { WarningProps } from '../components/WarningDialog';
import { customOnCreateChatroom1, customOnCreateChatroom2, customSearchConvs } from '../customGraphqls';
import { useStoreDispatch, useStoreState } from '../stores/initStore';

import ChatList from '../components/chat/ChatList';
import ChatNavBar from '../components/chat/ChatNavBar';
import Loading from '../components/Loading';
import { NavigationStackScreenProps } from 'react-navigation-stack';
import NeedAuthBottomSheet from '../components/NeedAuthBottomSheet';
import { SET_AUTHSTORE_STATE } from '../stores/actionTypes';
import StatusBarNormal from '../components/StatusBarNormal';
import cloneDeep from 'lodash/cloneDeep';
import { getSearchChatroomQueryInput } from '../functions/getSearchChatroomQueryInput';
import gql from 'graphql-tag';
import reportSentry from '../functions/reportSentry';
import storeLastChatFocusedTime from '../functions/storeLastChatFocusedTime';
import styles from '../configs/styles';
// import useHandleAndroidBack from '../functions/handleAndroidBack';
import { useQuery } from '@apollo/react-hooks';
import { withNavigationFocus } from 'react-navigation';
import { getStyles } from '../configs/styles';

interface Props extends NavigationStackScreenProps {
  isFocused: boolean;
}

const SEARCH_CONV = gql(customSearchConvs);
const CONV_SUBSCRIPTION1 = gql(customOnCreateChatroom1);
const CONV_SUBSCRIPTION2 = gql(customOnCreateChatroom2);
const ChatListScreen = ({ navigation, isFocused }: Props) => {
  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);
  const [warningProps, setWarningProps] = useState<Partial<WarningProps> | null>(null);
  const {
    authStore: { user, newChats, appState, appearance },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();
  const styles = getStyles(appearance);

  const origin = navigation.getParam('origin');
  const variables = getSearchChatroomQueryInput(!!user && user.username, null, false);

  const { error, data, fetchMore, refetch, subscribeToMore, networkStatus } = useQuery(SEARCH_CONV, {
    variables,
    fetchPolicy: 'cache-and-network',
    skip: !user,
  });

  useEffect(() => {
    let _mounted = true;

    if (isFocused && _mounted && !!user && appState === 'active') {
      if (origin !== 'ChatList') {
        (async function() {
          try {
            await refetch();
          } catch (e) {
            reportSentry(e);
          }
        })();
      }
      if (newChats) {
        storeDispatch({ type: SET_AUTHSTORE_STATE, newChats: [] });
        storeLastChatFocusedTime(user?.username ?? '');
      }
    }

    return () => {
      _mounted = false;
    };
  }, [isFocused, appState]);

  // const _handleBackButton = () => navigation.goBack(null);
  // useHandleAndroidBack(navigation, _handleBackButton);

  const _handleOnDismiss = () => {
    setWarningProps(null);
  };

  const _subs1 = useCallback(() => {
    subscribeToMore({
      document: CONV_SUBSCRIPTION1,
      variables: { convUser1Id: user.username },
      updateQuery: (prev: any, { subscriptionData }: any) => {
        if (!subscriptionData.data) return prev;
        const newConv = subscriptionData.data.onCreateChatroom1;
        const { items, ...others } = prev.searchConvs;
        const hasDuplicate = items.findIndex((item: any) => item.id === newConv.id) >= 0;
        if (!hasDuplicate) {
          const newItems = cloneDeep(items);
          newItems.unshift(newConv);
          const newData = { searchConvs: { items: newItems, ...others } };
          return newData;
        }
      },
    });
  }, [user, subscribeToMore]);

  const _subs2 = useCallback(() => {
    subscribeToMore({
      document: CONV_SUBSCRIPTION2,
      variables: { convUser2Id: user.username },
      updateQuery: (prev: any, { subscriptionData }: any) => {
        if (!subscriptionData.data) return prev;

        const newConv = subscriptionData.data.onCreateChatroom2;
        const { items, ...others } = prev.searchConvs;
        const hasDuplicate = items.findIndex((item: any) => item.id === newConv.id) >= 0;
        if (!hasDuplicate) {
          const newItems = cloneDeep(items);
          newItems.unshift(newConv);
          const newData = { searchConvs: { items: newItems, ...others } };
          return newData;
        }
      },
    });
  }, [user, subscribeToMore]);

  const renderList = () => {
    if (!data || !data.searchConvs) {
      return <Loading origin="ChatListScreen" />;
    }

    if (error) {
      reportSentry(error);
      const retry = () => navigation.navigate('ChatList');
      return <AccessDenied category={AccessDeniedReason.Error} target={AccessDeniedTarget.Error} retry={retry} />;
    }
    return (
      <View
        style={[
          styles.screenMarginHorizontal,
          // styles.containerPaddingBottom,
          styles.flex1,
        ]}
      >
        <ChatList
          // networkStatus={networkStatus}
          type={'ChatList'}
          data={data}
          refetch={refetch}
          initialNumToRender={20}
          snackbarDispatch={snackbarDispatch}
          fetchMore={fetchMore}
          subscribeToMore={subscribeToMore}
          setWarningProps={setWarningProps}
          subscribeToNewConv1={_subs1}
          subscribeToNewConv2={_subs2}
        />
      </View>
    );
  };

  return (
    <>
      <StatusBarNormal appearance={appearance} />
      <SafeAreaView style={styles.contentContainerView}>
        <ChatNavBar />
        {!!user && (
          <View style={styles.flex1}>
            {renderList()}
            <MySnackbar dispatch={snackbarDispatch} snackbarState={snackbarState} />
          </View>
        )}
      </SafeAreaView>

      {warningProps && (
        <WarningDialog
          {...warningProps}
          handleDismiss={_handleOnDismiss}
          visible
          snackbarDispatch={snackbarDispatch}
          navigation={navigation}
          appearance={appearance}
        />
      )}
      <NeedAuthBottomSheet navigation={navigation} isFocused={isFocused} />
    </>
  );
};

export default withNavigationFocus(ChatListScreen);
