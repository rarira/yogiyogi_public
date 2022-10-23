import React, { memo, useCallback } from 'react';

import { AccountStatusType } from '../../API';
import ChatListCardContent from './ChatListCardContent';
import { MySnackbarAction } from '../MySnackbar';
import { SearchConvItem } from '../../types/apiResults';
import { WarningProps } from '../WarningDialog';
import cloneDeep from 'lodash/cloneDeep';
import { customOnCreateMessage } from '../../customGraphqls';
import gql from 'graphql-tag';
import { useStoreState } from '../../stores/initStore';

interface Props {
  chat: SearchConvItem;
  snackbarDispatch: (arg: MySnackbarAction) => void;
  subscribeToMore: any;
  setWarningProps: (arg: Partial<WarningProps> | null) => void;
  type: string;
  classId?: string;
}

const MESSAGE_SUBSCRIPTION = gql(customOnCreateMessage);
// const DELETE_CHATROOM_SUBSCRIPTION = gql(customOnDeleteChatroom);

const ChatListCard = ({ chat, snackbarDispatch, subscribeToMore, setWarningProps, type, classId }: Props) => {
  const {
    authStore: {
      user: { username },
    },
  } = useStoreState();
  const partner = chat.user1.id === username ? chat.user2 : chat.user1;

  if (
    partner.accountStatus === AccountStatusType.disabled ||
    (partner.blockedBy && partner.blockedBy.includes(username)) ||
    (partner.blockedUser && partner.blockedUser.includes(username))
  ) {
    return null;
  }

  const _subs = useCallback(() => {
    subscribeToMore({
      document: MESSAGE_SUBSCRIPTION,
      variables: { notiConvId: chat.id },
      updateQuery: (prev: any, { subscriptionData }: any) => {
        if (!subscriptionData.data) return prev;

        // console.log('new message subscribed:', prev, subscriptionData);
        const newMessage = subscriptionData.data.onCreateMessage;
        if (chat.id === newMessage.notiConvId && prev) {
          const { items, ...others } = prev.searchConvs;
          const newItems = cloneDeep(items);
          const newIndex = newItems.findIndex((item: any) => item.id === chat.id);
          if (newIndex >= 0) {
            newItems[newIndex].messages.items[0] = newMessage;
            const newData = { searchConvs: { items: newItems, ...others } };
            return newData;
          }
        }
      },
    });
  }, [chat.id, subscribeToMore]);

  return (
    <ChatListCardContent
      type={type}
      chat={chat}
      classId={classId}
      snackbarDispatch={snackbarDispatch}
      setWarningProps={setWarningProps}
      subscribeToNewMessage={_subs}
    />
  );
};

export default memo(ChatListCard);
