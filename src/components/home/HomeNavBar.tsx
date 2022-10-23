import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import AsyncStorage from '@react-native-community/async-storage';
import AuthButton from '../AuthButton';
import { CHANGE_NEW_NOTIS } from '../../stores/actionTypes';
// import CommunityButton from './CommunityButton';
import MyHeadline from '../MyHeadline';
import MySubsButton from '../noti/MySubsButton';
import { NavigationInjectedProps } from 'react-navigation';
import NotiListButton from './NotiListButton';
import { customListNotisByReceiverKindCreatedAt } from '../../customGraphqls';
import gql from 'graphql-tag';
import reportSentry from '../../functions/reportSentry';

import { useLazyQuery } from '@apollo/react-hooks';
import { withNavigation } from 'react-navigation';
import { getTheme } from '../../configs/theme';

interface Props extends NavigationInjectedProps {
  isFocused: boolean;
}

const LIST_NOTIS_BY_RECEIVER = gql(customListNotisByReceiverKindCreatedAt);

const HomeNavBar = ({ navigation, isFocused }: Props) => {
  const {
    authStore: { user, appearance },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const [loadGenNotis, { data, called }] = useLazyQuery(LIST_NOTIS_BY_RECEIVER, {
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    let _mounted = true;
    const getTime = async () => {
      try {
        const time = await AsyncStorage.getItem(`${user.username}_lastNotiFocusedTime`);
        // if (!time) return;
        const queryInput = {
          notiReceiverId: user.username,
          // limit: 1,
          notiKindCreatedAt: {
            ge: { notiKind: 'nonMessage', createdAt: time },
          },
          sortDirection: 'DESC',
        };
        await loadGenNotis({ variables: queryInput });
      } catch (e) {
        reportSentry(e);
      }
    };

    if (isFocused && user && _mounted) {
      getTime();
    }

    return () => {
      _mounted = false;
    };
  }, [isFocused]);

  useEffect(() => {
    let _mounted = true;
    if (_mounted && called && data && data.listNotisByReceiverKindCreatedAt.items.length > 0) {
      storeDispatch({ type: CHANGE_NEW_NOTIS, newNotis: true });
    }
    return () => {
      _mounted = false;
    };
  }, [data]);

  const _handleNaviToNotiList = () => navigation.push('Noti', { origin: 'Home' });
  // const _handleNaviToCommunity = () => navigation.push('Comm', { origin: 'Home' });

  return (
    <View style={styles.container}>
      <MyHeadline>홈</MyHeadline>
      <View style={styles.buttonContainer}>
        {/* <CommunityButton onPress={_handleNaviToCommunity} needLeftMargin /> */}

        {!!user && (
          <>
            <NotiListButton onPress={_handleNaviToNotiList} needLeftMargin />
            <MySubsButton origin="Home" needLeftMargin appearance={appearance} />
          </>
        )}
        <AuthButton origin="Home" needLeftMargin />
      </View>
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: theme.size.big,
      marginTop: theme.size.small,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
  });

export default withNavigation(HomeNavBar);
