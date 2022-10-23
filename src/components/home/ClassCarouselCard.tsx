import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getTheme, normalize } from '../../configs/theme';

import { ClassData } from '../../types/apiResults';
import ClassScheduleCarousel from '../classView/ClassScheduleCarousel';
import ClassStatusText from '../classView/ClassStatusText';
import ClassViewCardInfoText from '../classView/ClassViewCardInfoText';
import ClassViewTags from '../classView/ClassViewTags';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import KoreanParagraph from '../KoreanParagraph';
import LinearGradient from 'react-native-linear-gradient';
import debounce from 'lodash/debounce';
import getRandomBG from '../../functions/getRandomBG';
import getTagString from '../../functions/getTagString';
import { AppearanceType } from '../../types/store';
import FastImage from 'react-native-fast-image';

const numeral = require('numeral');

interface Props extends NavigationInjectedProps {
  classItem: ClassData;
  isCurrent: boolean;
  // isSmall: boolean;
  itemWidth: number;
  handleLongPress: () => void;
  isHearted: boolean;
  appearance: AppearanceType;
}

const ClassCarouselCard = ({ classItem, isCurrent, navigation, itemWidth, handleLongPress, isHearted, appearance }: Props) => {
  // const [bgImage, setBgImage] = useState<any>({ img: null, copyright: '' });

  // const {
  //   authStore: { user },
  // } = useStoreState();

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme, appearance);

  const bgImage = useMemo(() => getRandomBG(), []);
  const dimensions = {
    width: itemWidth,
    height: itemWidth + normalize(40),
    borderRadius: theme.fontSize.normal,
  };

  const {
    id,
    title,
    classStatus,
    isLongTerm,
    dateStart,
    dateEnd,
    timeStart,
    timeEnd,
    dayOfWeek,
    classFee,
    numOfClass,
    tagSearchable,
    regionSearchable,
    host,
  } = classItem!;

  const classScheduleData = {
    dateStart,
    dateEnd,
    timeStart,
    timeEnd,
    dayOfWeek,
  };

  const _handleNavToClass = debounce(() => navigation.push('ClassView', { origin: 'Home', classId: id, hostId: host!.id }), 5000, {
    leading: true,
    trailing: false,
  });

  const renderBackground = useMemo(() => {
    return (
      <View style={styles.backgroundContainer}>
        <FastImage source={bgImage.img} style={dimensions} />
        <LinearGradient
          colors={theme.colors.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.55 }}
          style={[dimensions, styles.parallaxHeaderOpacity]}
        />
      </View>
    );
  }, [bgImage.img, dimensions, appearance]);

  return (
    <TouchableOpacity style={[styles.container, dimensions]} onLongPress={handleLongPress} onPress={_handleNavToClass}>
      {renderBackground}

      <View style={styles.infoContainer}>
        <KoreanParagraph text={title!} textStyle={styles.titleText} paragraphStyle={styles.titleContainer} numberOfLines={2} ellipsizeMode="tail" />
        <ClassViewTags tags={tagSearchable} />
        <ClassStatusText classStatus={classStatus!} blackText={false} appearance={appearance} />
      </View>

      <View style={styles.mediumContainer}>
        <ClassViewCardInfoText category="위치" value={`${getTagString(regionSearchable)}`} blackText={false} appearance={appearance} />
        <ClassScheduleCarousel data={classScheduleData} autoplay={true} blackText={false} appearance={appearance} />
        <Text style={styles.priceText}>
          {numeral(classFee).format('0,0')}원 x {numOfClass}회{isLongTerm && ' x 1주'}
        </Text>
      </View>
      {isCurrent && (
        <View style={[dimensions, styles.backgroundContainer, styles.controlContainer]}>
          {/* <HeartButton item={classItem} /> */}
          <TouchableOpacity onPress={handleLongPress}>
            {isHearted ? (
              <Icon name="heart" color={theme.colors.red} size={32} />
            ) : (
              <Icon name="heart-outline" color={theme.colors.background} size={32} />
            )}
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const getThemedStyles = (theme: any, appearance: AppearanceType) =>
  StyleSheet.create({
    container: {
      // flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: theme.size.small,
    },
    infoContainer: {
      // flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: theme.size.normal,
    },
    titleText: { color: theme.colors.background, fontWeight: '800', fontSize: theme.fontSize.big, alignSelf: 'center' },
    titleContainer: { justifyContent: 'center' },
    mediumContainer: {
      flexDirection: 'column',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginBottom: theme.size.normal,
    },
    parallaxHeaderOpacity: {
      position: 'absolute',
      top: 0,
      backgroundColor: appearance === AppearanceType.LIGHT ? 'rgba(0,0,0,.4)' : 'rgba(255,255,255,.001)',
    },
    backgroundContainer: { position: 'absolute', top: 0, left: 0, borderRadius: theme.fontSize.normal },
    priceText: {
      color: theme.colors.background,
      fontWeight: '800',
      fontSize: theme.fontSize.normal,
      alignSelf: 'center',
    },
    controlContainer: {
      flexDirection: 'column',
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      padding: theme.size.big,
    },
  });

export default memo(withNavigation(ClassCarouselCard), (prev, next) => {
  return (
    prev.classItem.id === next.classItem.id &&
    prev.isCurrent === next.isCurrent &&
    prev.isHearted === next.isHearted &&
    prev.appearance === next.appearance
  );
});
