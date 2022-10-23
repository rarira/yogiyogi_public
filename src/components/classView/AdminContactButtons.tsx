import { Linking, StyleSheet, Text, View } from 'react-native';
import React, { memo } from 'react';

import { ClassStatusType } from '../../API';
import { NavigationInjectedProps } from 'react-navigation';
import getClassStatus from '../../functions/getClassStatus';
// import openAdminPostActionSheet from '../../functions/openAdminPostActionSheet';

// import { useActionSheet } from '@expo/react-native-action-sheet';
// import { useStoreState } from '../../stores/initStore';
// // import isURL from 'validator/lib/isURL';
import { withNavigation } from 'react-navigation';
import ThemedButton from '../ThemedButton';
import { getTheme } from '../../configs/theme';
import { AppearanceType } from '../../types/store';
import { useStoreState } from '../../stores/initStore';

interface Props extends NavigationInjectedProps {
  // email?: string;
  // phone?: string;
  classOrigin: string;
  classStatus: ClassStatusType;
  setNeedAuthVisible: (arg: boolean) => void;
  appearance: AppearanceType;
}

const AdminContactButtons = ({
  // email, phone,
  classStatus,
  classOrigin,
  navigation,
  appearance,
  setNeedAuthVisible,
}: Props) => {
  // const { showActionSheetWithOptions } = useActionSheet();

  const {
    authStore: { user },
  } = useStoreState();

  const origin = navigation.getParam('origin');
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  // * 개발용
  // classStatus = ClassStatusType.completed;

  const _handleNavBackButton = () => {
    navigation.navigate(origin || 'Search');
  };

  const renderNavBackButton = (buttonText: string) => (
    <ThemedButton mode="outlined" color={theme.colors.backdrop} onPress={_handleNavBackButton} style={styles.buttonStyle}>
      <Text style={styles.fontSizeNormal}>{buttonText}</Text>
    </ThemedButton>
  );

  // const _handleOpenCommunicationSheet = () => {
  //   if (!user) {
  //     setNeedAuthVisible(true);
  //     return;
  //   } else {
  //     openAdminPostActionSheet({
  //       ...(email && { email }),
  //       ...(phone && { phone }),
  //       showActionSheetWithOptions,
  //     })();
  //   }
  // };

  const _handleOpenBrowser = () => {
    if (!user) {
      setNeedAuthVisible(true);
      return;
    } else {
      Linking.openURL(classOrigin);
    }
  };

  return (
    <View style={styles.container}>
      {classStatus !== ClassStatusType.open ? (
        renderNavBackButton(getClassStatus(classStatus, appearance).text)
      ) : (
        <ThemedButton mode="contained" onPress={_handleOpenBrowser} color={theme.colors.error} style={[styles.buttonStyle]}>
          <Text style={styles.fontSizeNormal}>구인 공고 보러 가기</Text>
        </ThemedButton>
      )}
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.borderColor,
      paddingHorizontal: theme.size.big,
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.background,
    },
    buttonStyle: {
      flex: 1,
      justifyContent: 'flex-end',
      marginTop: theme.size.normal,
      marginBottom: theme.size.normal,
    },
    fontSizeNormal: { fontSize: theme.fontSize.normal, color: theme.colors.text },
    // fontSizeSmall: { fontSize: theme.fontSize.small },
  });

export default memo(withNavigation(AdminContactButtons));
