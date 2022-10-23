import Rate, { AndroidMarket } from 'react-native-rate';
import React from 'react';

import { List } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { getTheme } from '../../configs/theme';
import { AppearanceType } from '../../types/store';
// import theme from '../../configs/theme';

interface Props {
  appearance: AppearanceType;
}
const StoreRatings = ({ appearance }: Props) => {
  // const [rated, setRated] = useState(false);
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const _handleOnPress = () => {
    const options = {
      AppleAppID: '1463527527',
      GooglePackageName: 'com.rarira.yogiyogi',
      preferredAndroidMarket: AndroidMarket.Google,
      preferInApp: true,
      openAppStoreIfInAppFails: true,
    };
    Rate.rate(options, success => {
      if (success) {
        // this technically only tells us if the user successfully went to the Review Page. Whether they actually did anything, we do not know.
        // setRated(true);
      }
    });
  };

  const renderRightIcon = () => <List.Icon icon="thumb-up" style={styles.listIcon} color={theme.colors.focus} />;

  return (
    <List.Item
      title="요기요기가 마음에 드신다면 리뷰를 남겨 주세요^^"
      style={styles.listItem}
      onPress={_handleOnPress}
      right={renderRightIcon}
      titleStyle={styles.accentListItemTitle}
    />
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    listItem: {
      width: '100%',
      paddingHorizontal: theme.size.medium,
      // marginVertical: theme.size.xs,
    },
    accentListItemTitle: { fontWeight: 'bold', color: theme.colors.accent, fontSize: theme.fontSize.medium },
    listIcon: { margin: 0, alignSelf: 'center', padding: 0 },
  });

export default StoreRatings;
