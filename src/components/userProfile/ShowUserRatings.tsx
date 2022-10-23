import React, { memo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Collapsible from 'react-native-collapsible';
import { Ratings } from '../../types/apiResults';
import getRatings from '../../functions/getRatings';
import { getTheme } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

interface Props {
  ratings: Ratings;
  appearance: AppearanceType;
}

const ShowUserRatings = ({ ratings, appearance }: Props) => {
  const { hostRating, proxyRating, satisfactionRate, hostSatisfactionRate, proxySatisfactionRate } = getRatings(
    ratings,
  );
  const [showRatings, setShowRatings] = useState('');

  const _handleShowRatings = (type: string) => () => {
    if (type === showRatings) {
      setShowRatings('');
    } else {
      setShowRatings(type);
    }
  };

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const renderRatings = () => {
    return (
      <View style={styles.datailsContainer}>
        {showRatings === 'host' && (
          <>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsTextGood}>오픈한 클래스 수</Text>

              <Text style={[styles.detailsTextGood, styles.detailsNumber]}>
                {ratings.hostedClassCounter}
                <Text style={styles.suffix}>개</Text>
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsTextGood}>완료한 클래스 수</Text>

              <Text style={[styles.detailsTextGood, styles.detailsNumber]}>
                {ratings.completedClassCounter}
                <Text style={styles.suffix}>개</Text>
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsTextBad}>취소한 클래스 수</Text>

              <Text style={[styles.detailsTextBad, styles.detailsNumber]}>
                {ratings.cancelledClassCounter}
                <Text style={styles.suffix}>개</Text>
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsTextGood}>긍정적인 리뷰</Text>

              <Text style={[styles.detailsTextGood, styles.detailsNumber]}>
                {ratings.satisfiedHostReviewCounter}
                <Text style={styles.suffix}>개</Text>
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsTextBad}>부정적인 리뷰</Text>

              <Text style={[styles.detailsTextBad, styles.detailsNumber]}>
                {ratings.receivedHostReviewCounter - ratings.satisfiedHostReviewCounter}
                <Text style={styles.suffix}>개</Text>
              </Text>
            </View>
          </>
        )}

        {showRatings === 'proxy' && (
          <>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsTextGood}>담당한 클래스 수</Text>
              <Text style={[styles.detailsTextGood, styles.detailsNumber]}>
                {ratings.proxiedClassCounter}
                <Text style={styles.suffix}>개</Text>
              </Text>
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.detailsTextGood}>긍정적인 리뷰</Text>
              <Text style={[styles.detailsTextGood, styles.detailsNumber]}>
                {ratings.satisfiedProxyReviewCounter}
                <Text style={styles.suffix}>개</Text>
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsTextBad}>부정적인 리뷰</Text>
              <Text style={[styles.detailsTextBad, styles.detailsNumber]}>
                {ratings.receivedProxyReviewCounter - ratings.satisfiedProxyReviewCounter}
                <Text style={styles.suffix}>개</Text>
              </Text>
            </View>
          </>
        )}

        {showRatings === 'rate' && (
          <>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsTextGood}>호스트 만족률</Text>
              <Text style={[styles.detailsTextGood, styles.detailsNumber]}>
                {hostSatisfactionRate}
                <Text style={styles.suffix}>%</Text>
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsTextGood}>선생님 만족률</Text>
              <Text style={[styles.detailsTextGood, styles.detailsNumber]}>
                {proxySatisfactionRate}
                <Text style={styles.suffix}>%</Text>
              </Text>
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity onPress={_handleShowRatings('host')} style={styles.item}>
          <Text style={[styles.typeText, showRatings === 'host' && styles.selectedTypeText]}>호스트 점수</Text>
          <Text style={[styles.scoreText, showRatings === 'host' && styles.selectedTypeText]}>{hostRating}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_handleShowRatings('proxy')} style={styles.item}>
          <Text style={[styles.typeText, showRatings === 'proxy' && styles.selectedTypeText]}>선생님 점수</Text>
          <Text style={[styles.scoreText, showRatings === 'proxy' && styles.selectedTypeText]}>{proxyRating}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_handleShowRatings('rate')} style={styles.item}>
          <Text style={styles.typeText}>거래 만족율</Text>
          <Text style={styles.scoreText}>{satisfactionRate}%</Text>
        </TouchableOpacity>
      </View>
      {/* <View style={styles.ratings}> */}
      <>
        {showRatings === '' && <Text style={styles.guideText}>점수 상세 내역을 보시려면 터치하세요</Text>}
        <Collapsible collapsed={showRatings === ''}>{renderRatings()}</Collapsible>
      </>
      {/* </View> */}
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'column',
      marginTop: theme.size.normal,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginHorizontal: theme.size.big,
    },

    item: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    ratings: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: theme.size.small,
      paddingVertical: theme.size.small,
      borderWidth: 1,
      borderColor: 'yellow',
    },
    guideText: {
      fontSize: theme.fontSize.small,
      color: theme.colors.focus,
      alignSelf: 'center',
      marginTop: theme.size.small,
      marginBottom: theme.size.normal,
    },
    typeText: {
      fontSize: theme.fontSize.small,
      color: theme.colors.placeholder,
    },
    selectedTypeText: {
      color: theme.colors.primary,
      fontWeight: 'bold',
    },
    scoreText: {
      fontSize: theme.fontSize.big,
      fontWeight: '600',
      color: theme.colors.placeholder,
    },
    datailsContainer: {
      backgroundColor: theme.colors.grey200,
      paddingTop: theme.size.small,
      paddingHorizontal: theme.size.big * 3,
      marginTop: theme.size.small,
    },
    detailsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: theme.size.xs,
    },
    detailsTextGood: {
      fontSize: theme.fontSize.medium,
      color: theme.colors.text,
    },
    detailsTextBad: {
      fontSize: theme.fontSize.medium,
      color: theme.colors.error,
    },
    detailsNumber: {
      fontSize: theme.fontSize.normal,
    },
    suffix: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.placeholder,
    },
  });

export default memo(ShowUserRatings);
