import { AccountStatusType, ConvStatusType } from '../../API';
import { ChatroomState, SET_CHATROOM_STATE } from '../../functions/useChatroomState';
import { MySnackbarAction, OPEN_SNACKBAR } from '../MySnackbar';
import { NavigationFocusInjectedProps, withNavigationFocus } from 'react-navigation';
import React, { memo, useEffect } from 'react';
import {
  customCreateChatroom,
  customCreateMessage,
  customListMessages,
  customOnCreateMessage,
  customOnDeleteChatroom,
  customUpdateConv,
} from '../../customGraphqls';
import { useMutation, useQuery, useSubscription } from '@apollo/react-hooks';

import { CHAT_WILL_EXPIRE_IN_MONTH } from '../../configs/variables';
import ChatMessageList from './ChatMessageList';
import Loading from '../Loading';
import addMonths from 'date-fns/add_months';
import format from 'date-fns/format';
import gql from 'graphql-tag';
import parse from 'date-fns/parse';
import produce from 'immer';
import reportSentry from '../../functions/reportSentry';
import { useStoreState } from '../../stores/initStore';

interface Props extends NavigationFocusInjectedProps {
  convId: string;
  hostId: string;
  classId: string;
  isHost: boolean;
  profileName: string;
  identityId: string;
  chatroomState: ChatroomState;
  chatroomDispatch: (arg: any) => void;
  snackbarDispatch: (arg: MySnackbarAction) => void;
}

const LIST_MESSAGES = gql(customListMessages);
const CREATE_MESSAGE = gql(customCreateMessage);
const MESSAGE_SUBSCRIPTION = gql(customOnCreateMessage);

const DELETE_CHATROOM_SUBSCRIPTION = gql(customOnDeleteChatroom);

const CREATE_CONV = gql(customCreateChatroom);
const UDPATE_CONV = gql(customUpdateConv);

const ChatBody = ({
  convId,
  hostId,
  classId,
  isHost,
  profileName,
  identityId,
  chatroomState,
  chatroomDispatch,
  snackbarDispatch,
  isFocused,
}: Props) => {
  const {
    authStore: { appState },
  } = useStoreState();
  const {
    chatroomStatus,
    partner,
    // partnerState,
    user1exited,
    user2exited,
  } = chatroomState;
  const [createConv] = useMutation(CREATE_CONV);
  const [createMessage] = useMutation(CREATE_MESSAGE);
  const [updateConv] = useMutation(UDPATE_CONV);

  const queryInput = { notiConvId: convId, limit: 30 };
  const { data: listMessagesData, fetchMore, refetch, networkStatus } = useQuery(LIST_MESSAGES, {
    variables: queryInput,
    fetchPolicy: 'cache-and-network',
    // pollInterval: 500,
  });

  useEffect(() => {
    let _mounted = true;

    if (appState === 'active' && _mounted && isFocused) {
      if (refetch) {
        (async function() {
          try {
            await refetch();
          } catch (e) {
            reportSentry(e);
          }
        })();
      }
    }
    return () => {
      _mounted = false;
    };
  }, [appState, isFocused, refetch]);

  const msUnsubscribe = useSubscription(MESSAGE_SUBSCRIPTION, {
    variables: { notiConvId: convId },

    onSubscriptionData: options => {
      try {
        const { onCreateMessage } = options.subscriptionData.data;
        const queryResult: any = options.client.readQuery({
          query: LIST_MESSAGES,
          variables: queryInput,
        });

        const { items, ...others } = queryResult.listMessages;
        if (!items[0] || items[0].id !== onCreateMessage.id) {
          // console.log('subscription data fetches new message: ', onCreateMessage);

          const nextItems = produce(items, (draft: any) => {
            draft.unshift(onCreateMessage);
          });

          const newData = { listMessages: { items: nextItems, ...others } };
          options.client.writeQuery({ query: LIST_MESSAGES, variables: queryInput, data: newData });
        }
      } catch (e) {
        reportSentry(e);
      }
    },
  });

  const dcsUnsubscribe = useSubscription(DELETE_CHATROOM_SUBSCRIPTION, {
    variables: { id: convId },

    onSubscriptionData: options => {
      try {
        const { convStatus, user1exited, user2exited, messages } = options.subscriptionData.data.onDeleteChatroom;

        chatroomDispatch({
          type: SET_CHATROOM_STATE,
          chatroomStatus: convStatus,
          user1exited,
          user2exited,
        });

        const queryResult: any = options.client.readQuery({
          query: LIST_MESSAGES,
          variables: queryInput,
        });

        const { items, ...others } = queryResult.listMessages;
        const newMessage = messages.items[0];

        let newItems;

        if (items.length === 0) {
          newItems = items.concat([newMessage]);
        } else if (items[0].id !== newMessage.id) {
          newItems = produce(items, (draft: any) => {
            draft.unshift(newMessage);
          });
        }
        const newData = { listMessages: { items: newItems, ...others } };
        options.client.writeQuery({ query: LIST_MESSAGES, variables: queryInput, data: newData });
      } catch (e) {
        reportSentry(e);
      }
    },
  });

  const _handleFetchMore = () => {
    fetchMore({
      variables: { nextToken: listMessagesData.listMessages.nextToken },
      updateQuery: (prev: any, { fetchMoreResult }: any) => {
        if (!prev) return null;
        if (!fetchMoreResult) {
          // console.log('no result');
          return prev;
        }
        if (fetchMoreResult.listMessages.nextToken === prev.listMessages.nextToken) {
          // console.log('same token;');
          return prev;
        }
        return Object.assign({}, prev, {
          listMessages: {
            items: [...prev.listMessages.items, ...fetchMoreResult.listMessages.items],
            nextToken: fetchMoreResult.listMessages.nextToken,
            __typename: prev.listMessages.__typename,
          },
        });
      },
    });
  };

  const _onSend = async (message: any) => {
    const { id, content, createdAt, sender } = message;
    const notiInput = {
      id,
      notiConvId: convId,
      content,
      createdAt,
      expiresAt: Number(format(addMonths(parse(createdAt), CHAT_WILL_EXPIRE_IN_MONTH), 'X')),
      notiSenderId: sender.id,
      senderName: profileName,
      notiReceiverId: partner!.id!,
      extraInfo: hostId,
    };

    // console.log('onSend state: ', chatroomState);
    try {
      await createMessage({
        variables: notiInput,
        optimisticResponse: {
          __typename: 'Mutation',
          createMessage: {
            __typename: 'Noti',
            id,
            sender: {
              __typename: 'User',
              id: sender.id,
              name: profileName,
              picture: null,
              oauthPicture: null,
              identityId,
              accountStatus: AccountStatusType.active,
            },
            content,
            extraInfo: hostId,
            createdAt,
            notiType: 'message',
            notiConvId: convId,
            notiSenderId: sender.id,
            notiReceiverId: partner!.id!,
          },
        },
      });

      if (chatroomStatus === 'noChatroom') {
        const convUser2Id = isHost ? partner!.id : sender.id;
        const user1state = null;
        const createConvInput = {
          id: convId,
          convOnClassId: classId,
          convStatus: ConvStatusType.open,
          convUser1Id: hostId,
          convUser2Id,
          user1state,
          user2state: 'focused',
          createdAt,
        };
        await createConv({
          variables: createConvInput,
        });

        chatroomDispatch({ type: SET_CHATROOM_STATE, chatroomStatus: ConvStatusType.open });
      }
      if (chatroomStatus === 'exited') {
        const amIReinvited = (isHost && user1exited === 'reinvited') || (!isHost && user2exited === 'reinvited');

        const updateConvInput = {
          id: convId,
          ...(amIReinvited && {
            convStatus: ConvStatusType.open,
          }),
          ...(user1exited === partner!.id ? { user1exited: 'reinvited' } : amIReinvited && isHost ? { user1exited: 'rejoined' } : undefined),
          ...(user2exited === partner!.id ? { user2exited: 'reinvited' } : amIReinvited && !isHost ? { user2exited: 'rejoined' } : undefined),
        };
        await updateConv({
          variables: { input: updateConvInput },
        });

        chatroomDispatch({
          type: SET_CHATROOM_STATE,
          ...(amIReinvited && {
            chatroomStatus: ConvStatusType.open,
          }),
          ...(user1exited === partner!.id ? { user1exited: 'reinvited' } : amIReinvited && isHost ? { user1exited: 'rejoined' } : undefined),
          ...(user2exited === partner!.id ? { user2exited: 'reinvited' } : amIReinvited && !isHost ? { user2exited: 'rejoined' } : undefined),
        });
      }
    } catch (e) {
      reportSentry(e);
      snackbarDispatch({ type: OPEN_SNACKBAR, message: e.message });
    }
  };

  if (!listMessagesData) {
    // console.log('chatbody reloads');
    return <Loading origin="ChatBody" />;
  }
  return (
    <ChatMessageList
      data={listMessagesData}
      chatroomStatus={chatroomStatus}
      chatroomDispatch={chatroomDispatch}
      onSend={_onSend}
      handleFetchMore={_handleFetchMore}
      // partnerState={partnerState}
      networkStatus={networkStatus}
      // lastMessageId={
      //   listMessagesData.listMessages.items && listMessagesData.listMessages.items[0]
      //     ? listMessagesData.listMessages.items[0].id
      //     : ''
      // }
      convId={convId}
      partnerId={partner!.id!}
    />
  );
};

export default memo(withNavigationFocus(ChatBody));
