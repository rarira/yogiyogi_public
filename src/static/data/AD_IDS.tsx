import { Platform } from 'react-native';

export type AdvID = {
  HomeBanner: string;
  ChatListBanner: string;
  ClassViewFull: string;
  SearchResultsBanner: string;
  PostViewBanner: string;
};

const AD_IDS: AdvID = {
  HomeBanner:
    Platform.OS === 'ios' ? 'ca-app-pub-8552496208880824/6049909978' : 'ca-app-pub-8552496208880824/4503187728',
  ChatListBanner:
    Platform.OS === 'ios' ? 'ca-app-pub-8552496208880824/2023035050' : 'ca-app-pub-8552496208880824/6746207682',
  ClassViewFull:
    Platform.OS === 'ios' ? 'ca-app-pub-8552496208880824/6993619699' : 'ca-app-pub-8552496208880824/4920661130',
  SearchResultsBanner:
    Platform.OS === 'ios' ? 'ca-app-pub-8552496208880824/8246991619' : 'ca-app-pub-8552496208880824/2579731963',
  PostViewBanner:
    Platform.OS === 'ios' ? 'ca-app-pub-8552496208880824/9853437898' : 'ca-app-pub-8552496208880824/6340750053',
};

export default AD_IDS;
