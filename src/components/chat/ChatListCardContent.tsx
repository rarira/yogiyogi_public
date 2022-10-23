import React, { memo, useEffect, useMemo } from 'react';
import { SearchConvItem, UserData } from '../../types/apiResults';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import DeleteButton from '../DeleteButton';
import { MySnackbarAction } from '../MySnackbar';
import { NavigationInjectedProps } from 'react-navigation';
import TimeDistance from '../TimeDistance';
import UnreadTick from './UnreadTick';
import UserThumbnail from '../UserThumbnail';
import { WarningProps } from '../WarningDialog';
import { customDeleteChatroom } from '../../customGraphqls';
import getExitroomMessageInput from '../../functions/getExitroomMessageInput';
import { getSearchChatroomQueryInput } from '../../functions/getSearchChatroomQueryInput';
import gql from 'graphql-tag';
import handleDeleteConv from '../../functions/handleDeleteConv';

import throttle from 'lodash/throttle';
import { useMutation } from '@apollo/react-hooks';
import { useStoreState } from '../../stores/initStore';
import { withNavigation } from 'react-navigation';
import { getTheme } from '../../configs/theme';

interface Props extends NavigationInjectedProps {
  chat: SearchConvItem;
  snackbarDispatch: (arg: MySnackbarAction) => void;
  subscribeToNewMessage: any;
  setWarningProps: (arg: Partial<WarningProps> | null) => void;
  type: string;
  classId?: string;
}

const DELETE_CONV = gql(customDeleteChatroom);

const ChatListCardContent = ({
  chat,
  navigation,
  snackbarDispatch,
  subscribeToNewMessage,
  setWarningProps,
  type,
  classId,
}: Props) => {
  const [deleteChatroom, { loading }] = useMutation(DELETE_CONV);
  const { id, messages, onClass, user1, user2 } = chat;

  const {
    authStore: {
      user: { username },
      profileName,
      appState,
      isInternetReachable,
      newChats,
      appearance,
    },
  } = useStoreState();
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const lastMessage = messages.items ? messages.items[0] : null;
  const partner: Partial<UserData> = user1.id === username ? user2 : user1;
  const hostId = user1.id;
  const origin = navigation.getParam('origin');
  const isHost = hostId === username;
  const userState = isHost ? chat.user1state : chat.user2state;
  const unread =
    lastMessage &&
    newChats &&
    (newChats.includes(id) || (userState && lastMessage!.createdAt! > userState) || userState === null) &&
    lastMessage.notiSenderId !== username;

  useEffect(() => {
    if (appState === 'active' && isInternetReachable) {
      subscribeToNewMessage();
    }
  }, [appState, isInternetReachable]);

  const _handleOnPress = () => {
    navigation.push('ChatView', {
      convId: id,
      origin,
      type,
      classId,
      hostId,
    });
  };

  const renderClearButton = useMemo(() => {
    const queryInput =
      type === 'ChatList'
        ? getSearchChatroomQueryInput(username, null, false)
        : getSearchChatroomQueryInput(null, classId!, false);
    const messageInput = getExitroomMessageInput(username, profileName, partner.id!, id);

    const _handleOk = handleDeleteConv(deleteChatroom, id, snackbarDispatch, queryInput, messageInput, isHost);

    const _handleOnPress = () =>
      setWarningProps({
        dialogTitle: '채팅 중단',
        dialogContent:
          '채팅방을 나가시더라도 채팅 내용은 최대 2주간 보존되며, 상대에 의해 재개 가능합니다. 그래도 중단하시겠습니까?',
        okText: '중단합니다',
        dismissText: '취소',
        snackbarDispatch,
        handleOk: throttle(_handleOk, 1000),
      });
    return <DeleteButton handleOnPress={_handleOnPress} exit loading={loading} appearance={appearance} />;
  }, [id]);

  return (
    <View style={styles.cardWrapper}>
      <View style={styles.cardLeft}>
        <UserThumbnail
          source={partner.picture || partner.oauthPicture || null}
          identityId={partner.identityId!}
          size={theme.iconSize.smallThumbnail}
          noBackground
          noBadge
          onPress={_handleOnPress}
        />
      </View>
      <TouchableOpacity onPress={_handleOnPress} style={styles.cardBody}>
        <View style={styles.topRow}>
          <Text style={styles.text}>{partner.name}</Text>
          {lastMessage && <TimeDistance time={lastMessage.createdAt!} />}
        </View>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.timeDistance}>
          클래스 : {onClass.title}
        </Text>

        {lastMessage && (
          <View style={styles.messageRow}>
            {unread && <UnreadTick needMarginRight appearance={appearance} />}
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                styles.lastMessageContent,
                {
                  color: unread ? theme.colors.text : theme.colors.backdrop,
                },
              ]}
            >
              {lastMessage.content}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.chatIcon}>{renderClearButton}</View>
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    cardWrapper: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      // paddingVertical: theme.size.xs,
      marginVertical: theme.size.normal,
    },
    text: {
      color: theme.colors.text,
    },
    cardLeft: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.size.xs,
    },
    cardBody: {
      flex: 3,
      flexDirection: 'column',
      justifyContent: 'flex-start',
      marginHorizontal: theme.size.normal,
    },

    timeDistance: { fontSize: theme.fontSize.small, color: theme.colors.backdrop },
    lastMessageContent: {
      fontSize: theme.fontSize.medium,
      fontWeight: '500',
      marginTop: theme.size.xs,
    },

    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    chatIcon: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: 5,
    },
    messageRow: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' },
  });

export default memo(withNavigation(ChatListCardContent));
