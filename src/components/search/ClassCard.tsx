import { NavigationParams, NavigationRoute, NavigationScreenProp, withNavigation } from 'react-navigation';
import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getDateString, getTimeString } from '../../functions/getScheduleString';

import BookmarkButton from '../BookmarkButton';
import { ClassData } from '../../types/apiResults';
import HeartButton from '../HeartButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import getClassStatus from '../../functions/getClassStatus';
import getConvsLength from '../../functions/getConvsLength';
import getTagString from '../../functions/getTagString';
import { getTheme } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

interface Props {
  item: ClassData;
  setNeedAuthVisible?: (arg: boolean) => void;
  navigation: NavigationScreenProp<NavigationRoute<NavigationParams>, NavigationParams>;
  origin?: string;
  appearance: AppearanceType;
}

const ClassCard = ({ item, navigation, setNeedAuthVisible, origin, appearance }: Props) => {
  if (!item) return null;
  const { id, title, tagSearchable, regionSearchable, host, dateStart, timeStart, classStatus, convs } = item;

  const dateStartString = useMemo(() => getDateString(dateStart), [dateStart]);
  const getStatus = useMemo(() => getClassStatus(classStatus, appearance), [classStatus]);
  const timeStartString = useMemo(() => getTimeString(timeStart), [timeStart]);
  const tagString = useMemo(() => {
    if (tagSearchable) {
      return getTagString(tagSearchable);
    } else return null;
  }, [tagSearchable]);
  const regionString = useMemo(() => getTagString(regionSearchable), [regionSearchable]);
  const numOfConvs = useMemo(() => {
    if (convs) {
      return getConvsLength(convs);
    } else return null;
  }, [convs]);

  const _handleOnPress = () => navigation.navigate('ClassView', { classId: id, hostId: host.id, origin });

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.cardWrapper}
        onPress={_handleOnPress}
        // onLayout={_handleOnLayout}
      >
        <View style={styles.cardLeft}>
          <Text style={styles.cardInfoText}>{dateStartString.slice(0, 4)}</Text>
          <Text style={styles.cardLeftText}>{dateStartString.slice(-5)}</Text>
          <Text style={styles.cardInfoText}>{timeStartString}</Text>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitleText} numberOfLines={1} ellipsizeMode="tail">
              {title}
            </Text>
          </View>
          {tagSearchable && (
            <View style={styles.cardSubtitleRow}>
              <Text style={styles.cardSubtitleText}>
                <Icon name="tag-multiple" color={theme.colors.text} /> {tagString}
              </Text>
            </View>
          )}
          <View style={[styles.cardInfoRow, { ...(origin === 'Heart' && { marginBottom: 0 }) }]}>
            <Text style={styles.cardInfoText}>{regionString}</Text>
          </View>
          {convs && (
            <View style={styles.cardStatusRow}>
              <Text style={[styles.cardStatusText, { color: getStatus?.color }]}>{getStatus.text}</Text>
              <Text style={styles.cardInfoText}>
                <Icon name="message-text-outline" color={theme.colors.text} /> {numOfConvs}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.bookmarkButtonContainer}>
          {origin === 'Search' || origin === 'Heart' ? (
            <HeartButton item={item} setNeedAuthVisible={setNeedAuthVisible} />
          ) : (
            <BookmarkButton setNeedAuthVisible={setNeedAuthVisible} classId={id} />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'column',
      marginHorizontal: theme.size.big,
      borderColor: theme.colors.borderColor,
      borderWidth: StyleSheet.hairlineWidth,
      padding: 10,
      borderRadius: 8,
      backgroundColor: theme.colors.cardBackground,
    },
    cardWrapper: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    cardLeft: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardLeftText: {
      fontSize: theme.fontSize.normal,
      color: theme.colors.text,
    },
    cardBody: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-start',
      marginHorizontal: theme.size.normal,
    },
    cardInfoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.size.xs,
    },
    cardStatusRow: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
    cardInfoText: {
      color: theme.colors.backdrop,
      fontSize: theme.fontSize.small,
    },
    cardStatusText: {
      fontSize: theme.fontSize.small,
      fontWeight: '600',
      marginRight: theme.size.small,
    },
    cardTitleRow: {
      flexDirection: 'row',
      marginBottom: theme.size.xs,
    },
    cardTitleText: {
      color: theme.colors.text,
      fontSize: theme.fontSize.normal,
    },
    cardSubtitleRow: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginBottom: theme.size.xs,
    },
    cardSubtitleText: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      color: theme.colors.backdrop,
      fontSize: theme.fontSize.small,
    },
    bookmarkButtonContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      // paddingRight: theme.size.normal,
    },
  });

export default memo(withNavigation(ClassCard));
