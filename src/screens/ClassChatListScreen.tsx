import AccessDenied, { AccessDeniedReason, AccessDeniedTarget } from '../components/AccessDenied';
import MySnackbar, { snackbarInitialState, snackbarReducer } from '../components/MySnackbar';
import React, { useReducer, useState } from 'react';
import { SafeAreaView, View } from 'react-native';
import WarningDialog, { WarningProps } from '../components/WarningDialog';
import { customOnCreateChatroom3, customSearchConvs } from '../customGraphqls';

import BackButton from '../components/BackButton';
import Body from '../components/Body';
import ChatList from '../components/chat/ChatList';
import HeaderTitle from '../components/HeaderTitle';
import Left from '../components/Left';
import Loading from '../components/Loading';
import { NavigationStackScreenProps } from 'react-navigation-stack';
import NeedAuthBottomSheet from '../components/NeedAuthBottomSheet';
import Right from '../components/Right';
import StatusBarNormal from '../components/StatusBarNormal';
import SwitchStackHeader from '../components/SwitchStackHeader';
import { getSearchChatroomQueryInput } from '../functions/getSearchChatroomQueryInput';
import gql from 'graphql-tag';
import reportSentry from '../functions/reportSentry';

import useHandleAndroidBack from '../functions/handleAndroidBack';
import { useQuery } from '@apollo/react-hooks';
import { useStoreState } from '../stores/initStore';
import { getStyles } from '../configs/styles';
import { getThemeColor } from '../configs/theme';

interface Props extends NavigationStackScreenProps {}

const SEARCH_CONV = gql(customSearchConvs);
const CONV_SUBSCRIPTION3 = gql(customOnCreateChatroom3);
const ClassChatListScreen = ({ navigation }: Props) => {
  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);
  const [warningProps, setWarningProps] = useState<Partial<WarningProps> | null>(null);

  const classId = navigation.getParam('classId');
  const origin = navigation.getParam('origin');

  const {
    authStore: { appearance },
  } = useStoreState();

  const styles = getStyles(appearance);

  const variables = getSearchChatroomQueryInput(null, classId, undefined);

  const { error, data, fetchMore, refetch, subscribeToMore, networkStatus } = useQuery(SEARCH_CONV, {
    variables,
    fetchPolicy: 'cache-and-network',
  });
  const _handleBackButton = () => {
    navigation.navigate('ClassView', { classId, origin });
  };

  const _handleOnDismiss = () => {
    setWarningProps(null);
  };

  useHandleAndroidBack(navigation, _handleBackButton);

  const renderHeader = () => {
    return (
      <SwitchStackHeader appearance={appearance} border>
        <Left>
          <BackButton onPress={_handleBackButton} />
        </Left>
        <Body flex={5}>
          <HeaderTitle tintColor={getThemeColor('text', appearance)}>클래스 채팅 리스트</HeaderTitle>
        </Body>
        <Right></Right>
      </SwitchStackHeader>
    );
  };

  const renderList = () => {
    if (!data || !data.searchConvs) {
      return <Loading origin="ClassChatListScreen" />;
    }

    if (error) {
      reportSentry(error);
      return <AccessDenied category={AccessDeniedReason.Error} target={AccessDeniedTarget.Error} />;
    }

    return (
      <View style={[styles.screenMarginHorizontal, styles.containerMarginVertical, styles.flex1]}>
        <ChatList
          networkStatus={networkStatus}
          type={'ClassChatList'}
          data={data}
          refetch={refetch}
          initialNumToRender={20}
          snackbarDispatch={snackbarDispatch}
          fetchMore={fetchMore}
          subscribeToMore={subscribeToMore}
          setWarningProps={setWarningProps}
          subscribeToNewConv3={() => {
            subscribeToMore({
              document: CONV_SUBSCRIPTION3,
              variables: { convOnClassId: classId },
              updateQuery: (prev: any, { subscriptionData }: any) => {
                if (!subscriptionData.data) return prev;
                // console.log('subscribeToNewConv3');

                const newConv = subscriptionData.data.onCreateChatroom1;
                const { items, ...others } = prev.searchConvs;
                const hasDuplicate = items.findIndex((item: any) => item.id === newConv.id) >= 0;
                if (!hasDuplicate) {
                  const newItems = items.concat([newConv]);
                  const newData = { searchConvs: { items: newItems, ...others } };
                  return newData;
                }
              },
            });
          }}
        />
      </View>
    );
  };

  return (
    <>
      <StatusBarNormal appearance={appearance} />
      <SafeAreaView style={styles.contentContainerView}>
        {renderHeader()}

        <View style={styles.flex1}>
          {renderList()}
          <MySnackbar dispatch={snackbarDispatch} snackbarState={snackbarState} />
        </View>
      </SafeAreaView>
      <NeedAuthBottomSheet navigation={navigation} />

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
    </>
  );
};

export default ClassChatListScreen;
