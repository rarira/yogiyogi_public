import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { memo } from 'react';
import { TouchableOpacity, TouchableWithoutFeedbackProps } from 'react-native';
// import appleAuth, {
//   AppleAuthCredentialState,
//   AppleAuthRequestOperation,
// } from '@invertase/react-native-apple-authentication';
import { useStoreDispatch, useStoreState } from '../stores/initStore';

import Icon from 'react-native-vector-icons/FontAwesome';
import RNKakao from 'rn-kakao-login';
import reportSentry from '../functions/reportSentry';

import userSignOut from '../functions/userSignOut';
import { getTheme } from '../configs/theme';

interface Props extends TouchableWithoutFeedbackProps, NavigationInjectedProps {
  origin: string;
  needLeftMargin?: boolean;
}
const AuthButton = ({ navigation, origin, needLeftMargin, ...rest }: Props) => {
  const {
    authStore: { user, appearance },
  } = useStoreState();
  const theme = getTheme(appearance);
  const storeDispatch = useStoreDispatch();

  const _handleLogOut = async () => {
    if (user!.username!.startsWith('Kakao')) {
      try {
        await RNKakao.logout();
        userSignOut(storeDispatch, navigation);
      } catch (e) {
        reportSentry(e);
      }
    }
    // else if (user!.username!.startsWith('Apple')) {
    //   try {
    //     const appleAuthRequestResponse = await appleAuth.performRequest({
    //       requestedOperation: AppleAuthRequestOperation.LOGOUT,
    //     });
    //     const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);

    //     // use credentialState response to ensure the user credential's have been revoked
    //     if (credentialState === AppleAuthCredentialState.REVOKED) {
    //       userSignOut(storeDispatch, navigation);
    //     }
    //   } catch (e) {
    //     reportSentry(e);
    //   }
    // }
    else {
      userSignOut(storeDispatch, navigation);
    }
  };

  const _handleOnPress = () => {
    if (user) {
      _handleLogOut();
    } else {
      navigation.push('Auth', { origin });
    }
  };
  return (
    <TouchableOpacity
      onPress={_handleOnPress}
      hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }}
      {...rest}
      style={{ marginLeft: needLeftMargin ? theme.size.normal : 0 }}
    >
      {user ? (
        <Icon name="sign-out" color={theme.colors.placeholder} size={theme.iconSize.big} />
      ) : (
        <Icon name="sign-in" color={theme.colors.placeholder} size={theme.iconSize.big} />
      )}
    </TouchableOpacity>
  );
};

export default memo(withNavigation(AuthButton));
