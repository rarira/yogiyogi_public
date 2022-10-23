import { List, Modal, Portal } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { memo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TouchableOpacity, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { useStoreDispatch, useStoreState } from '../stores/initStore';

import AntDesign from 'react-native-vector-icons/AntDesign';
import NeedAuthBottomSheet from './NeedAuthBottomSheet';
import { SET_AUTHSTORE_STATE } from '../stores/actionTypes';
import getDimensions from '../functions/getDimensions';
import { AppearanceType } from '../types/store';
import { getTheme } from '../configs/theme';

interface Props extends NavigationInjectedProps {
  // navigation: any;
}

const { IS_IPHONE_X, SCREEN_WIDTH } = getDimensions();

const NewButtonModal = ({ navigation }: Props) => {
  const [needAuthVisible, setNeedAuthVisible] = useState(false);
  const [target, setTarget] = useState<string | null>(null);
  const {
    authStore: { user, isNewButtonTouched, appearance },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const _handleDismissModal = () => {
    // console.log('modal will dismiss');
    storeDispatch({
      type: SET_AUTHSTORE_STATE,
      isNewButtonTouched: false,
    });
  };

  const navState = navigation.dangerouslyGetParent()?.state;
  const mainStack = navState?.routes[0];
  const beforeStack = mainStack?.routes ? mainStack.routes[mainStack.index] : mainStack;
  const nowStack = beforeStack?.routes ? beforeStack.routes[beforeStack.index] : beforeStack;
  const origin = nowStack?.routeName;

  const _handleNavToAddClass = () => {
    _handleDismissModal();
    if (!user) {
      setTarget('AddClass');

      setNeedAuthVisible(true);
    } else {
      navigation.navigate('AddClass', { origin });
    }
  };
  const _handleNavToAddPost = () => {
    _handleDismissModal();

    if (!user) {
      setTarget('AddPost');

      setNeedAuthVisible(true);
    } else {
      navigation.navigate('AddPost', { origin });
    }
  };

  const renderLeft = (icon: string) => (props: any) => (
    <List.Icon {...props} icon={icon} style={styles.leftIcon} color={theme.colors.text} />
  );
  return (
    <Portal>
      {needAuthVisible && (
        <NeedAuthBottomSheet
          setNeedAuthVisible={setNeedAuthVisible}
          navigation={navigation}
          // origin={target!}
          params={{ origin, afterSignedIn: target }}
        />
      )}

      <Modal visible={isNewButtonTouched} onDismiss={_handleDismissModal} contentContainerStyle={styles.container}>
        <TouchableWithoutFeedback onPress={_handleDismissModal}>
          <View style={styles.touchableContainer}>
            <TouchableWithoutFeedback onPress={_handleDismissModal}>
              <View style={styles.bubbleContainer}>
                <View style={[styles.bubbleContents, styles.width]}>
                  {/* <TouchableOpacity onPress={_handleNavToAddClass} style={styles.width}>
                    <List.Item
                      title="구인 클래스 등록"
                      description="구인을 시작합니다"
                      left={renderLeft('person-pin')}
                      // titleStyle={{ color: theme.colors.text }}
                      style={styles.listItem}
                      titleStyle={styles.listItemTitle}
                      descriptionStyle={styles.listItemDescription}
                    />
                  </TouchableOpacity> 

                  <View style={styles.divider} />*/}
                  <TouchableOpacity onPress={_handleNavToAddPost} style={styles.width}>
                    <List.Item
                      title="게시글 작성"
                      description="게시판에 글을 씁니다"
                      left={renderLeft('create')}
                      // titleStyle={{ color: theme.colors.text }}
                      style={styles.listItem}
                      titleStyle={styles.listItemTitle}
                      descriptionStyle={styles.listItemDescription}
                    />
                  </TouchableOpacity>
                </View>
                <AntDesign name="caretleft" color={theme.colors.uiBackground} size={30} style={styles.bubbleArrow} />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </Portal>
  );
};

const getThemedStyles = (theme: any) => {
  const bubbleWidth = Math.min(SCREEN_WIDTH - 3 * theme.size.big, 270);

  return StyleSheet.create({
    container: {
      // borderColor: 'red',
      // borderWidth: 1,
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      marginRight: theme.size.xl,
      // marginBottom: 110,
    },
    touchableContainer: {
      // position: 'absolute',
      // top: 0,
      // left: 0,
      // borderColor: 'red',
      // borderWidth: 1,
      // flex: 1,
      height: '100%',
      // width: '100%',
      // backgroundColor: 'red',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    bubbleContainer: { marginBottom: IS_IPHONE_X ? 85 : 45 },
    width: {
      width: bubbleWidth,
    },
    bubbleContents: {
      // height: 100,
      backgroundColor: theme.colors.uiBackground,
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
      borderBottomLeftRadius: 15,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    bubbleArrow: {
      top: -15,
      right: -15,
      alignSelf: 'flex-end',
    },
    leftIcon: { marginRight: 0, paddingRight: 0 },
    listItem: { width: '100%', padding: 0, margin: 0 },
    listItemTitle: { fontWeight: '600', color: theme.colors.text },
    listItemDescription: { fontWeight: 'normal', color: theme.colors.placeholder },
    divider: {
      height: 1,
      width: bubbleWidth - theme.size.big,
      backgroundColor: theme.colors.backdrop,
      // marginHorizontal: theme.size.big,
      alignSelf: 'center',
    },
  });
};

export default memo(withNavigation(NewButtonModal));
