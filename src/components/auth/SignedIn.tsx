import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { useEffect } from 'react';

import Loading from '../Loading';
import { useStoreState } from '../../stores/initStore';

interface Props extends NavigationInjectedProps {}

const SignedIn = ({ navigation }: Props) => {
  const {
    authStore: { authInfo },
  } = useStoreState();
  const origin = navigation.getParam('origin');
  const afterSignedIn = navigation.getParam('afterSignedIn');

  useEffect(() => {
    if (afterSignedIn) {
      navigation.navigate(afterSignedIn, { origin });
    } else if (origin) {
      navigation.navigate(origin || 'Home');
    } else if (authInfo.origin === 'MySettings') {
      navigation.pop();
    } else {
      navigation.navigate(authInfo.origin || 'Home');
    }
  }, []);

  return <Loading auth={true} text={`이전 화면으로 돌아갑니다. 잠시만 기다리세요`} />;
};

export default withNavigation(SignedIn);
