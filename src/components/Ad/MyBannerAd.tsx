import { BannerAd, BannerAdSize } from '@react-native-firebase/admob';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import theme, { getThemeColor } from '../../configs/theme';

import { AppearanceType } from '../../types/store';
import reportSentry from '../../functions/reportSentry';
import { useStoreState } from '../../stores/initStore';

interface Props {
  advId: string;
  size?: string;
  needMarginBottom?: boolean;
  needMarginTop?: boolean;
  needMarginHorizontal?: boolean;
}

const getThemedStyles = (appearance: AppearanceType) =>
  StyleSheet.create({
    container: {
      // flex: 1,
      backgroundColor: getThemeColor('background', appearance),
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    errorText: {
      fontSize: theme.fontSize.medium,
      color: getThemeColor('disabled', appearance),
      marginVertical: theme.size.big,
    },
  });

const MyBannerAd = ({ advId, size, needMarginBottom, needMarginHorizontal, needMarginTop }: Props) => {
  const [noAdv, setNoAdv] = useState(false);
  const {
    authStore: { appearance },
  } = useStoreState();

  const styles = getThemedStyles(appearance);

  const bannerFlexStyle = {
    // ...(noAdv && { display: 'none' }),
    ...(needMarginBottom && { marginBottom: theme.size.small }),
    ...(needMarginTop && { marginTop: theme.size.normal }),
    ...(needMarginHorizontal && { needMarginHorizontal: theme.size.big }),
  };

  const _handleFailToLoad = (error: any) => {
    if (error.code !== 'admob/no-fill') {
      reportSentry(error);
    }
    setNoAdv(true);
  };

  if (noAdv) return null;

  return (
    <View style={[styles.container, bannerFlexStyle]}>
      {/* {noAdv ? (
        <Text style={styles.errorText}>광고가 출력되는 자리(에러)</Text>
      ) : ( */}
      <BannerAd
        unitId={advId}
        size={size || BannerAdSize.BANNER}
        requestOptions={{
          // requestNonPersonalizedAdsOnly: true,
          testDevices: ['EMULATOR'],
        }}
        onAdFailedToLoad={_handleFailToLoad}
      />
      {/* )} */}
    </View>
  );
};

export default MyBannerAd;
