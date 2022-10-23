import API from '@aws-amplify/api';

import AsyncStorage from '@react-native-community/async-storage';
import asyncForEach from './asyncForEach';
import { customListNotisByReceiverKindCreatedAt } from '../customGraphqls';
import reportSentry from '../functions/reportSentry';

const getUserChat = async (userId: string) => {
  try {
    const time = await AsyncStorage.getItem(`${userId}_lastChatFocusedTime`);
    if (!time) {
      return [];
    }
    const result: any = await API.graphql({
      query: customListNotisByReceiverKindCreatedAt,
      variables: {
        notiReceiverId: userId,
        limit: 1,
        notiKindCreatedAt: {
          beginsWith: { notiKind: 'message' },
        },
        filter: { createdAt: { gt: time } },
        sortDirection: 'DESC',
      },
    });

    let convIdArray: string[] = [];

    if (
      result.data.listNotisByReceiverKindCreatedAt.items &&
      result.data.listNotisByReceiverKindCreatedAt.items.length > 0
    ) {
      await asyncForEach(result.data.listNotisByReceiverKindCreatedAt.items, (message: any) => {
        if (message.notiConvId && !convIdArray.includes(message.notiConvId)) {
          convIdArray.push(message.notiConvId);
        }
      });
    }
    return convIdArray;
  } catch (e) {
    reportSentry(e);

    return [];
  }
};

export default getUserChat;
