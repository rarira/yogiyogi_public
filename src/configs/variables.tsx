import DeviceInfo from 'react-native-device-info';
// import { Platform } from 'react-native';
import { ReviewType } from '../API';

export const RATING_SCORE = {
  hostOpenClass: 5,
  hostCompletedClass: 5,
  hostCancelledClass: -10,
  proxyCompletedClass: 10,
  reviewGood: 20,
  reviewBad: -50,
};

export const TOTAL_ADD_CLASS_PAGE = 9;

export const CLASS_VIEW_FULL_AD_POSSIBILITY = 0.05;
export const SEARCH_RESULTS_BANNER_AD_POSSIBILITY = 8;

export const CHAT_WILL_EXPIRE_IN_MONTH = 1;
export const NOTI_WILL_EXPIRE_IN_MONTH = 2;

export const BOOKMARK_LIMIT = 20;
export const POST_BOOKMARK_LIMIT = 50;
export const NEW_CLASS_NOTIS_LIMIT = 200;

export const USER_ID_LENGTH = 10;

export const USER_NAME_LENGTH = 12;

export const END_OF_DAY = 4716639219;
export const END_OF_DAY_ISO = '2119-06-19T17:33:39.000Z';

export const CLASS_TAG_LIMIT = 4;
export const INFO_POST_TAG_LIMIT = 4;
export const USER_TAG_LIMIT = 6;

export const HEARTS_LIMIT = 100;
export const POST_LIKES_LIMIT = 5000;

export const HOMEPAGE_URL = 'https://www.yogiyogi.kr/';

export const KAKAO_SHARE_IMG_URL = 'https://www.yogiyogi.kr/wp-content/uploads/2019/12/kakaoShareIcon.png';

export const TAGS_CREATED_AT = '2019-01-01T00:00:00.000Z';

export const BUNDLE_ID = DeviceInfo.getBundleId();
export const BUILD_NUMBER = DeviceInfo.getBuildNumber();
export const VERSION = DeviceInfo.getVersion();
// Platform.OS === 'ios' ? 'com.rarira.yogiyogitest' : 'com.rarira.yogiyogi.releasestaging';

export const UNIV_LINK_PREFIX = 'https://yogiyogi.app.link/';
export const APP_PREFIX = 'yoyo://';

export const EMAIL_ADDRESS = 'rariradev@gmail.com';

export const MAX_FILES_PER_POST = 5;
export const MAX_COMMENT_LENGTH = 1000;
export const phoneRegExp = /^\d{2,3}-\d{3,4}-\d{4}$/;

export type Manner = {
  id: string;
  text: string;
  type: ReviewType;
};

export const GOOD_MANNERS = [
  { id: 'gm01', text: '시간 약속을 잘 지켜요', type: ReviewType.proxyReview },
  { id: 'gm02', text: '연락이 잘 되요', type: ReviewType.mannerReview },
  { id: 'gm03', text: '클래스 설명이 정확해요', type: ReviewType.hostReview },
  { id: 'gm04', text: '친절하고 매너가 좋아요', type: ReviewType.mannerReview },
  { id: 'gm05', text: '수행한 클래스 내용이 좋아요', type: ReviewType.proxyReview },
  { id: 'gm06', text: '수업료 지급이 빨라요', type: ReviewType.hostReview },
];
export const BAD_MANNERS = [
  {
    id: 'bm01',
    text: '클래스에 늦었어요',
    type: ReviewType.proxyReview,
  },
  {
    id: 'bm02',
    text: '클래스를 펑크냈어요',
    type: ReviewType.proxyReview,
  },
  {
    id: 'bm03',
    text: '급박하게 취소했어요',
    type: ReviewType.mannerReview,
  },
  {
    id: 'bm04',
    text: '연락이 잘 안되요',
    type: ReviewType.mannerReview,
  },
  {
    id: 'bm05',
    text: '클래스 설명이 실제와 달랐어요',
    type: ReviewType.hostReview,
  },
  {
    id: 'bm06',
    text: '불친절하고 매너가 좋지 않아요',
    type: ReviewType.mannerReview,
  },
  {
    id: 'bm07',
    text: '수행한 클래스 내용이 좋지 않아요',
    type: ReviewType.proxyReview,
  },
  {
    id: 'bm08',
    text: '수업료 지급이 늦어요',
    type: ReviewType.hostReview,
  },
];

const getMannersObject = (manners: Manner[]) => {
  let tempObj: { [key: string]: { text: string; type: ReviewType } } = {};

  manners.forEach((manner: Manner) => (tempObj[manner.id] = { text: manner.text, type: manner.type }));
  return tempObj;
};

export const TOTAL_MANNERS = { ...getMannersObject(GOOD_MANNERS), ...getMannersObject(BAD_MANNERS) };
