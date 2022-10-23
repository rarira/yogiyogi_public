import { AdEventType, InterstitialAd } from '@react-native-firebase/admob';

import { CLASS_VIEW_FULL_AD_POSSIBILITY } from '../configs/variables';

const loadFullAds = (advId: string, setInterstitial: (arg: any) => void) => {
  const randomNumber = Math.random();
  if (randomNumber < CLASS_VIEW_FULL_AD_POSSIBILITY) {
    const interstitial = InterstitialAd.createForAdRequest(advId, {
      // requestNonPersonalizedAdsOnly: true,
      testDevices: ['EMULATOR'],
    });

    interstitial.load();
    interstitial.onAdEvent((type: any) => {
      if (type === AdEventType.LOADED) {
        setInterstitial(interstitial);
      }
    });
  } else setInterstitial(null);
};

export default loadFullAds;
