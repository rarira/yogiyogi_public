import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { memo, useEffect, useState } from 'react';
import { normalize } from '../../configs/theme';

import FastImage from 'react-native-fast-image';
import { HOMEPAGE_URL } from '../../configs/variables';
import { NewsData } from '../../types/store';
import Storage from '@aws-amplify/storage';
import { StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import reportSentry from '../../functions/reportSentry';

interface Props extends NavigationInjectedProps {
  data: NewsData;
}

const EventBanner = ({ data, navigation }: Props) => {
  const [bannerBGSource, setBannerBGSource] = useState<string | null>(null);
  const { newsBanner, newsURL, newsTitle } = data;

  useEffect(() => {
    let _mounted = true;

    if (newsBanner) {
      (async function() {
        try {
          const sourceString = await Storage.get(newsBanner.key);

          if (typeof sourceString === 'string' && _mounted) setBannerBGSource(sourceString);
        } catch (e) {
          reportSentry(e);
        }
      })();
    }

    return () => {
      _mounted = false;
    };
  }, [newsBanner]);

  const _handleURL = () => {
    const url = `${HOMEPAGE_URL}${newsURL!}`;
    navigation.push('WebView', { url, title: newsTitle });
  };

  if (!bannerBGSource) return null;

  return (
    <TouchableOpacity onPress={_handleURL} style={styles.eventBanner}>
      <FastImage
        source={{ uri: bannerBGSource }}
        style={styles.eventBanner}
        // resizeMode={FastImage.resizeMode.stretch}
      />
      {/* <Text>오픈 기념 이벤트...눌러도 뭐 없어</Text> */}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  eventBanner: {
    width: '100%',
    height: normalize(80),
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: theme.colors.blue50,
    borderRadius: 5,
  },
});

export default memo(withNavigation(EventBanner));
