import { CHANGE_ADD_CLASS_STATE, EDIT_FROM_SUMMARY, PREPARE_REPOST_CLASS, PREPARE_UPDATE_CLASS, RESET_CLASS_STATE } from './actionTypes';
import { ClassStoreType, StoreAction } from '../types/store';

import { ClassStatusType } from '../API';

export enum DurationTermEnum {
  longTerm = '장기',
  shortTerm = '단기',
  null = '',
}

export enum ClassListTab {
  on = '구인 중',
  closed = '완료됨',
  off = '취소됨',
  yet = '호스트 리뷰 대기 중',
  reviewed = '호스트 리뷰 완료',
  toBeProxied = '선생님 리뷰 대기 중',
}

export enum ClassSortType {
  timeStartASC = '시작일 빠른 순',
  timeStartDESC = '시작일 늦은 순',
  createdAtDESC = '최근 등록 순',
  classFeeDESC = '수업료 비싼 순',
  numOfClassDESC = '타임 수 많은 순',
}

export interface SearchTerm {
  [key: string]: any;
  durationTerm: DurationTermEnum;
  dateStartTerm: string | null;
  timeStartTerm: string | null;
  regionTerm: string;
  tagTerm: string[];
  feeTerm: number;
}

export interface TermState extends SearchTerm {
  keyword: string;
  termMode: string;
  searchMode: string;
  resultVisible: boolean;
  openOnly: boolean;
  classSort: ClassSortType;
  isFirstHistoryItem: boolean;
}

export interface SearchHistory {
  terms?: SearchTerm;
  keyword?: string;
  searchedAt: number;
  classSort: ClassSortType;
}

export const classInitialState: ClassStoreType = {
  id: '',
  addClassState: 'init',
  title: '',
  dateStart: 0,
  dateEnd: 0,
  dayOfWeek: undefined,
  timeStart: 0,
  timeStartString: '',
  timeEnd: 0,
  timeEndString: '',
  numOfClass: 1,
  classFee: 30000,
  memo: '',
  tags: [],
  originalTags: [],
  center: null,
  summary: false,
  tagSearchable: '',
  regionSearchable: '',
  classStatus: ClassStatusType.open,
  updateMode: false,
  repostMode: false,
  createdAt: '',
  isLongTerm: false,
  // updated: false,
  confirmVisible: false,
  expireType: null,
};

export const classReducer = (state: ClassStoreType, action: StoreAction) => {
  const { type, addClassState, summary, ...otherPayloads } = action;

  switch (type) {
    case CHANGE_ADD_CLASS_STATE:
      return {
        ...state,
        addClassState,
        summary: summary ? summary : false,
        ...otherPayloads,
      };
    case RESET_CLASS_STATE:
      return classInitialState;
    case EDIT_FROM_SUMMARY:
      return {
        ...state,
        addClassState,
        summary: true,
      };
    case PREPARE_UPDATE_CLASS:
      return {
        ...classInitialState,
        updateMode: true,
        addClassState: 'confirmClass',
        summary: true,
        ...otherPayloads,
      };
    case PREPARE_REPOST_CLASS:
      return {
        ...classInitialState,
        repostMode: true,
        addClassState: 'init',
        // summary: true,
        ...otherPayloads,
      };
    default:
      return state;
  }
};
