import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import HeartButton from '../HeartButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import MySubHeadline from '../MySubHeadline';
import { getCountdownTimer } from '../../functions/getScheduleString';
import getTagString from '../../functions/getTagString';
import reportSentry from '../../functions/reportSentry';
import { getTheme } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

interface Props extends NavigationInjectedProps {
  data: any;
  error?: any;
  networkStatus: number;
  now: Date;
  setNeedAuthVisible?: (arg: boolean) => void;
  appearance: AppearanceType;
}

const ClassSoon = ({ navigation, data, error, networkStatus, now, setNeedAuthVisible, appearance }: Props) => {
  if (!data || !data.searchClasss || networkStatus === 1) return null;
  if (error) {
    reportSentry(error);
    return null;
  }

  if (data.searchClasss.items.length === 0) return null;

  const classItem = data.searchClasss.items[0];
  const { id, title, timeStart, host, tagSearchable, regionSearchable } = classItem;

  const countdownTimer = getCountdownTimer(timeStart!, now);
  const tagString = getTagString(tagSearchable);
  const regionString = getTagString(regionSearchable);

  const _handleNavToClass = () => navigation.push('ClassView', { origin: 'Home', classId: id, hostId: host!.id });

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  return (
    <View style={styles.container}>
      <MySubHeadline>구인 마감이 임박한 클래스!</MySubHeadline>
      <TouchableOpacity onPress={_handleNavToClass}>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 0.95, y: 0 }}
          colors={[theme.colors.accent, theme.colors.primary, theme.colors.primary, theme.colors.uiBackground]}
          style={styles.cardContainer}
        >
          <View style={styles.timeContainer}>
            <Text style={styles.timeDescText}>마감 시간까지</Text>
            <Text style={styles.timeText}>{countdownTimer}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.titleText}>
              {title}
            </Text>

            <Text style={styles.tagText} numberOfLines={1} ellipsizeMode="tail">
              <Icon name="tag-multiple" color={theme.colors.text} /> {tagString}
            </Text>
            <Text style={styles.regionText}>@ {regionString}</Text>
          </View>
          <HeartButton item={classItem} setNeedAuthVisible={setNeedAuthVisible} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
      backgroundColor: theme.colors.background,
      marginHorizontal: theme.size.big,
      // marginTop: theme.size.small,
      marginBottom: theme.size.big,
    },
    cardContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.primary,
      borderRadius: 5,
      padding: 10,
    },
    timeContainer: { flexDirection: 'column', alignItems: 'center', marginRight: theme.size.normal },
    timeDescText: { color: theme.colors.background, fontSize: theme.fontSize.small, fontWeight: '600' },
    timeText: { color: theme.colors.background, fontSize: theme.fontSize.normal, fontWeight: '700' },
    infoContainer: { flex: 1, flexDirection: 'column', marginHorizontal: theme.size.xs },
    titleText: {
      color: theme.colors.background,
      fontSize: theme.fontSize.normal,
      fontWeight: '700',
      marginBottom: theme.size.xs,
    },
    tagText: {
      color: theme.colors.background,
      fontSize: theme.fontSize.small,
      fontWeight: '600',
    },
    regionText: {
      color: theme.colors.background,
      fontSize: theme.fontSize.small,
      fontWeight: '600',
      marginTop: theme.size.xs,
    },

    loadingStyle: { marginVertical: theme.size.big },
  });

export default memo(withNavigation(ClassSoon));
