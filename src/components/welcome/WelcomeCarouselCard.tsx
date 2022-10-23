import * as Animatable from 'react-native-animatable';

import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { memo } from 'react';

import { AddClassHelpCard } from '../addClassHelp/HelpCarousel';
import FastImage from 'react-native-fast-image';
import KoreanParagraph from '../KoreanParagraph';
import getDimensions from '../../functions/getDimensions';
import { useStoreState } from '../../stores/initStore';
import { getTheme } from '../../configs/theme';

interface Props {
  item: AddClassHelpCard;
  itemWidth: number;
  onCancel?: () => void;
}

const { SCREEN_WIDTH } = getDimensions();

const WelcomeCarouselCard = ({ item, onCancel }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  if (onCancel) {
    return (
      <View style={styles.lastContainer}>
        <KoreanParagraph
          text={item.title}
          textStyle={styles.titleText}
          paragraphStyle={styles.lastTitleParagraph}
          key="title"
        />

        <KoreanParagraph text={item.desc1} textStyle={styles.desc1Text} paragraphStyle={styles.lastDescParagraph} />
        {item.desc2 && (
          <KoreanParagraph text={item.desc2} textStyle={styles.desc1Text} paragraphStyle={styles.descParagraph} />
        )}
        {item.desc3 && (
          <KoreanParagraph
            text={item.desc3}
            textStyle={styles.desc2Text}
            paragraphStyle={styles.descParagraph}
            focusTextStyle={styles.descFocusText}
          />
        )}
        <TouchableOpacity onPress={onCancel}>
          <Animatable.View useNativeDriver animation="pulse" iterationCount={'infinite'}>
            <FastImage
              source={item.img}
              style={{
                width: SCREEN_WIDTH / 4,
                height: SCREEN_WIDTH / 4,
                alignSelf: 'center',
              }}
              resizeMode="contain"
            />
            <Text style={styles.buttonGuide}>터치하고 시작하세요</Text>
          </Animatable.View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View>
        <KoreanParagraph text={item.title} textStyle={styles.titleText} key="title" />

        <KoreanParagraph text={item.desc1} textStyle={styles.desc1Text} paragraphStyle={styles.descParagraph} />
        {item.desc2 && (
          <KoreanParagraph text={item.desc2} textStyle={styles.desc1Text} paragraphStyle={styles.descParagraph} />
        )}
        {item.desc3 && (
          <KoreanParagraph
            text={item.desc3}
            textStyle={styles.desc2Text}
            paragraphStyle={styles.descParagraph}
            focusTextStyle={styles.descFocusText}
          />
        )}
      </View>
      <FastImage
        source={item.img}
        style={{
          width: SCREEN_WIDTH / 3,
          height: SCREEN_WIDTH / 3,
          alignSelf: 'flex-end',
        }}
        resizeMode="contain"
      />
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      // borderColor: 'white',
      // borderWidth: 1,
      flex: 1,
      justifyContent: 'space-between',
      marginVertical: theme.size.big * 5,
      // backgroundColor: theme.colors.background,
    },
    lastContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      marginVertical: theme.size.big * 5,
      // backgroundColor: theme.colors.background,
    },
    titleText: {
      fontSize: theme.fontSize.title,
      // fontWeight: 'bold',
      // fontFamily: 'NanumMiNiSonGeurSsi',
      fontFamily: Platform.OS === 'ios' ? 'NanumJangMiCe' : 'nanum_rose',
      color: 'yellow',
    },
    lastTitleParagraph: {
      justifyContent: 'center',
    },
    desc1Text: {
      fontWeight: '700',
      fontSize: theme.fontSize.subheading,
      color: 'white',
      marginTop: theme.size.normal,
    },
    desc2Text: {
      fontWeight: '600',
      fontSize: theme.fontSize.big,
      color: 'white',
    },

    descFocusText: {
      fontWeight: '700',
      fontSize: theme.fontSize.normal,
      color: theme.colors.primary,
    },
    descParagraph: {
      marginVertical: theme.size.normal,
    },
    lastDescParagraph: {
      marginVertical: theme.size.normal,
      justifyContent: 'center',
    },

    buttonGuide: {
      fontWeight: '700',
      color: 'white',
      fontSize: theme.fontSize.small,
      alignSelf: 'center',
    },
  });

export default memo(WelcomeCarouselCard);
