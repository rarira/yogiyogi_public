import {
  ClassStatusType,
  ConvStatusType,
  CenterType,
  ReviewType,
  SatisfactionType,
  AccountStatusType,
  ClassExtraInfoInput,
} from '../API';
import { strict } from 'assert';

export type ClassData = {
  id: string;
  title: string;
  center: CenterData;
  dateStart: number;
  dateEnd: number | null;
  dayOfWeek: string;
  timeStart: number;
  timeStartString: string;
  timeEnd: number;
  timeEndString: string;
  review: ReviewData | null;
  numOfClass: number;
  classFee: number;
  updateCounter: number;
  host: UserData;
  proxy: UserData | null;
  tagSearchable: string | null;
  regionSearchable: string;
  memo: string | null;
  classStatus: ClassStatusType;
  createdAt: string;
  classCenterId: string;
  classProxyId: string | null;
  convs: any;
  hostReview: any | null;
  proxyReview: any | null;
  classHostReviewId: string | null;
  classProxyReviewId: string | null;
  isLongTerm: boolean;
  extraInfo: ClassExtraInfoInput | null;
};

export type ReviewData = {
  id: string;
  content: string;
  type: ReviewType;
  satisfaction: SatisfactionType;
  reviwedClass: ClassData | null;
  reviewsReviewedClassId: string | null;
  reviewer: UserData;
  reviewsReviewerId: string;
  reviewee: UserData;
  reviewsRevieweeId: string;
  createdAt: string;
};

export type CenterData = {
  id: string;
  type: CenterType;
  name: string;
  address: string;
  tel: string | null;
  lng: string;
  lat: string;
  homepage: string | null;
  category: string | null;
  createdAt: string | null;
  classes: { items: ClassData[]; nextToken: string | null };
  myCenterUsers: { items: MyCenterData[]; nextToken: string | null };
};

export type UserData = {
  id: string;
  name: string | null;
  intro: string | null;
  picture: S3Object | null;
  oauthPicture: string | null;
  identityId: string | null;
  email: string | null;
  hosted: { items: ClassData[]; nextToken: string | null };
  proxied: { items: ClassData[]; nextToken: string | null };
  subscribedTags: string[] | null;
  receivedReviews: { items: ReviewData[]; nextToken: string | null };
  resume: string | null;
  myCenter: { items: MyCenterData[]; nextToken: string | null };
  bookmark: string | null;
  simpleSearchHistory: string | null;
  detailSearchHistory: string | null;
  addressTag: string | null;
  accountStatus: AccountStatusType;
  blockedBy: [string] | null;
  blockedUser: [string] | null;
  blockedClass: [string] | null;
  profileUpdated: boolean;
  ratings: Ratings;
};

export type S3Object = {
  bucket: string;
  region: string;
  key: string;
};

export type MyCenterData = {
  id: string;
  center: CenterData;
  user: UserData;
  createdAt: string;
  myCenterUserId: string;
  myCenterCenterId: string;
};

export type ApplicationsData = {
  id: string;
  user: UserData;
  class: ClassData;
  notiId: string;
  createdAt: string;
};

export type ListNotisByReceiverItem = {
  id: string;
  notiType: string;
  // sender: {
  //   id: string;
  //   name: string | null;
  //   picture: string | null;
  //   oauthPicture: string | null;
  //   identityId: string;
  // };
  // notiSenderId: string | null;
  // senderName: string | null;
  // targetType: NotiTargetType | null;
  // targetId: string | null;
  content: string | null;
  extraInfo: string | null;
  createdAt: string;
  // blockedBy: Array<string | null> | null;
  // notiConvId: string | null;
};

export type SearchConvItem = {
  id: string;
  onClass: Partial<ClassData>;
  convStatus: ConvStatusType;
  user1: Partial<UserData>;
  convUser1Id: string;
  user2: Partial<UserData>;
  convUser2Id: string;
  messages: {
    items: Partial<MessageItem>[];
    nextToken: string;
  };
  createdAt: string;
  user1state: string | null;
  user2state: string | null;
  user1exited: string | null;
  user2exited: string | null;
};
export type SearchProxyItem = {
  id: string;
  user2: Partial<UserData>;
  user1: Partial<UserData>;
  convOnClassId: string;
};

export type MessageItem = {
  id: string;
  receiver: Partial<UserData>;
  sender: Partial<UserData>;
  notiSenderId: string;
  extraInfo: string;
  notiConvId: string;
  content: string;
  createdAt: string;
  image: string;
  video: string;
  sent: boolean;
  received: boolean;
};

export type Ratings = {
  completedClassCounter: number;
  hostedClassCounter: number;
  proxiedClassCounter: number;
  cancelledClassCounter: number;
  receivedHostReviewCounter: number;
  satisfiedHostReviewCounter: number;
  receivedProxyReviewCounter: number;
  satisfiedProxyReviewCounter: number;
};
