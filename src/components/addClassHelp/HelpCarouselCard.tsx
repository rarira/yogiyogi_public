import React, { memo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import theme, { getThemeColor, normalize } from '../../configs/theme';

import { AddClassHelpCard } from './HelpCarousel';
import FastImage from 'react-native-fast-image';
import KoreanParagraph from '../KoreanParagraph';
import { AppearanceType } from '../../types/store';

interface Props {
  item: AddClassHelpCard;
  itemWidth: number;
  onCancel?: () => void;
  index: number;
  appearance: AppearanceType;
}

const HelpCarouselCard = ({ item, itemWidth, onCancel, index, appearance }: Props) => {
  const styles = getThemedStyles(appearance);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <KoreanParagraph text={item.title} textStyle={styles.titleText} />
      <FastImage
        source={item.img ?? item.img.img}
        style={{ width: itemWidth, height: index === 2 ? normalize(70) : normalize(180) }}
        resizeMode="contain"
      />
      <KoreanParagraph
        text={item.desc1}
        textStyle={styles.desc1Text}
        paragraphStyle={styles.descParagraph}
        focusTextStyle={styles.descFocusText}
      />
      {item.desc2 && (
        <KoreanParagraph
          text={item.desc2}
          textStyle={index === 2 ? styles.examText : styles.desc2Text}
          paragraphStyle={index === 2 ? styles.descParagraph2 : styles.descParagraph}
          focusTextStyle={index === 2 ? styles.examFocusText : styles.descFocusText}
        />
      )}
      {item.desc3 && (
        <KoreanParagraph
          text={item.desc3}
          textStyle={index === 2 ? styles.examText : styles.desc2Text}
          paragraphStyle={index === 2 ? styles.descParagraph2 : styles.descParagraph}
          focusTextStyle={index === 2 ? styles.examFocusText : styles.descFocusText}
        />
      )}
      {item.desc4 && (
        <KoreanParagraph
          text={item.desc4}
          textStyle={styles.desc2Text}
          paragraphStyle={styles.descParagraph}
          focusTextStyle={styles.descFocusText}
        />
      )}
      {item.desc5 && (
        <KoreanParagraph
          text={item.desc5}
          textStyle={styles.desc2Text}
          paragraphStyle={styles.descParagraph}
          focusTextStyle={styles.descFocusText}
        />
      )}
      {onCancel && (
        <TouchableOpacity onPress={onCancel} style={styles.buttonStyle}>
          <Text style={styles.buttonText}>클래스 등록을 시작합니다</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const getThemedStyles = (appearance: AppearanceType) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      justifyContent: 'center',
      // alignItems: 'center',
      backgroundColor: getThemeColor('background', appearance),
    },
    titleText: {
      fontSize: theme.fontSize.subheading,
      fontWeight: '700',
      color: getThemeColor('text', appearance),
    },
    desc1Text: {
      fontWeight: '500',
      fontSize: theme.fontSize.medium,
      color: getThemeColor('accent', appearance),
      marginTop: theme.size.xs,
    },
    desc2Text: {
      fontWeight: '500',
      fontSize: theme.fontSize.medium,
      color: getThemeColor('text', appearance),
      marginTop: theme.size.xs,
    },
    examText: {
      // fontWeight: '500',
      fontSize: theme.fontSize.small,
      color: getThemeColor('placeholder', appearance),
      marginTop: theme.size.xs,
    },

    descFocusText: {
      fontWeight: '700',
      fontSize: theme.fontSize.medium,
      color: getThemeColor('primary', appearance),
    },
    examFocusText: {
      fontWeight: '700',
      fontSize: theme.fontSize.small,
      color: getThemeColor('focus', appearance),
    },
    descParagraph: {
      marginBottom: theme.size.normal,
    },
    descParagraph2: {
      marginBottom: theme.size.normal,
      marginLeft: theme.size.normal,
    },
    buttonStyle: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.size.normal,
      backgroundColor: getThemeColor('primary', appearance),
      marginTop: theme.size.normal,
      marginBottom: theme.size.big,
    },
    buttonText: {
      fontWeight: '700',
      color: getThemeColor('background', appearance),
    },
  });

export default memo(HelpCarouselCard);
