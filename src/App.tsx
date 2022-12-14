import * as Sentry from '@sentry/react-native';

import {
  Alert,
  View,
  //  ActivityIndicator, Appearance, ColorSchemeName, View, Text
} from 'react-native';
import { BUILD_NUMBER, BUNDLE_ID } from './configs/variables';
import React, { Component, useEffect } from 'react';

import CodePush from 'react-native-code-push';
import { Text } from 'react-native-paper';
import { SENTRY_DSN } from './configs/apiKeys';
import codePush from 'react-native-code-push';
import { enableES5 } from 'immer';
// import { getStyles } from './configs/styles';
// import AsyncStorage from '@react-native-community/async-storage';
// import { getThemeColor } from './configs/theme';
// import Loading from './components/Loading';

enableES5();

// if (!__DEV__) {
//   Sentry.init({
//     dsn: SENTRY_DSN,
//     ignoreErrors: ['No current user', 'not authenticated'],
//     debug: true,
//     beforeSend: e => {
//       if (!e.tags) {
//         e.tags = {};
//       }
//       e.tags['beforeSend'] = 'JS layer';
//       return e;
//     },
//     enableAutoSessionTracking: true,
//     release: `${BUNDLE_ID}@${VERSION}+${BUILD_NUMBER}`,
//     dist: BUILD_NUMBER,
//   });
//   Sentry.setRelease(BUNDLE_ID + '@' + VERSION + '+' + BUILD_NUMBER);
//   Sentry.setDist(BUILD_NUMBER);
// }

// const auth: AuthOptions = {
//   type: AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
//   jwtToken: async () => (await Auth.currentSession()).getIdToken().getJwtToken(),
// };

// const url = awsmobile.aws_appsync_graphqlEndpoint;
// const region = awsmobile.aws_appsync_region;
// const httpLink = createHttpLink({ uri: url });

// const link = ApolloLink.from([createAuthLink({ url, region, auth }), createSubscriptionHandshakeLink(url, httpLink)]);

// const client = new ApolloClient({
//   link,
//   cache: new InMemoryCache(),
// });

// Amplify.configure(awsmobile);
// // AsyncStorage.clear();
// // MyStorage.clear();
// // console.log(AsyncStorage.getAllKeys());
// // AsyncStorage.getAllKeys().then(keys => console.log(keys));
// Auth.configure({
//   storage: MyStorage,
// });
const prefix = /https:\/\/yogiyogi.app.link\/|https:\/\/yogiyogi-test.app.link\/|yoyo:\/\/|yoyotest:\/\//;

let codePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  updateDialog: {
    title: '??? ????????????',
    optionalUpdateMessage: '??????????????? ????????????. ?????????????????????????',
    optionalInstallButtonLabel: '??????',
    optionalIgnoreButtonLabel: '??????',
    mandatoryUpdateMessage: '????????? ???????????? ??? ??????????????? ????????????.',
    mandatoryContinueButtonLabel: '??????',
    appendReleaseDescription: true,
    descriptionPrefix: '??????????????????: ',
  },
  installMode: codePush.InstallMode.IMMEDIATE,
};

const App = () => {
  useEffect(() => {
    let _mounted = true;
    // ImagePicker.clean()
    //   .then(() => {
    //     console.log('removed all tmp images from tmp directory');
    //   })
    //   .catch(e => {
    //     reportSentry(e);
    //   });

    if (_mounted) {
      const checkCodePush = () => {
        codePush.getUpdateMetadata().then(update => {
          if (!!update) {
            Sentry.init({
              dsn: SENTRY_DSN,
              ignoreErrors: ['No current user', 'not authenticated'],
              debug: true,
              beforeSend: e => {
                if (!e.tags) {
                  e.tags = {};
                }
                e.tags['beforeSend'] = 'JS layer';
                return e;
              },
              enableAutoSessionTracking: true,
              release: `${BUNDLE_ID}@${update.appVersion}+codepush:${update.label}`,
              dist: BUILD_NUMBER,
            });
          }
        });

        codePush.disallowRestart();
      };

      // VersionCheck.needUpdate()
      //   .then(async res => {
      //     if (res?.isNeeded) {
      //       Alert.alert(
      //         '???????????? ???????????? ??????',
      //         '??????????????? ????????? ??????????????? ????????????. ?????????????????? ????????? ?????? ????????? ????????? ????????? ??? ????????????.',
      //         [
      //           { text: '???????????? ?????? ??????', onPress: () => Linking.openURL(res.storeUrl) },
      //           {
      //             text: '????????? ?????????',
      //             onPress: () => {
      //               if (!__DEV__) {
      //                 checkCodePush();
      //               }
      //             },
      //             style: 'cancel',
      //           },
      //         ],
      //         { cancelable: false },
      //       );
      //     } else if (!__DEV__) {
      //       checkCodePush();
      //     }
      //   })
      //   .catch(e => reportSentry(e));
    }
    return () => {
      _mounted = false;
    };
  }, []);

  return (
    <View style={{ flex: 1, alignContent: 'center', justifyContent: 'center', alignItems: 'center' }}>
      <Text>????????? ???????????? ???????????????.</Text>
      <Text>??????????????? ?????? ?????? ???????????????.</Text>
      <Text>contact@yogiyogi.kr</Text>
    </View>
  );
  // return (
  //   // <ApolloProvider client={client}>
  //   <StateProvider initialState={rootInitialState} reducer={rootReducer}>
  //     <PaperProvider>
  //       <ActionSheetProvider>
  //         <SafeAreaProvider>
  //           <AppNavigator uriPrefix={prefix} />
  //         </SafeAreaProvider>
  //       </ActionSheetProvider>
  //     </PaperProvider>
  //   </StateProvider>
  //   // </ApolloProvider>
  // );
};

class MyApp extends Component<
  {},
  {
    //  loading: boolean; appearance: ColorSchemeName
  }
> {
  constructor(props: any) {
    super(props);
    // this.state = { loading: false, appearance: Appearance.getColorScheme() };
  }

  codePushStatusDidChange(status: CodePush.SyncStatus) {
    switch (status) {
      case codePush.SyncStatus.DOWNLOADING_PACKAGE:
        Alert.alert('??????????????? ???????????? ????????????. ?????? ???????????????');
        break;
      case codePush.SyncStatus.INSTALLING_UPDATE:
        Alert.alert('???????????? ?????? ????????????. ?????? ???????????????');
        break;
      case codePush.SyncStatus.UPDATE_INSTALLED:
        Alert.alert(
          '??????????????? ?????????????????????',
          `?????? ??????????????????. ?????? "OK"??? ??????????????????`,
          [
            {
              text: 'OK',
              onPress: () => {
                this.setState({ loading: false });
                codePush.allowRestart();
              },
            },
          ],
          { cancelable: false },
        );
        break;
      case codePush.SyncStatus.UP_TO_DATE:
        break;
    }
  }

  render() {
    // const styles = getStyles(this.state.appearance);
    // if (this.state.loading) {
    //   return (
    //     // <View style={[styles.columnCenterContainer, styles.flex1, { backgroundColor: '#341553' }]}>
    //     <Loading
    //       auth
    //       text="???????????? ????????????. ????????? ???????????????"
    //       style={{ backgroundColor: getThemeColor('logoBG', this.state.appearance) }}
    //       color={getThemeColor('text', this.state.appearance)}
    //       textStyle={{ color: getThemeColor('text', this.state.appearance) }}
    //     />
    //     // </View>
    //   );
    // }
    // return <StopServiceScreen />;
    return <App />;
  }
}

export default codePush(codePushOptions)(MyApp);
