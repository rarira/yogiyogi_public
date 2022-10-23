import { SearchHistory } from './../stores/ClassStore';
import { ClassStatusType, PostCategory, PostStatus, CommentType, CommentStatus, CommentDepth } from '../API';
import { AppStateStatus } from 'react-native';
import { S3Object, UserData } from './apiResults';
import { CognitoUser } from '@aws-amplify/auth';

// Auth Related Types
export interface TPartyUserInfoType {
  id: string;
  email?: string;
  nickName?: string;
  profileImage?: string;
}

export interface AuthInfoType {
  thirdPartyId?: TPartyUserInfoType;
  username?: string;
  email?: string;
  origin?: string;
  handleSubmit?: any;
}

export enum DayType {
  sun = 'sun',
  mon = 'mon',
  tue = 'tue',
  wed = 'wed',
  thu = 'thu',
  fri = 'fri',
  sat = 'sat',
}

export enum NotiType {
  message = 'message',
  genToHost = 'genToHost',
  genToProxy = 'genToProxy',
  genEtc = 'genEtc',
}

// Center Related Types

export interface JSONCenter extends LatLng {
  value: string;
  label: string;
  address?: string;
  homepage?: string;
  tel?: string;
  confirmed?: boolean;
}

export interface CenterNaver {
  title: string;
  address?: string;
  roadAddress?: string;
  telephone?: string;
  mapx?: number;
  mapy?: number;
  link?: string;
}

export interface Center {
  id: string;
  place_name: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  category_name: string;
  x: string;
  y: string;
  place_url: string;
}

export interface MyCenter {
  id: string;
  address: string;
  name: string;
}

export interface MyCenterItem {
  id: string;
  createdAt: string;
  center: MyCenter;
}

export interface Address {
  address: {} | null;
  address_name: string;
  address_type: string;
  road_address: string | null;
  x: string;
  y: string;
}

export interface Tags {
  [key: string]: Tag;
}

export interface LatLng {
  lng?: string;
  lat?: string;
}

export interface NumLatLng {
  lng: number;
  lat: number;
}

export interface ProfileState {
  profilePicture: string | S3Object | null;
  nameError: string;
  urlError: string;
  cellPhoneError: string;
  name: string;
  intro: string;
  resumeURL: string;
  instagramId: string;
  facebookId: string;
  pictureUpdated: boolean;
  cellPhoneNumber: string;
  updated: boolean;
}
// Stores types

export interface Hearts {
  count: number;
  used: boolean;
  [keyword: string]: HeartClassData | number | boolean;
}

export interface Bookmarks {
  count: number;
  used: boolean;
  [keyword: string]: boolean | number;
}

export interface PostSavedObj {
  count: number;
  used: boolean;
  [keyword: string]: string | number | boolean;
}
export interface HeartClassData {
  id: string;
  title: string;
  tagSearchable: string | null;
  regionSearchable: string;
  host: {
    id: string;
  };
  dateStart: number;
  timeStart: number;
  classFee: number;
}

export interface NewsData {
  id: string;
  newsType: string;
  createdAt: string;
  newsStatus: string;
  newsTitle?: string;
  newsURL?: string;
  newsScreen?: string;
  newsBanner?: {
    bucket: string;
    region: string;
    key: string;
  };
  validDate: string;
  extraInfo?: string;
}

export interface IsFirstObject {
  [screenName: string]: boolean;
}

export interface NotiClassData {
  items: NewClassNotiType[];
  lastTime: number;
  // count: number;
}

export interface NotiPostData {
  items: NewPostNotiType[];
  lastTime: number;
  // count: number;
}
export interface AuthStoreType {
  authState: string;
  user: CognitoUser | any | null;
  profileName: string | null;
  identityId: string | null;
  profileUpdated: boolean;
  error?: string;
  message?: string;
  authInfo: AuthInfoType | null;
  bookmark: Bookmarks | null;
  simpleSearchHistory: SearchHistory[] | null;
  detailSearchHistory: SearchHistory[] | null;
  appState: AppStateStatus;
  subscribedTags: string[] | null;
  newClassNotis: NotiClassData | null;
  newPostNotis: NotiPostData | null;
  newGenNotisAvailable: boolean;
  newCommNotisAvailable: boolean;
  newClassNotisAvailable: boolean;
  newPostNotisAvailable: boolean;
  newChats: string[];
  oneSignalTags: { [key: string]: string } | null;
  lastReadClassAt: number | null;
  lastSubscribedTagsUpdated: number | null;
  hearts: Hearts | null;
  heartsUpdated: boolean;
  isFirst: IsFirstObject | {};
  isInternetReachable: boolean;
  isOnBoardingFinished: boolean;
  isNewButtonTouched: boolean;
  readyToServe: boolean;
  postLikes: PostSavedObj | null;
  postBookmark: PostSavedObj | null;
}

export interface NewClassNotiType {
  title: string;
  classId: string;
  hostId: string;
  keywordsMatched: string[] | null;
  region: string;
  isRegionMatched: boolean;
  createdAt: string;
  createdAtEpoch: number;
}
export interface NewPostNotiType {
  postTitle: string;
  postId: string;
  postAuthorId: string;
  keywordsMatched: string[] | null;
  createdAt: string;
  createdAtEpoch: number;
}
export interface GeoStoreType {
  geoState: Boolean;
  lng: number | null;
  lat: number | null;
}

export interface CenterStoreType {
  registerCenterState: string;
  centerSelected: Center | null;
  addressSelected: Address | null;
  // selectedOption: Center | null;
  // centerSubmit: boolean;
  // registerFunc: Function | null;
  // items?: Array<Center>;
  // infoOpen: boolean;
  // mapClicked: boolean;
  // latLng: LatLng;
  // input: Center | null;
  // markerPosition: NumLatLng | null;
  clearSelected?: () => void | null;
  myCenters: Array<MyCenter> | null;
  origin?: string;
}

export enum TagType {
  skill = 'skill',
  etc = 'etc',
  region = 'region',
  target = 'target',
}
export interface Tag {
  id: string;
  index: number;
  type: TagType;
  category1: string;
  category2: string;
  category3: string | null;
  subscriberCounter: number;
  taggedClassCounter: number;
  updatedAt: string;
}

export interface ClassStoreType {
  id: string;
  addClassState: string;
  title: string;
  dateStart: number;
  dateEnd?: number;
  dayOfWeek?: DayType[];
  timeStart: number;
  timeStartString: string;
  timeEnd: number;
  timeEndString: string;
  numOfClass: number;
  classFee: number;
  memo?: string;
  tags: Array<string>;
  originalTags?: string[];
  center: MyCenter | null;
  summary?: boolean;
  tagSearchable: string;
  regionSearchable: string;
  classStatus: ClassStatusType;
  updateMode?: boolean;
  repostMode?: boolean;
  createdAt: string;
  confirmVisible?: boolean;
  isLongTerm: boolean;
}

export interface PostStoreType {
  postId?: string;
  // postCreatedAt?: string;
  postTitle: string;
  postCategory: PostCategory;
  postLink?: string;
  postPictureKeys: Array<string | null>;
  postContent: string;
  postTags: string[];
  thumbnailURL?: string;
  cancelVisible: boolean;
  dialogVisible: boolean;
  updateMode: boolean;
  toRemovePicture: number[];
  postPicture?: S3Object[];
}

export interface CommentStoreType {
  postId?: string;
  postAuthorId?: string;
  postTitle?: string;
  // screenName?: string;
  commentViewAddedToId?: string;
  commentViewAuthorId?: string;
  editComment?: CommentData;
  replyToComment?: CommentData;
  notiCommentId?: string;
  // origin?: string;
  content?: string;
  // receiverId?: string;
  receiverName?: string;
  // prefix?: string;
  // reset?: boolean;
}

export interface PostData {
  id: string;
  postCategory: PostCategory;
  postLink?: string;
  postPicture?: S3Object[];
  postContent: string;
  postTitle: string;
  postStatus: PostStatus;
  thumbnailURL?: string;
  createdAt: string;
  numOfViews: number;
  numOfLikes: number;
  postTags?: string;
  // numOfDislikes: number;
  numOfComments: number;
  author: UserData;
  blockedBy?: string[];
}

export interface PostNumbers {
  numOfComments: number;
  numOfLikes: number;
  // numOfDislikes: number;
  numOfViews: number;
}

export interface CommentData {
  id: string;
  addedToId: string;
  originalId: string;
  createdAt: string;
  commentContent: string;
  commentType: CommentType;
  commentDepth: CommentDepth;
  commentStatus: CommentStatus;
  commentAuthorId: string;
  commentAuthorName: string;
  commentReceiverId: string;
  numOfReported: number;
  numOfLikes: number | null;
  numOfSub: number;
  blockedBy: string[] | null;
  likedUsers: string[] | null;
  author: UserData;
  receiver: UserData;
  latestSubComment: CommentData | null;
  replyInfo: {
    repliedToId: string;
    repliedPostTitle: string;
  };
}

// export interface UpdateCommentInfo {
//   commentId: string | null;
//   contentToEdit: string | null;
//   receiverName?: string | null;
//   fromPostView?: boolean;
// }

export interface StoreAction {
  type: string;
  [key: string]: any;
}

export interface AppState {
  authStore: AuthStoreType;
  postStore: PostStoreType;
  centerStore: CenterStoreType;
  classStore: ClassStoreType;
}
