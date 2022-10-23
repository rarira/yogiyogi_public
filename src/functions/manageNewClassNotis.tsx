import { NewClassNotiType, NotiClassData } from '../types/store';

import { Dispatch } from 'react';
import { NEW_CLASS_NOTIS_LIMIT } from '../configs/variables';
import { SET_AUTHSTORE_STATE } from '../stores/actionTypes';
import { produce } from 'immer';
import reportSentry from './reportSentry';

interface Args {
  item: NewClassNotiType;
  items: NewClassNotiType[];
  storeDispatch: Dispatch<any>;
  newClassNotis: NotiClassData;
}

const getNewClassNotis = (arr: any[], subscribedTags: string[]) => {
  const temp: NewClassNotiType[] = arr.map((result: any) => {
    const keywordArray = result.tagSearchable ? result.tagSearchable.split(',') : [];
    let keywordsMatched: string[] = [];
    let isRegionMatched = false;

    subscribedTags.forEach((tag: string) => {
      if (tag.startsWith('지역') && tag.includes(result.regionSearchable)) {
        isRegionMatched = true;
      } else if (keywordArray.length > keywordsMatched.length && keywordArray.includes(tag)) {
        keywordsMatched.push(tag);
      }
    });

    const newNoti: NewClassNotiType = {
      title: result.title,
      classId: result.id,
      hostId: result.classHostId,
      keywordsMatched,
      region: result.regionSearchable,
      isRegionMatched,
      createdAt: result.firstCreatedAt,
      createdAtEpoch: result.firstCreatedAtEpoch,
    };
    return newNoti;
  });
  return temp;
};

const queryNewClassNotis = async (
  loadingNotis: any,
  subscribedTags: string[] | null,
  newClassNotis: NotiClassData,
  limit: number,
  lastSubscribedTagsUpdated?: number | null,
) => {
  const filterArray = subscribedTags
    ? subscribedTags.map((tag: string) => {
        // PROD: 심플리파이
        if (tag.startsWith('지역'))
          return {
            regionSearchable: { matchPhrase: tag.split('_')[1] },
          };
        return { tagSearchable: { matchPhrase: tag } };
      })
    : [];

  try {
    const timeVariable =
      lastSubscribedTagsUpdated && lastSubscribedTagsUpdated > newClassNotis.lastTime
        ? lastSubscribedTagsUpdated
        : newClassNotis.lastTime;
    const variables = {
      filter: {
        and: [
          {
            firstCreatedAtEpoch: {
              gt: timeVariable,
            },
          },
          { or: filterArray },
        ],
      },
      limit,
      sort: {
        field: 'firstCreatedAtEpoch',
        direction: 'desc',
      },
    };

    loadingNotis({ variables });
  } catch (e) {
    reportSentry(e);
  }
};

const addNewClassNoti = ({ items, storeDispatch, newClassNotis }: Partial<Args>) => {
  const nextNewClassNotis = produce(newClassNotis, (draft: NotiClassData) => {
    const newLength = items!.length;
    const oldLength = draft?.items.length ?? 0;

    if (newLength === NEW_CLASS_NOTIS_LIMIT) {
      draft.items = items!;
    } else if (newLength > NEW_CLASS_NOTIS_LIMIT) {
      draft.items = items!.slice(0, newLength - NEW_CLASS_NOTIS_LIMIT);
    } else if (newLength + oldLength > NEW_CLASS_NOTIS_LIMIT) {
      const overTheLimitNumber = NEW_CLASS_NOTIS_LIMIT - (newLength + oldLength);

      if (items![newLength - 1].createdAtEpoch > draft.items?.[oldLength - 1]?.createdAtEpoch ?? 0) {
        const oldItems = draft.items.slice(0, overTheLimitNumber);
        draft.items = items!.concat(oldItems);
      } else {
        const newItems = items!.slice(0, overTheLimitNumber);
        draft.items = draft.items.concat(newItems!);
      }
    } else {
      if (items![newLength - 1].createdAtEpoch > draft.items?.[oldLength - 1]?.createdAtEpoch ?? 0) {
        draft.items = items!.concat(draft.items);
      } else {
        draft.items = draft.items.concat(items!);
      }
    }
    draft.lastTime = items![0].createdAtEpoch;
  });

  storeDispatch!({
    type: SET_AUTHSTORE_STATE,
    newClassNotis: nextNewClassNotis,
    newClassNotisAvailable: false,
  });

  // console.log(newClassNotis, nextNewClassNotis);
};

const updateNewClassNotiStore = (
  data: any,
  newClassNotis: NotiClassData,
  subscribedTags: string[],
  storeDispatch: Dispatch<any>,
) => {
  // console.log('updateNewClassNotiStore called');
  if (data?.searchClasss?.items.length > 0) {
    if (data.searchClasss.items[data.searchClasss.items.length - 1].firstCreatedAtEpoch > newClassNotis.lastTime) {
      const lastIndex =
        newClassNotis.items.length === 0
          ? 0
          : data.searchClasss.items.findIndex(
              (item: any) => item.id === newClassNotis.items[newClassNotis.items.length - 1].classId,
            );
      const newArray = lastIndex > 0 ? data.searchClasss.items.slice(lastIndex + 1) : data.searchClasss.items;

      if (newArray.length > 0) {
        const temp = getNewClassNotis(newArray, subscribedTags);

        addNewClassNoti({ items: temp, storeDispatch, newClassNotis });
      }
    }
  }
};

const removeNewClassNoti = ({ item, storeDispatch, newClassNotis }: Partial<Args>) => {
  const nowEpoch = Math.round(new Date().getTime() / 1000);
  const nextNewClassNotis = produce(newClassNotis, draft => {
    draft!.items = draft!.items.filter((noti: NewClassNotiType) => item!.classId !== noti.classId);
    // draft!.count = draft!.count - 1;
    draft!.lastTime = nowEpoch;
  });
  // let nextNewClassNotis = newClassNotis.filter((noti: NewClassNotiType) => item.notiId !== noti.notiId);

  storeDispatch!({ type: SET_AUTHSTORE_STATE, newClassNotis: nextNewClassNotis, newClassNotisAvailable: false });
};

const resetNewClassNotis = ({ storeDispatch, newClassNotis }: Partial<Args>) => {
  const nowEpoch = Math.round(new Date().getTime() / 1000);
  // if (newClassNotis!.length > 0) {
  const nextNewClassNotis = produce(newClassNotis, draft => {
    draft!.items = [];
    // draft!.count = 0;
    draft!.lastTime = nowEpoch;
  });

  storeDispatch!({ type: SET_AUTHSTORE_STATE, newClassNotis: nextNewClassNotis, newClassNotisAvailable: false });
  // }
};

const updateNewClassNotisLastTime = ({ storeDispatch, newClassNotis }: Partial<Args>) => {
  // Alert.alert('update', 'will update new class notis last time');

  const nowEpoch = Math.round(new Date().getTime() / 1000);
  const nextNewClassNotis = produce(newClassNotis, draft => {
    draft!.lastTime = nowEpoch;
  });
  storeDispatch!({ type: SET_AUTHSTORE_STATE, newClassNotis: nextNewClassNotis, newClassNotisAvailable: false });
  // }
};

// const updateLastKeywordUpdateTime = async (username: string) => {
//   const nowEpoch = Math.round(new Date().getTime() / 1000);
//   try {
//     await AsyncStorage.setItem(`${username}_lastKeywordUpdateTime`, `${nowEpoch}`);
//   } catch (e) {
//     reportSentry(e);
//   }
// };

// const getLastKeywordUpdateTime = async (username: string) => {
//   try {
//     const result = await AsyncStorage.getItem(`${username}_lastKeywordUpdateTime`);
//     if (result) {
//       return parseInt(result);
//     } else {
//       return 1577804400;
//     }
//   } catch (e) {
//     reportSentry(e);
//   }
// };

export {
  getNewClassNotis,
  queryNewClassNotis,
  addNewClassNoti,
  updateNewClassNotiStore,
  removeNewClassNoti,
  resetNewClassNotis,
  updateNewClassNotisLastTime,
  // updateLastKeywordUpdateTime,
  // getLastKeywordUpdateTime,
};
