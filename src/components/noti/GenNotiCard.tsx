import { MySnackbarAction, OPEN_SNACKBAR } from '../MySnackbar';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { customDeleteNoti, customListNotisByReceiverKindCreatedAt } from '../../customGraphqls';

import { DataProxy } from 'apollo-cache';
import DeleteButton from '../DeleteButton';
import KoreanParagraph from '../KoreanParagraph';
import { ListNotisByReceiverItem } from '../../types/apiResults';
import { AppearanceType, NotiType } from '../../types/store';
import TimeDistance from '../TimeDistance';
import gql from 'graphql-tag';
import reportSentry from '../../functions/reportSentry';

import throttle from 'lodash/throttle';
import { useMutation } from '@apollo/react-hooks';
import { getTheme } from '../../configs/theme';

interface Props extends NavigationInjectedProps {
  noti: ListNotisByReceiverItem;
  snackbarDispatch: (arg: MySnackbarAction) => void;
  queryInput: any;
  appearance: AppearanceType;
}

const DELETE_NOTI = gql(customDeleteNoti);
const LIST_NOTIS_BY_RECEIVER = gql(customListNotisByReceiverKindCreatedAt);

const GenNotiCard = ({ noti, navigation, snackbarDispatch, queryInput, appearance }: Props) => {
  const { id, notiType, content, createdAt, extraInfo } = noti;
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);
  const _handleOnPress = () => {
    navigation.push('ClassList', {
      type: 'toReview',
      navIndex: notiType === NotiType.genToHost ? 0 : 1,
      origin: 'Noti',
    });
  };

  const _getNotiText = () => {
    switch (notiType) {
      case NotiType.genToHost:
        return `"${content}" 클래스의 구인 기간이 만료되었습니다`;
      case NotiType.genToProxy:
        //TODO: Prod 에서는 그냥 ${content} 로 지정
        return `선생님을 담당한 "${content === '프록시 지정' ? extraInfo : content}" 클래스가 완료되었습니다`;
      default:
        return '내용 미상';
    }
  };

  const _genNotiDesc = () => {
    switch (notiType) {
      case NotiType.genToHost:
        return `클래스 수행을 완료하고 선생님 리뷰를 작성하세요`;
      case NotiType.genToProxy:
        return `호스트 리뷰를 작성하세요`;
      default:
        return '내용 미상';
    }
  };

  const renderClearButton = () => {
    const [deleteNoti, { loading }] = useMutation(DELETE_NOTI);
    const _handleClear = async () => {
      try {
        await deleteNoti({
          variables: { input: { id, createdAt } },
          // refetchQueries: [{ query: LIST_NOTIS_BY_RECEIVER, variables: queryInput }],
          update: (store: DataProxy, { data: { deleteNoti } }) => {
            try {
              const queryResult: any = store.readQuery({ query: LIST_NOTIS_BY_RECEIVER, variables: queryInput });

              const { items, ...others } = queryResult.listNotisByReceiverKindCreatedAt;
              const newItems = items.filter((item: ListNotisByReceiverItem) => {
                return item.id !== deleteNoti.id;
              });

              const newData = { listNotisByReceiverKindCreatedAt: { items: newItems, ...others } };

              store.writeQuery({ query: LIST_NOTIS_BY_RECEIVER, variables: queryInput, data: newData });
            } catch (err) {
              throw err;
            }
          },
        });
      } catch (e) {
        reportSentry(e);
        snackbarDispatch({ type: OPEN_SNACKBAR, message: '알림 삭제 실패, 잠시 후 다시 시도하세요' });
      }
    };

    return <DeleteButton handleOnPress={throttle(_handleClear, 1000)} loading={loading} appearance={appearance} />;
  };

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity onPress={_handleOnPress} style={styles.cardBody}>
        <KoreanParagraph
          text={_getNotiText()}
          textStyle={styles.notiTitleText}
          focusTextStyle={styles.notiTitleClassText}
        />
        <KoreanParagraph text={_genNotiDesc()} textStyle={styles.notiDescText} />
        <TimeDistance time={createdAt} />
      </TouchableOpacity>

      <View style={styles.chatIcon}>{renderClearButton()}</View>
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    cardWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      paddingVertical: theme.size.small,
      paddingLeft: theme.size.small,
      marginBottom: theme.size.small,
    },

    cardBody: {
      flex: 3,
      flexDirection: 'column',
      justifyContent: 'flex-start',
      marginHorizontal: theme.size.xs,
    },

    notiTitleText: {
      color: theme.colors.text,
      fontSize: theme.fontSize.medium,
    },
    notiDescText: {
      color: theme.colors.placeholder,
      fontSize: theme.fontSize.small,
    },
    notiTitleClassText: {
      color: theme.colors.focus,
      fontSize: theme.fontSize.medium,
      fontWeight: '600',
    },
    alignSelfCenter: {
      alignSelf: 'center',
    },

    chatIcon: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: 5,
    },
  });

export default memo(withNavigation(GenNotiCard));
