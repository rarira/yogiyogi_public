import { Dialog, List, Text } from 'react-native-paper';
import { StyleSheet, TouchableOpacity } from 'react-native';

import KoreanParagraph from '../KoreanParagraph';
import React from 'react';
import { withNavigation } from 'react-navigation';
import MyDialogTitle from '../MyDialogTitle';
import MyDialogContainer from '../MyDialogContainer';
import { getTheme } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

interface Props {
  visible: boolean;
  onConfirm(): void;
  appearance: AppearanceType;
}
const PermissionDialog = ({ visible, onConfirm, appearance }: Props) => {
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  return (
    <MyDialogContainer visible={visible} dismissable={false} style={styles.container}>
      <MyDialogTitle style={styles.titleText}>앱 접근 권한 안내</MyDialogTitle>
      <Dialog.Content>
        <KoreanParagraph
          text="요기요기의 원활한 사용을 위해 아래의 선택적 접근 권한을 허용해 주시기 바랍니다"
          textStyle={styles.descText}
        />

        <List.Item
          title="알림"
          description="앱에서 발송하는 새 구인 클래스 등록 등의 푸시 알림을 받습니다"
          left={props => (
            <List.Icon {...props} icon="notifications-none" style={styles.iconStyle} color={theme.colors.background} />
          )}
          titleStyle={styles.itemTitleText}
          descriptionStyle={styles.itemDescText}
          style={styles.itemContainer}
        />
        <List.Item
          title="위치"
          description="클래스가 이루어지는 센터 정보 지도의 자신의 위치를 출력하기 위해 필요합니다"
          left={props => (
            <List.Icon {...props} icon="my-location" style={styles.iconStyle} color={theme.colors.background} />
          )}
          titleStyle={styles.itemTitleText}
          descriptionStyle={styles.itemDescText}
          style={styles.itemContainer}
        />
        <List.Item
          title="카메라"
          description="사용자 프로필 사진 등록을 위해 사용합니다"
          left={props => (
            <List.Icon {...props} icon="photo-camera" style={styles.iconStyle} color={theme.colors.background} />
          )}
          titleStyle={styles.itemTitleText}
          descriptionStyle={styles.itemDescText}
          style={styles.itemContainer}
        />
        <List.Item
          title="사진 앨범"
          description="사용자 프로필 사진 등록을 위해 사용합니다"
          left={props => (
            <List.Icon {...props} icon="photo-album" style={styles.iconStyle} color={theme.colors.background} />
          )}
          titleStyle={styles.itemTitleText}
          descriptionStyle={styles.itemDescText}
          style={styles.itemContainer}
        />
      </Dialog.Content>
      <TouchableOpacity onPress={onConfirm} style={styles.buttonStyle}>
        <Text style={styles.buttonTextStyle}>확인</Text>
      </TouchableOpacity>
    </MyDialogContainer>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: { borderRadius: 0 },
    titleText: { justifyContent: 'center', color: 'black' },
    descText: { fontSize: theme.fontSize.normal, color: 'black' },
    iconStyle: {
      width: theme.iconSize.xxl,
      height: theme.iconSize.xxl,
      borderRadius: theme.iconSize.xxl / 2,
      backgroundColor: theme.colors.focus,
      alignSelf: 'center',
    },
    buttonStyle: {
      width: '100%',
      backgroundColor: theme.colors.primary,
      flexDirection: 'row',
      justifyContent: 'center',
      paddingVertical: theme.size.normal,
      marginBottom: 0,
    },
    buttonTextStyle: {
      color: theme.colors.background,
      fontWeight: 'bold',
      fontSize: theme.fontSize.big,
    },
    itemContainer: { padding: 0 },
    itemTitleText: { fontSize: theme.fontSize.subheading },
    itemDescText: { fontSize: theme.fontSize.normal },
  });

export default withNavigation(PermissionDialog);
