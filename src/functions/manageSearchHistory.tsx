import { Dispatch } from 'react';
import { SET_AUTHSTORE_STATE } from '../stores/actionTypes';
import { SearchHistory } from '../stores/ClassStore';
import { produce } from 'immer';
interface Args {
  historyItem: SearchHistory;
  type: string;
  storeDispatch: Dispatch<any>;
  searchHistory: SearchHistory[];
}

// const getSearchHistory = (data: string[] | null | undefined) => {
//   if (data) {
//     const temp: SearchHistory[] = data.map((stringifiedSearchHistory: string) => JSON.parse(stringifiedSearchHistory));
//     return temp;
//   }
//   return data;
// };

const addSearchHistory = async ({ historyItem, type, storeDispatch, searchHistory }: Args) => {
  const nextHistory = produce(searchHistory, (draft: SearchHistory[]) => {
    if (draft.length >= 20) {
      draft.pop();
    }
    draft.unshift(historyItem);
  });

  storeDispatch({ type: SET_AUTHSTORE_STATE, [type]: nextHistory });
};

const removeSearchHistory = async ({ historyItem, type, storeDispatch, searchHistory }: Args) => {
  const nextHistory = searchHistory.filter((history: SearchHistory) => history.searchedAt !== historyItem.searchedAt);

  storeDispatch({ type: SET_AUTHSTORE_STATE, [type]: nextHistory });
};

const resetSearchHistorys = async ({ type, storeDispatch }: Partial<Args>) => {
  const nextHistory: SearchHistory[] = [];

  storeDispatch!({ type: SET_AUTHSTORE_STATE, [type!]: nextHistory });
};

export { addSearchHistory, removeSearchHistory, resetSearchHistorys };
