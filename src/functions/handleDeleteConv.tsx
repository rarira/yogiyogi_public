import { MySnackbarAction, OPEN_SNACKBAR } from '../components/MySnackbar';

import { ConvStatusType } from '../API';
import { DataProxy } from 'apollo-cache';
import { MutationFunction } from '@apollo/react-common';
import { customSearchConvs } from '../customGraphqls';
import gql from 'graphql-tag';
import reportSentry from '../functions/reportSentry';

const SEARCH_CONV = gql(customSearchConvs);

const handleDeleteConv = (
  deleteChatroom: MutationFunction,
  id: string,
  snackbarDispatch: (arg: MySnackbarAction) => void,
  queryInput: any,
  messageInput: any,
  isHost: boolean,
  setChatroomStatus?: (arg: string) => void,
) => () => {
  try {
    deleteChatroom({
      variables: {
        id,
        ...messageInput,
        ...(isHost ? { user1exited: messageInput.notiSenderId } : { user2exited: messageInput.notiSenderId }),
      },
      ...(queryInput && {
        update: (store: DataProxy) => {
          try {
            const queryResult: any = store.readQuery({
              query: SEARCH_CONV,
              variables: queryInput,
            });

            const { items, ...others } = queryResult.searchConvs;
            const newItems = items.filter((item: any) => item.id !== id);
            const newData = { searchConvs: { items: newItems, ...others } };
            store.writeQuery({ query: SEARCH_CONV, variables: queryInput, data: newData });

            // OPTION: 리스트에 남겨둠
            // const newIndex = items.findIndex((item: any) => item.id === id);
            // if (newIndex >= 0) {
            //   const newItems = cloneDeep(items);

            //   // newItems[newIndex].convStatus = 'exited';
            //   // const exitedKey = isHost ? 'user1exited' : 'user2exited';
            //   // newItems[newIndex][exitedKey] = messageInput.notiSenderId;
            //   const newData = { searchConvs: { items: newItems, ...others } };
            //   store.writeQuery({ query: SEARCH_CONV, variables: queryInput, data: newData });
            // }
          } catch (err) {
            console.log(err);
          }
        },
      }),
    });

    if (setChatroomStatus) setChatroomStatus(ConvStatusType.exited);
  } catch (e) {
    reportSentry(e);
    snackbarDispatch({
      type: OPEN_SNACKBAR,
      message: '알림 삭제 실패, 잠시 후 다시 시도하세요',
    });
  }
};

export default handleDeleteConv;
