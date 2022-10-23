import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { getThemeColor } from '../configs/theme';

import { AppearanceType } from '../types/store';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Loading from './Loading';
import { useStoreState } from '../stores/initStore';
import ThemedButton from './ThemedButton';

export enum AccessDeniedReason {
  Error = 'error',
  Null = 'null',
  UserDisabled = 'userDisabled',
  Deleted = 'deleted',
  Blocked = 'blocked',
  UserBlocked = 'userBlocked',
  UserBlockedBy = 'userBlockedBy',
}
interface Props extends NavigationInjectedProps {
  category: AccessDeniedReason;
  target: AccessDeniedTarget;
  extraInfo?: string;
  navigateRoute?: string;
  mutationFunction?: () => {};
  loading?: boolean;
  retry?: () => void;
}

export enum AccessDeniedTarget {
  Class = '클래스',
  Post = '게시물',
  Comment = '댓글',
  User = '사용자',
  Error = '에러',
}

interface AccessDeniedInfo {
  icon: string;
  title: string;
  toWhere: string;
}

const getAccessDeniedInfo: (
  category: AccessDeniedReason,
  target: AccessDeniedTarget,
  extraInfo?: string,
  navigationRoute?: string,
) => AccessDeniedInfo = (category, target, extraInfo, navigationRoute) => {
  let temp: AccessDeniedInfo = { icon: '', title: '', toWhere: '' };
  switch (category) {
    case AccessDeniedReason.Error:
      temp.icon = 'alert-octagon-outline';
      temp.title = '에러 발생. 잠시 후 다시 시도하세요';
      break;
    case AccessDeniedReason.Null:
      temp.icon = 'gauge-empty';
      temp.title = `해당하는 ${target}를 찾을 수 없습니다`;
      break;
    case AccessDeniedReason.Blocked:
      temp.icon = 'block-helper';
      temp.title = `당신이 차단한 ${target}입니다`;
      break;
    case AccessDeniedReason.Deleted:
      temp.icon = 'delete-outline';
      temp.title = `삭제된 ${target}입니다`;
      break;
    case AccessDeniedReason.UserDisabled:
      temp.icon = 'account-remove';
      if (target === AccessDeniedTarget.Class) {
        temp.title = `${target} 호스트가 계정을 삭제하였습니다`;
      }
      if (target === AccessDeniedTarget.User) {
        temp.title = `${target}가 계정을 삭제하였습니다`;
      }
      if (target === AccessDeniedTarget.Post) {
        temp.title = `${target}의 작성자가 계정을 삭제하였습니다`;
      }
      break;
    case AccessDeniedReason.UserBlocked:
      temp.icon = 'account-alert-outline';
      if (target === AccessDeniedTarget.Class) {
        temp.title = `당신이 차단한 사용자(${extraInfo})가 ${target}의 호스트입니다`;
      }
      if (target === AccessDeniedTarget.User) {
        temp.title = `당신이 차단한 사용자(${extraInfo})입니다`;
      }
      if (target === AccessDeniedTarget.Post) {
        temp.title = `당신이 차단한 사용자(${extraInfo})가 작성한 게시물입니다`;
      }
      break;
    case AccessDeniedReason.UserBlockedBy:
      temp.icon = 'content-cut';
      if (target === AccessDeniedTarget.Class) {
        temp.title = `${target}의 호스트가 당신을 차단하였습니다`;
      }
      if (target === AccessDeniedTarget.User) {
        temp.title = `당신은 해당 사용자에 의해 차단되었습니다`;
      }
      if (target === AccessDeniedTarget.Post) {
        temp.title = `${target}의 작성자가 당신을 차단하였습니다`;
      }
      break;
  }
  switch (navigationRoute) {
    case 'Search':
      temp.toWhere = '검색 화면으로';
      break;
    case 'ChatView':
      temp.toWhere = '채팅방으로';
      break;
    case 'ClassView':
      temp.toWhere = '클래스 보기로';
      break;
    case 'ViewReview':
      temp.toWhere = '리뷰 보기로';
      break;
    case 'ClassList':
      temp.toWhere = '클래스 리스트로';
      break;
    case 'ChatList':
      temp.toWhere = '채팅 리스트으로';
      break;
    case 'ClassChatList':
      temp.toWhere = '클래스 채팅 리스트로';
      break;
    case 'MyBlockedList':
      temp.toWhere = '차단 리스트로';
      break;
    case 'My':
      temp.toWhere = '마이 요기요기로';
      break;
    case 'Comm':
      temp.toWhere = '게시물 리스트로';
      break;
    default:
      temp.toWhere = '이전 화면으로';
      break;
  }

  return temp;
};

const getThemedStyles = (appearance: AppearanceType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: getThemeColor('background', appearance),
    },
    text: {
      color: getThemeColor('text', appearance),
    },
  });

const AccessDenied = ({
  category,
  navigation,
  target,
  extraInfo,
  navigateRoute,
  mutationFunction,
  loading,
  retry,
}: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const { icon, title, toWhere } = getAccessDeniedInfo(category, target, extraInfo, navigateRoute);
  const styles = getThemedStyles(appearance);
  const errorColor = getThemeColor('error', appearance);

  const _handleOnPress = () => {
    navigation.navigate(navigateRoute || 'Home');
  };

  useEffect(() => {
    let mounted = true;
    if (mounted && mutationFunction) {
      mutationFunction();
    }
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      {loading || !icon ? (
        <Loading />
      ) : (
        <>
          <Icon name={icon || 'cancel'} color={errorColor} size={60} style={{ marginBottom: 18 }} />
          <Text style={styles.text}>{title || '잘못된 경로로 접근하셨습니다'}</Text>
          {category === AccessDeniedReason.Error && <Text style={styles.text}>{extraInfo}</Text>}
          <Text style={styles.text}>
            {retry ? '재시도 하시거나 ' : ''}아래 버튼을 눌러 {toWhere} 돌아가세요
          </Text>
          <ThemedButton color={errorColor} onPress={_handleOnPress}>
            {toWhere}
          </ThemedButton>
          {retry && (
            <ThemedButton color={errorColor} onPress={retry}>
              재시도
            </ThemedButton>
          )}
        </>
      )}
    </View>
  );
};

export default withNavigation(AccessDenied);
