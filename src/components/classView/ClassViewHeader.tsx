import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { memo, useEffect, useState } from 'react';

import AD_IDS from '../../static/data/AD_IDS';
import BackButton from '../BackButton';
import Body from '../Body';
import ClassActionMenuButton from '../ClassActionMenuButton';
import { GetClassQuery } from '../../API';
import HeaderTitle from '../HeaderTitle';
import Left from '../Left';
import ParallaxHeader from '../ParallaxHeader';
import Right from '../Right';
import ShareButton from './ShareButton';
import { WarningProps } from '../WarningDialog';
import { handleClassShare } from './KakaoShare';
import loadFullAds from '../../functions/loadFullAds';
import reportSentry from '../../functions/reportSentry';
import { useActionSheet } from '@expo/react-native-action-sheet';
import useHandleAndroidBack from '../../functions/handleAndroidBack';
import { getThemeColor } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

interface Props extends NavigationInjectedProps {
  item: Partial<GetClassQuery['getClass']>;
  headerVisible: boolean;
  setModalVisible: (arg: boolean) => void;
  setWarningProps: (arg: Partial<WarningProps> | null) => void;
  refetch: any;
  isHost: boolean;
  appearance: AppearanceType;
}
const ClassViewHeader = ({
  navigation,
  item,
  headerVisible,
  setModalVisible,
  setWarningProps,
  refetch,
  isHost,
  appearance,
}: Props) => {
  const [interstitial, setInterstital] = useState<any>(null);
  const { showActionSheetWithOptions } = useActionSheet();

  const origin = navigation.getParam('origin');
  const convId = navigation.getParam('convId');

  const _handleNavBackButton = () => {
    const _navFunction = () => {
      if (origin === 'ChatView') {
        // origin 초기화 해서 넘겨줘야 chatview 에서 백했을 때 순환하지 않음
        const params = convId ? { convId, origin: undefined, type: undefined } : { origin: undefined, type: undefined };
        navigation.navigate(origin, params);
      } else if (origin === 'notification' && navigation.isFirstRouteInParent()) {
        navigation.navigate('Home');
      } else {
        navigation.goBack();
      }
    };

    //check if interstitial add loaded by change, show ad before nav back
    if (interstitial) {
      interstitial
        .show()
        .catch((err: any) => {
          reportSentry(err);
        })
        .finally(_navFunction);
    } else {
      _navFunction();
    }
  };

  useEffect(() => {
    let _mounted = true;
    if (_mounted) {
      //풀배너 광고 불러오기
      loadFullAds(AD_IDS.ClassViewFull, setInterstital);
    }
    return () => {
      _mounted = false;
    };
  }, []);

  useHandleAndroidBack(navigation, _handleNavBackButton);

  return (
    <ParallaxHeader headerVisible={headerVisible} appearance={appearance}>
      <Left>
        <BackButton onPress={_handleNavBackButton} parallaxHeaderVisible={headerVisible} needMarginRight />
      </Left>
      {!headerVisible && (
        <Body flex={2}>
          <HeaderTitle tintColor={getThemeColor('text', appearance)}>{item!.title}</HeaderTitle>
        </Body>
      )}

      <Right>
        <ShareButton
          needMarginRight
          parallaxHeaderVisible={headerVisible}
          handleOnPressShare={handleClassShare(item!, showActionSheetWithOptions, appearance)}
          appearance={appearance}
        />

        <ClassActionMenuButton
          classItem={item}
          setWarningProps={setWarningProps}
          refetch={refetch}
          parallaxHeaderVisible={headerVisible}
          isClassView
          isHost={isHost}
          setModalVisible={setModalVisible}
          origin="ClassView"
        />
      </Right>
    </ParallaxHeader>
  );
};

export default memo(withNavigation(ClassViewHeader));
