import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { memo, useEffect, useRef } from 'react';
import theme, { getThemeColor } from '../configs/theme';
import { useStoreDispatch, useStoreState } from '../stores/initStore';

import { AppearanceType } from '../types/store';
import { CHANGE_AUTH_STATE } from '../stores/actionTypes';
import KoreanParagraph from './KoreanParagraph';
import RBSheet from 'react-native-raw-bottom-sheet';
import React from 'react';

interface Props {
  setNeedAuthVisible?: (arg: boolean) => void;
  origin?: string;
  params?: { [key: string]: any };
  whatToDo?: string;
  navigation?: any;
  isFocused?: boolean;
}

const NeedAuthBottomSheet = ({ navigation, setNeedAuthVisible, origin, params, whatToDo, isFocused }: Props) => {
  const {
    authStore: { user, appearance },
  } = useStoreState();
  const styles = getThemedStyles(appearance);
  const storeDispatch = useStoreDispatch();
  const refRBSheet = useRef<RBSheet | null>(null);

  useEffect(() => {
    if (!user && (isFocused === undefined || isFocused)) {
      refRBSheet.current.open();
      storeDispatch({ type: CHANGE_AUTH_STATE, authInfo: { origin: origin || navigation.state.routeName } });
    }
  }, [user, isFocused]);

  // const navState = navigation.dangerouslyGetParent().state;
  // // const mainStack = navState.routes[0];
  // // const beforeStack = mainStack.routes ? mainStack.routes[mainStack.index] : mainStack;
  // // const nowStack = beforeStack.routes ? beforeStack.routes[beforeStack.index] : beforeStack;
  // // const guessedOrigin = nowStack.routeName;
  // console.log(navState);

  // useEffect(() => {
  //   let _mounted = true;
  //   if (_mounted && !!refRBSheet) {

  //   }
  //   return () => {
  //     _mounted = false;
  //   };
  // }, []);

  const _handleDismiss = () => {
    setNeedAuthVisible!(false);
  };

  const _handleNavigateToAuth = () => {
    if (setNeedAuthVisible) setNeedAuthVisible(false);
    refRBSheet.current.close();
    navigation.navigate('Auth', params);
  };

  const _handleBackToHome = () => {
    if (setNeedAuthVisible) {
      setNeedAuthVisible(false);
    }
    refRBSheet.current.close();
    navigation.navigate('Home');
  };

  const dismissable = setNeedAuthVisible !== undefined;

  return (
    <RBSheet
      ref={refRBSheet}
      height={150}
      openDuration={250}
      // closeOnDragDown={true}
      closeOnPressMask={false}
      customStyles={{
        container: {
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}
      // animationType="slide"
      closeOnPressBack={false}
      // onClose={dismissable ? _handleDismiss : _handleBackToHome}
    >
      <SafeAreaView style={styles.container}>
        <KoreanParagraph
          text={`${whatToDo ?? ''}로그인이 필요합니다`}
          textStyle={styles.textStyle}
          paragraphStyle={styles.paragraphStyle}
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={_handleNavigateToAuth}
            style={[styles.button, styles.loginButton]}
            hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }}
          >
            <Text style={styles.loginButtonText}>로그인</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={dismissable ? _handleDismiss : _handleBackToHome}
            style={styles.button}
            hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }}
          >
            <Text style={styles.cancelButtonText}>{dismissable ? '취소' : '홈으로'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </RBSheet>
  );
};

const getThemedStyles = (appearance: AppearanceType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: getThemeColor('uiBackground', appearance),
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    button: {
      paddingHorizontal: theme.size.big,
      paddingVertical: theme.size.normal,
      marginHorizontal: theme.size.normal,
      borderRadius: theme.size.small,
    },
    loginButton: { backgroundColor: getThemeColor('primary', appearance) },
    cancelButtonText: { fontSize: theme.fontSize.normal, color: getThemeColor('error', appearance), fontWeight: '600' },
    loginButtonText: {
      fontSize: theme.fontSize.normal,
      color: getThemeColor('background', appearance),
      fontWeight: 'bold',
    },
    textStyle: { fontSize: theme.fontSize.normal, fontWeight: 'bold', color: getThemeColor('text', appearance) },
    paragraphStyle: { marginBottom: theme.size.big },
  });

export default memo(NeedAuthBottomSheet);
