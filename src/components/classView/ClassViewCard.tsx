import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { Dispatch, memo, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import AdminPostCard from './AdminPostCard';
import BookmarkButton from '../BookmarkButton';
import ClassScheduleCarousel from './ClassScheduleCarousel';
import ClassStatusText from './ClassStatusText';
import ClassViewCardInfoText from './ClassViewCardInfoText';
import ClassViewTags from './ClassViewTags';
import { GetClassQuery } from '../../API';
import HeartButton from '../HeartButton';
import HostCard from './HostCard';
import HostCarousel from './HostCarousel';
import KoreanParagraph from '../KoreanParagraph';
import { StoreAction } from '../../types/store';
import { WarningProps } from '../WarningDialog';
import getConvsLength from '../../functions/getConvsLength';
import getDimensions from '../../functions/getDimensions';
import getTagString from '../../functions/getTagString';
import getUsername from '../../functions/getUsername';
import handleNavToUserProfile from '../../functions/handleNavToUserProfile';
import isURL from 'validator/lib/isURL';
import { useStoreState } from '../../stores/initStore';
import { getTheme } from '../../configs/theme';

interface Props extends NavigationInjectedProps {
  classItem: Partial<GetClassQuery['getClass']>;
  headerVisible: boolean;
  handleCenterClick: () => void;
  handleScheduleClick: () => void;
  isHost: boolean;
  isAdminPost: boolean;
  setWarningProps: (arg: Partial<WarningProps> | null) => void;
  refetch: any;
  storeDispatch: Dispatch<StoreAction>;
  setNeedAuthVisible: (arg: boolean) => void;
  openAdminPostDialog(): void;
}

const { NAV_BAR_HEIGHT } = getDimensions();
const ClassViewCard = ({
  classItem,
  headerVisible,
  handleCenterClick,
  handleScheduleClick,
  isHost,
  isAdminPost,
  setWarningProps,
  refetch,
  storeDispatch,
  navigation,
  setNeedAuthVisible,
  openAdminPostDialog,
}: Props) => {
  const {
    authStore: { user, appearance },
  } = useStoreState();
  const {
    title,
    classStatus,
    host,
    center,
    dateStart,
    dateEnd,
    timeStart,
    timeEnd,
    dayOfWeek,
    tagSearchable,
    regionSearchable,
    convs,
    extraInfo,
  } = classItem!;

  const classScheduleData = {
    dateStart,
    dateEnd,
    timeStart,
    timeEnd,
    dayOfWeek,
  };

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const hostName = getUsername(host!.id, host!.name);
  const regionTagString = useMemo(() => getTagString(regionSearchable), [regionSearchable]);
  const numOfConvs = useMemo(() => getConvsLength(convs!), [convs]);
  const centerInfo = `${isAdminPost ? extraInfo?.centerName ?? '' : center!.name} @ ${regionTagString}`;

  return (
    <View style={[styles.container]}>
      <View style={[styles.backgroundContainer]}>
        <View style={styles.controlRow}>
          <BookmarkButton classId={classItem!.id!} parallaxHeaderVisible={headerVisible} setNeedAuthVisible={setNeedAuthVisible} />
          <HeartButton item={classItem!} parallaxHeaderVisible={headerVisible} setNeedAuthVisible={setNeedAuthVisible} />
        </View>
      </View>
      <View style={styles.mainContainer}>
        <View style={{ height: NAV_BAR_HEIGHT }} />
        <KoreanParagraph text={title!} textStyle={styles.titleText} paragraphStyle={styles.titleContainer} numberOfLines={2} ellipsizeMode="tail" />
        <ClassViewTags tags={tagSearchable} />
        <ClassStatusText classStatus={classStatus!} numOfConvs={numOfConvs} appearance={appearance} />
        {isAdminPost ? (
          <AdminPostCard openAdminPostDialog={openAdminPostDialog} hasURL={isURL(extraInfo?.classOrigin!)} appearance={appearance} />
        ) : isHost ? (
          <HostCard classItem={classItem} setWarningProps={setWarningProps} refetch={refetch} storeDispatch={storeDispatch} />
        ) : (
          <HostCarousel
            hostName={hostName}
            hostSub={host!.identityId!}
            source={host!.oauthPicture || host!.picture}
            xl
            onPress={!!user ? handleNavToUserProfile(navigation, 'ClassView', host!.id, host!.identityId!, host!.name) : undefined}
            hostRatings={host!.ratings}
            headerVisible={headerVisible}
            appearance={appearance}
          />
        )}
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity onPress={handleCenterClick}>
          <ClassViewCardInfoText category="센터" value={centerInfo} appearance={appearance} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleScheduleClick}>
          <ClassScheduleCarousel data={classScheduleData} autoplay appearance={appearance} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-end',
      alignItems: 'center',
      // borderWidth: 1,
      // borderColor: 'blue',
    },
    mainContainer: {
      flex: 3,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: theme.size.normal,
      // borderWidth: 1,
      // borderColor: 'red',
    },
    titleText: {
      color: theme.colors.background,
      fontWeight: '800',
      fontSize: theme.fontSize.subheading,
      alignSelf: 'center',
    },
    titleContainer: { justifyContent: 'center' },
    bottomContainer: {
      // flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      // marginBottom: theme.size.normal,
    },
    backgroundContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      paddingBottom: theme.size.normal,
    },
    controlRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: theme.size.big,
    },
  });

export default memo(withNavigation(ClassViewCard));
