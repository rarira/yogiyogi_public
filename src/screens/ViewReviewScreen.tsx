import AccessDenied, { AccessDeniedReason, AccessDeniedTarget } from '../components/AccessDenied';
import React, { FunctionComponent } from 'react';
import { ReviewType, SatisfactionType } from '../API';
import { Text, View } from 'react-native';

import BackButton from '../components/BackButton';
import BlockedKoreanParagraph from '../components/BlockedKoreanParagraph';
import Body from '../components/Body';
import ClassInfoBanner from '../components/ClassInfoBanner';
import HeaderTitle from '../components/HeaderTitle';
import Icon from 'react-native-vector-icons/AntDesign';
import Left from '../components/Left';
import Loading from '../components/Loading';
import ModalScreenContainer from './ModalScreenContainter';
import { NavigationStackScreenProps } from 'react-navigation-stack';
import { QueryResult } from '@apollo/react-common';
import Right from '../components/Right';
import SubHeaderText from '../components/SubHeaderText';
import SwitchStackHeader from '../components/SwitchStackHeader';
import { TOTAL_MANNERS } from '../configs/variables';
import TextBox from '../components/TextBox';
import UserThumbnail from '../components/UserThumbnail';
import { customGetReviews } from '../customGraphqls';
import format from 'date-fns/format';
import gql from 'graphql-tag';
import koLocale from 'date-fns/locale/ko';
import reportSentry from '../functions/reportSentry';

import useHandleAndroidBack from '../functions/handleAndroidBack';
import { useQuery } from '@apollo/react-hooks';
import { useStoreState } from '../stores/initStore';
import { getStyles } from '../configs/styles';
import { getTheme } from '../configs/theme';

interface Props extends NavigationStackScreenProps {}

const GET_REVIEW = gql(customGetReviews);

const ViewReviewScreen: FunctionComponent<any> = ({ navigation }: Props) => {
  const {
    authStore: {
      user: { username },
      appearance,
    },
  } = useStoreState();

  const reviewId = navigation.getParam('reviewId');
  const origin = navigation.getParam('origin');
  const reviewType = navigation.getParam('reviewType');

  const { error, data }: QueryResult = useQuery(GET_REVIEW, { variables: { id: reviewId } });

  const _handleBackButton = () => {
    if (origin) {
      navigation.navigate({
        routeName: origin,
        // params: { origin },
      });
    } else {
      navigation.pop();
    }
  };

  useHandleAndroidBack(navigation, _handleBackButton);

  if (!data || !data.getReviews) return <Loading origin="ViewReviewScreen" />;
  if (error) {
    reportSentry(error);
    return <AccessDenied category={AccessDeniedReason.Error} target={AccessDeniedTarget.Error} />;
  }

  const styles = getStyles(appearance);
  const theme = getTheme(appearance);

  const renderHeader = () => (
    <SwitchStackHeader appearance={appearance} border>
      <Left>
        <BackButton onPress={_handleBackButton} />
      </Left>
      <Body flex={4}>
        <HeaderTitle tintColor={theme.colors.text}>
          {reviewType === ReviewType.hostReview ? '호스트 리뷰 보기' : '선생님 리뷰 보기'}
        </HeaderTitle>
      </Body>
      <Right />
    </SwitchStackHeader>
  );

  const { satisfaction, reviewedClass, reviewee, reviewer, createdAt, manners, content } = data.getReviews;
  const fontColor = satisfaction === SatisfactionType.good ? theme.colors.primary : theme.colors.error;

  return (
    <ModalScreenContainer
      children1={
        <>
          {renderHeader()}
          <ClassInfoBanner
            classId={reviewedClass.id}
            classTitle={reviewedClass.title}
            hostId={reviewedClass.host.id}
            origin="ViewReview"
            appearance={appearance}
          />
          <View style={styles.columnCenterView}>
            {reviewee.id !== username ? (
              <>
                <SubHeaderText appearance={appearance}>
                  {reviewType === ReviewType.hostReview ? '클래스 호스트' : '담당 선생님'}
                </SubHeaderText>
                <UserThumbnail
                  source={reviewee.picture || reviewee.oauthPicture || null}
                  size={theme.iconSize.thumbnail}
                  identityId={reviewee.identityId}
                  userName={reviewee.name}
                  noBackground
                  noBadge
                  blackText
                />
              </>
            ) : (
              <>
                <SubHeaderText appearance={appearance}>
                  {reviewType === ReviewType.hostReview ? '리뷰 작성한 선생님' : '리뷰 작성한 호스트'}
                </SubHeaderText>
                <UserThumbnail
                  source={reviewer.picture || reviewer.oauthPicture || null}
                  size={theme.iconSize.thumbnail}
                  identityId={reviewer.identityId}
                  userName={reviewer.name}
                  noBackground
                  noBadge
                  blackText
                />
              </>
            )}

            <View style={[styles.searchBar, styles.paddingMediumVertical]}>
              <Icon
                name={satisfaction === SatisfactionType.good ? 'downcircle' : 'closecircle'}
                size={theme.iconSize.xl}
                color={fontColor}
              />
              <Text style={[styles.weightedFont, styles.fontMedium, { color: fontColor }]}>
                {satisfaction === SatisfactionType.good ? '만족스러웠어요!' : '아쉬웠어요^^'}
              </Text>
            </View>
            <View style={styles.fullWidth}>
              {manners.map((manner: string) => (
                <TextBox
                  key={manner}
                  text={TOTAL_MANNERS[manner].text}
                  color={fontColor}
                  fontWeight="bold"
                  appearance={appearance}
                />
              ))}
            </View>
            {content && (
              <View style={styles.paddingMediumVertical}>
                <BlockedKoreanParagraph text={content} />
              </View>
            )}

            <View style={styles.paddingMediumVertical}>
              <Text style={styles.fontSmall}>
                리뷰 작성일 : {format(createdAt, 'YYYY[년] M[월] D[일] A h:mm', { locale: koLocale })}
              </Text>
            </View>
          </View>
        </>
      }
    />
  );
};

export default ViewReviewScreen;
