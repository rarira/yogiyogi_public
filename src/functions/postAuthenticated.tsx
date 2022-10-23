import * as Sentry from '@sentry/react-native';

import { Alert, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { EMAIL_ADDRESS } from '../configs/variables';
import { ONESIGNAL_APP_ID } from '../configs/apiKeys';
import OneSignal from 'react-native-onesignal';
import { USER_AUTHENTICATED } from '../stores/actionTypes';
import asyncForEach from './asyncForEach';
import getUserChat from './getUserChat';
import getUserProfile from '../functions/getUserProfile';
import reportSentry from './reportSentry';
import updateUserIdentityId from './updateUserIdentityId';
import { allPromisesSettled } from './allPromisesSettled';

const postAuthenticated = (user: any, identityId: string, storeDispatch: any, colorScheme?: ColorSchemeName) => {
  if (__DEV__) {
    Sentry.setDist('Debug');
  }
  Sentry.setUser({
    username: user.username,
  });

  OneSignal.init(ONESIGNAL_APP_ID, {
    kOSSettingsKeyAutoPrompt: true,
  });
  OneSignal.inFocusDisplaying(2);

  OneSignal.setExternalUserId(user.username);
  allPromisesSettled([
    getUserProfile(user.username),
    getUserChat(user.username),
    AsyncStorage.getItem(`${user.username}_keywordNotis`),
    AsyncStorage.getItem(`${user.username}_simpleSearchHistory`),
    AsyncStorage.getItem(`${user.username}_detailSearchHistory`),
    AsyncStorage.getItem(`${user.username}_isOnBoardingFinished`),
    AsyncStorage.getItem(`${user.username}_hearts`),
    AsyncStorage.getItem(`${user.username}_postLikes`),
    AsyncStorage.getItem(`${user.username}_isFirst`),
  ])
    .then(
      async ([
        { value: queriedUser },
        { value: userChat },
        { value: newClassNotisString },
        { value: simpleSearchHistoryString },
        { value: detailSearchHistoryString },
        { value: isOnBoardingFinished },
        { value: hearts },
        { value: postLikes },
        { value: isFirst },
      ]) => {
        // console.log(
        //   queriedUser,
        //   userChat,
        //   newClassNotisString,
        //   simpleSearchHistoryString,
        //   detailSearchHistoryString,
        //   isOnBoardingFinished,
        //   hearts,
        //   postLikes,
        //   isFirst,
        // );
        if (!queriedUser.data.getUser?.identityId && queriedUser.data.getUser?.profileUpdated) {
          const idResult = await updateUserIdentityId(user.username, identityId);
        }
        await OneSignal.getTags(async (receivedTags: { [key: string]: string }) => {
          if (receivedTags) {
            await asyncForEach(Object.keys(receivedTags), (tag: string) => OneSignal.deleteTag(tag));
          }
          const oneSignalTags = {
            optIn:
              receivedTags && receivedTags.optIn && receivedTags.optIn === 'false' ? receivedTags.optIn : user.username,
            messageOptIn:
              receivedTags && receivedTags.messageOptIn && receivedTags.messageOptIn === 'false'
                ? receivedTags.messageOptIn
                : user.username,
            reviewOptIn:
              receivedTags && receivedTags.reviewOptIn && receivedTags.reviewOptIn === 'false'
                ? receivedTags.reviewOptIn
                : user.username,
            commOptIn:
              receivedTags && receivedTags.commOptIn && receivedTags.commOptIn === 'false'
                ? receivedTags.commOptIn
                : user.username,
          };

          let newSubscribedTags: {
            [key: string]: string;
          } = {};
          let subscribedTags: string[] = queriedUser.data.getUser?.subscribedTags ?? [];
          if (subscribedTags) {
            subscribedTags.forEach(tag => {
              newSubscribedTags[tag] = 'subscribed';
            });
          }

          const newTags = {
            ...oneSignalTags,
            ...newSubscribedTags,
          };

          OneSignal.sendTags(newTags);

          storeDispatch({
            type: USER_AUTHENTICATED,
            user,
            profileName: queriedUser.data.getUser?.name ?? null,
            profileUpdated: Boolean(queriedUser.data.getUser?.profileUpdated),
            bookmark:
              queriedUser.data.getUser && queriedUser.data.getUser.bookmark
                ? JSON.parse(queriedUser.data.getUser.bookmark)
                : {
                    count: 0,
                    used: false,
                  },
            postBookmark:
              queriedUser.data.getUser && queriedUser.data.getUser.postBookmark
                ? JSON.parse(queriedUser.data.getUser.postBookmark)
                : {
                    count: 0,
                    used: false,
                  },
            simpleSearchHistory: simpleSearchHistoryString ? JSON.parse(simpleSearchHistoryString) : [],
            detailSearchHistory: detailSearchHistoryString ? JSON.parse(detailSearchHistoryString) : [],
            isOnBoardingFinished: isOnBoardingFinished === 'true',
            subscribedTags,
            oneSignalTags,
            identityId,
            //TODO: dev
            newClassNotis: newClassNotisString ? JSON.parse(newClassNotisString) : { items: [], lastTime: 0 },
            lastReadClassAt: (queriedUser.data.getUser && queriedUser.data.getUser.lastReadClassAt) ?? null,
            lastSubscribedTagsUpdated:
              (queriedUser.data.getUser && queriedUser.data.getUser.lastSubscribedTagsUpdated) ?? null,
            hearts: hearts !== null ? JSON.parse(hearts) : { count: 0, used: false },
            postLikes: postLikes !== null ? JSON.parse(postLikes) : { count: 0, used: false },
            newChats: userChat,
            isFirst: isFirst ? JSON.parse(isFirst) : {},
            readyToServe: true,
            appearance: colorScheme,
          });
        });
      },
    )
    .catch(e => {
      console.log(e);
      Alert.alert('정상적인 이용이 불가능합니다', `다음 이메일로 연락하세요. ${EMAIL_ADDRESS}`, [], {
        cancelable: false,
      });
      reportSentry(e);
    });
};

export default postAuthenticated;
