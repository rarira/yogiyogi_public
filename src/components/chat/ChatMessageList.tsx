import { Composer, GiftedChat, GiftedChatProps, IMessage, InputToolbar, LoadEarlier, Send, utils } from 'react-native-gifted-chat';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { call, sendEmail } from '../../functions/dealComm';

import { ConvStatusType } from '../../API';
import CustomBubble from './CustomBubble';
import KoreanParagraph from '../KoreanParagraph';
import Loading from '../Loading';
import { MessageItem } from '../../types/apiResults';
// import UnreadTick from './UnreadTick';
import UserThumbnail from '../UserThumbnail';
import format from 'date-fns/format';
import handleNavToUserProfile from '../../functions/handleNavToUserProfile';
import koLocale from 'date-fns/locale/ko';
import parse from 'date-fns/parse';
import { phoneRegExp } from '../../configs/variables';
import produce from 'immer';
import reportSentry from '../../functions/reportSentry';
import sort from 'js-flock/sort';

import throttle from 'lodash/throttle';
import { useStoreState } from '../../stores/initStore';
import { getTheme, getThemeColor } from '../../configs/theme';

interface Props extends NavigationInjectedProps {
  data: any;
  onSend: any;
  handleFetchMore: () => void;
  // partnerState: string | null;
  chatroomStatus: ConvStatusType | string;
  chatroomDispatch: any;
  convId: string;
  partnerId: string;
  networkStatus: number;
}

const ChatMessageList = ({
  data,
  onSend,
  chatroomStatus,
  handleFetchMore,
  navigation,
  convId,
  partnerId,
  networkStatus,
}: //  partnerState
Props) => {
  const [tempData, setTempData] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const dataLength = tempData.length;
  const {
    authStore: { user, appearance },
  } = useStoreState();

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  useEffect(() => {
    let _mounted = true;
    if (_mounted) {
      if (data.listMessages.items) {
        setTempData(data.listMessages.items);
      }
    }
    return () => {
      _mounted = false;
    };
  }, [data]);

  useEffect(() => {
    let _mounted = true;
    if (_mounted) {
      const _getMessage = (message: MessageItem) => {
        const isMyMessage = user.username === message.sender.id;

        const tempMessage = {
          _id: message.id,
          text: message.content,
          createdAt: parse(message.createdAt),
          user: {
            _id: message.sender.id,
            name: message.sender.name!,
            identityId: message.sender.identityId!,
            avatar: message.sender.picture || message.sender.oauthPicture || null,
          },
          // image: message.image,
          // video: message.video,
          system: false,
        };
        if (isMyMessage && (chatroomStatus === ConvStatusType.open || chatroomStatus === ConvStatusType.exited)) {
          tempMessage.sent = true;
        } else if (isMyMessage && chatroomStatus === 'noChatroom') {
          tempMessage.sent = true;
        }
        if (message && message.extraInfo === 'exit') {
          tempMessage.system = true;
        }

        return tempMessage;
      };

      const _getMessages = (messageItems: MessageItem[]) => {
        const tempMessages = messageItems.map(messageItem => {
          return _getMessage(messageItem);
        });

        return tempMessages;
      };

      if (dataLength !== 0) {
        const tempArray = _getMessages(tempData);
        sort(tempArray).desc((message: IMessage) => message.createdAt);
        if (_mounted) {
          setMessages(tempArray);
        }
      }
    }

    return () => {
      _mounted = false;
    };
  }, [dataLength]);

  const _handleOnSend = async (newMessages: IMessage[]) => {
    try {
      const newMessage = {
        __typename: 'Noti',
        content: newMessages[0].text,
        createdAt: newMessages[0].createdAt.toISOString(),
        extraInfo: partnerId,
        id: newMessages[0]._id,
        notiConvId: convId,
        notiType: 'message',
        sender: {
          accountStatus: 'active',
          id: user.username,
          __typename: 'User',
        },
      };
      const nextTempData = produce(tempData, draft => {
        draft.unshift(newMessage);
        sort(draft).desc((message: IMessage) => message.createdAt);
      });
      await onSend(newMessage);
      setTempData(nextTempData);
    } catch (e) {
      reportSentry(e);
    }
  };

  if (!tempData) {
    return <Loading origin="ChatMessageList" />;
  }

  const renderFooter = useCallback((props: any) => {
    if (props.extraData.networkStatus === 4) {
      // console.log('render Loading');
      return <Loading size="small" origin="ChatMessageList-renderFooter" />;
    }
    return <></>;
  }, []);

  const renderAvatar = useCallback((props: any) => {
    const { _id, identityId, name, avatar } = props!.currentMessage!.user;

    return (
      <View style={styles.avatarContainer}>
        <UserThumbnail
          source={avatar}
          size={36}
          userName={name}
          identityId={identityId}
          noBackground
          noBadge
          onPress={handleNavToUserProfile(navigation, 'ChatView', _id, identityId, name!)}
        />
      </View>
    );
  }, []);

  const renderDay = useCallback((props: any) => {
    const { currentMessage, previousMessage, nextMessage, inverted } = props;

    if (currentMessage && !utils.isSameDay(currentMessage, inverted ? previousMessage! : nextMessage)) {
      return (
        <View style={styles.dayContainer}>
          <Text style={styles.dayText}>{format(currentMessage!.createdAt, 'Mo Do, ddd', { locale: koLocale })}</Text>
        </View>
      );
    }
  }, []);

  const renderSend = useCallback((props: any) => <Send {...props} label="보내기" />, []);
  // const renderActions = useCallback((props: any) => <...props} iconTextStyle={styles.textInputStyle} />, [
  //   appearance,
  // ]);

  const renderSystemMessage = useCallback((props: any) => {
    if (!!props.currentMessage) {
      return <KoreanParagraph text={props.currentMessage.text} paragraphStyle={styles.systemMessageContainer} textStyle={styles.systemMessageText} />;
    }
  }, []);

  const renderLoadEarlier = useCallback(
    (props: any) => (
      <LoadEarlier {...props} label="지난 메시지 불러오기" wrapperStyle={styles.loadEarlierWrapper} textStyle={styles.loadEarlierText} />
    ),
    [],
  );

  const renderBubble = useCallback(
    (props: any) => (
      <CustomBubble
        {...props}
        tickStyle={{
          backgroundColor: 'transparent',
        }}
        wrapperStyle={{
          left: {
            backgroundColor: getThemeColor('nearWhiteBG', appearance),
          },
          right: { backgroundColor: getThemeColor('iosBlue', appearance) },
        }}
        customTextStyle={{ color: getThemeColor('text', appearance) }}
      />
    ),
    [appearance],
  );

  // const renderTicks = useCallback(
  //   (currentMessage: any, extraData: any) => {
  //     const isMyMessage = currentMessage?.user?._id === user.username;
  //     const received =
  //       extraData.partnerState !== null && (extraData.partnerState === 'focused' || extraData.partnerState >= currentMessage.createdAt.toISOString());
  //     console.log('tick', isMyMessage, received, extraData.partnerState);
  //     if (isMyMessage) {
  //       return <View style={styles.tickView}>{!!currentMessage.sent && !received && <UnreadTick appearance={appearance} />}</View>;
  //     }
  //     return null;
  //   },
  //   [user],
  // );

  const renderInputToolbar = useCallback(
    (props: GiftedChatProps) => {
      return <InputToolbar {...props} containerStyle={styles.inputToolbarStyle} />;
    },
    [appearance],
  );

  const renderComposer = useCallback(
    (props: GiftedChatProps) => {
      return <Composer {...props} placeholderTextColor={theme.colors.placeholder} textInputStyle={styles.textInputStyle} />;
    },
    [appearance],
  );

  const _onLoadEarlier = throttle(handleFetchMore, 1000);

  const _user = {
    _id: user.username,
  };

  const _textInputProps = { autoCorrect: false };

  const _extraData = {
    // partnerState,
    networkStatus,
  };

  const _handleUrlPress = (url: string, matchIndex: number) => {
    Linking.openURL(url);
  };

  const _handlePhonePress = (phone: string, matchIndex: number) => {
    call(phone);
  };

  // const _handleNamePress = (name: string, matchIndex: number) => {
  //   Alert.alert(`Hello ${name}`);
  // };

  const _handleEmailPress = (email: string, matchIndex: number) => {
    sendEmail(email, '');
  };

  return (
    // <View style={styles.container}>
    // <KeyboardAvoidingView contentContainerStyle={{ flex: 1, backgroundColor: 'red' }}>
    <GiftedChat
      key={appearance}
      messages={messages}
      onSend={_handleOnSend}
      user={_user}
      renderAvatar={renderAvatar}
      renderAvatarOnTop
      placeholder="메시지를 입력하세요..."
      textInputProps={_textInputProps}
      renderDay={renderDay}
      renderSend={renderSend}
      // renderActions={renderActions}
      renderSystemMessage={renderSystemMessage}
      loadEarlier={data.listMessages.nextToken !== null}
      onLoadEarlier={_onLoadEarlier}
      // keyboardShouldPersistTaps="never"
      renderLoadEarlier={renderLoadEarlier}
      renderFooter={renderFooter}
      renderBubble={renderBubble}
      // renderTicks={renderTicks}
      renderInputToolbar={renderInputToolbar}
      renderComposer={renderComposer}
      extraData={_extraData}
      scrollToBottom={true}
      // isKeyboardInternallyHandled={false}
      // textInputStyle={{ position: 'relative', borderWidth: 1, borderColor: 'red', top: -20 }}
      shouldUpdateMessage={(props, nextProps) => {
        return !(
          // props.extraData.partnerState === nextProps.extraData.partnerState &&
          (props.extraData.networkStatus === nextProps.extraData.networkStatus)
        );
      }}
      parsePatterns={linkStyle => [
        { type: 'url', style: linkStyle, onPress: _handleUrlPress },
        { type: 'phone', style: linkStyle, onPress: _handlePhonePress },
        { pattern: phoneRegExp, style: linkStyle, onPress: _handlePhonePress },
        { type: 'email', style: linkStyle, onPress: _handleEmailPress },
      ]}
    />
    // </KeyboardAvoidingView>
    // </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1 },
    systemMessageContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: theme.size.xl,
      marginVertical: theme.size.small,
    },
    inputToolbarStyle: {
      backgroundColor: theme.colors.background,
    },
    dayContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: theme.size.xl,
      marginVertical: theme.size.small,
    },
    systemMessageText: {
      color: theme.colors.backdrop,
      fontSize: theme.fontSize.small,
    },
    dayText: {
      color: theme.colors.focus,
      fontSize: theme.fontSize.medium,
      fontWeight: '600',
    },
    loadEarlierWrapper: { backgroundColor: theme.colors.primary },
    loadEarlierText: { fontWeight: '700', color: theme.colors.background },
    tickView: {
      flexDirection: 'row',
      marginRight: 10,
    },
    avatarContainer: { width: 36 },
    loading: { marginVertical: theme.size.small },
    textInputStyle: { color: theme.colors.text },
  });

export default memo(withNavigation(ChatMessageList));
