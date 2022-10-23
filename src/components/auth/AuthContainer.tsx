import { FunctionComponent, ReactElement, memo } from 'react';

import HeadlineSub from '../HeadlineSub';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import MyHeadline from '../MyHeadline';
import React from 'react';
import { View } from 'react-native';

import { normalize } from '../../configs/theme';
import { getCompStyles } from '../../configs/compStyles';
import { useStoreState } from '../../stores/initStore';

interface Props {
  headline?: string;
  subHeadline?: string;
  children: ReactElement;
}

const AuthContainer: FunctionComponent<Props> = ({ children, headline, subHeadline }) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const compStyles = getCompStyles(appearance);
  return (
    <View style={[compStyles.screenMarginHorizontal, compStyles.scrollViewContainer]}>
      {headline && <MyHeadline>{headline}</MyHeadline>}
      {subHeadline && <HeadlineSub text={subHeadline} />}

      <KeyboardAwareScrollView
        alwaysBounceVertical={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={compStyles.flexGrow1}
        scrollEnabled={true}
        extraScrollHeight={normalize(20)}
        nestedScrollEnabled={true}
        enableOnAndroid={true}
      >
        {children}
      </KeyboardAwareScrollView>
    </View>
  );
};

export default memo(AuthContainer);
