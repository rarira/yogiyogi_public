import AccessDenied, { AccessDeniedReason, AccessDeniedTarget } from '../components/AccessDenied';
import { AccountStatusType, PostStatus, ReportTargetType } from '../API';
import MySnackbar, { snackbarInitialState, snackbarReducer } from '../components/MySnackbar';
import { SafeAreaView as NativeSafeAreaView, RefreshControl, ScrollView } from 'react-native';
import React, { useEffect, useReducer, useState } from 'react';
import WarningDialog, { WarningProps } from '../components/WarningDialog';
import { customGetPost, onCustomUpdatePost, updatePostStatus } from '../customGraphqls';
import { useMutation, useQuery, useSubscription } from '@apollo/react-hooks';
import { useStoreDispatch, useStoreState } from '../stores/initStore';

import AD_IDS from '../static/data/AD_IDS';
import AndroidDivider from '../components/AndroidDivider';
import BackButton from '../components/BackButton';
import { BannerAdSize } from '@react-native-firebase/admob';
import Body from '../components/Body';
import ItemShareVisibleDialog from '../functions/ItemShareVisibleDialog';
import Left from '../components/Left';
import Loading from '../components/Loading';
import MyBannerAd from '../components/Ad/MyBannerAd';
import { NavigationStackScreenProps } from 'react-navigation-stack';
import NeedAuthBottomSheet from '../components/NeedAuthBottomSheet';
import NeedProfileUpdate from '../components/NeedProfileUpdate';
import { Portal } from 'react-native-paper';
import PostActionMenuButton from '../components/PostActionMenuButton';
import PostAuthorBox from '../components/comm/PostAuthorBox';
import PostComments from '../components/comm/PostComments';
import PostCommentsHeader from '../components/comm/PostCommentsHeader';
import PostContentBox from '../components/comm/PostContentBox';
import PostHeaderButtons from '../components/comm/PostHeaderButtons';
import PostImageSlider from '../components/comm/PostImageSlider';
import PostInfoBox from '../components/comm/PostInfoBox';
import PostLinkBox from '../components/comm/PostLinkBox';
import { PostNumbers } from '../types/store';
import PostWarning from '../components/comm/PostWarning';
import ReportForm from '../components/ReportForm';
import Right from '../components/Right';
import { SET_COMMENT_STATE } from '../stores/actionTypes';
import { SafeAreaView } from 'react-navigation';
import StatusBarNormal from '../components/StatusBarNormal';
import SwitchStackHeader from '../components/SwitchStackHeader';
import { getStyles } from '../configs/styles';
import getUsername from '../functions/getUsername';
import gql from 'graphql-tag';
import guestClient from '../configs/guestClient';
import reportSentry from '../functions/reportSentry';
import useHandleAndroidBack from '../functions/handleAndroidBack';

interface Props extends NavigationStackScreenProps {
  isFocused: boolean;
}

const GET_POST = gql(customGetPost);
const UPDATE_POST_STATUS = gql(updatePostStatus);
const SUBSCRIBE_TO_POST_UPDATE = gql(onCustomUpdatePost);

const PostViewScreen = ({ navigation }: Props) => {
  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);
  const [modalVisible, setModalVisible] = useState(false);
  const [warningProps, setWarningProps] = useState<Partial<WarningProps> | null>(null);
  const [needAuthVisible, setNeedAuthVisible] = useState(false);
  const [needProfileUpdateVisible, setNeedProfileUpdateVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [imgURLs, setImgURLs] = useState<string[]>([]);
  const [shareVisible, setShareVisible] = useState<boolean>(false);

  const {
    authStore: { user, profileUpdated, identityId, appearance },
  } = useStoreState();
  const styles = getStyles(appearance);

  const storeDispatch = useStoreDispatch();

  const origin = navigation.getParam('origin');
  const postId = navigation.getParam('postId');

  const updated = navigation.getParam('updated');

  const { data, loading, error, refetch, networkStatus } = useQuery(GET_POST, {
    variables: {
      id: postId,
    },
    skip: !postId,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
    ...(!user && { client: guestClient }),
  });

  const [updatePostStatus, { loading: updatePostStatusLoading }] = useMutation(UPDATE_POST_STATUS);

  const _handleBackButton = () => {
    // console.log(origin);
    // if (origin === 'Noti') {
    //   navigation.navigate('Comm');
    // } else
    if (!!origin) {
      navigation.navigate(origin);
    } else {
      navigation.goBack();
    }
  };

  useHandleAndroidBack(navigation, _handleBackButton);

  const _handleRefreshControl = () => {
    setRefreshing(true);
    refetch()
      .then(result => {
        setRefreshing(false);
      })
      .catch(error => {
        reportSentry(error);
        setRefreshing(false);
      });
  };
  const subs = useSubscription(SUBSCRIBE_TO_POST_UPDATE, {
    variables: { id: postId },
    onSubscriptionData: options => {
      try {
        const { onCustomUpdatePost } = options.subscriptionData.data;
        const queryResult = options.client.readQuery({ query: GET_POST, variables: { id: postId } });

        if (onCustomUpdatePost.updatedAt ?? null !== queryResult.getPost.updatedAt) {
          let newData: any = { getPost: {} };
          for (const property in queryResult.getPost) {
            if (property !== 'author') {
              newData.getPost[property] = onCustomUpdatePost[property] ?? queryResult.getPost[property];
            } else {
              newData.getPost.author = {};
              for (const property2 in queryResult.getPost.author) {
                newData.getPost.author[property2] = onCustomUpdatePost.author?.[property2] ?? queryResult.getPost.author[property2];
              }
            }
          }

          options.client.writeQuery({
            query: GET_POST,
            variables: { id: postId },
            data: newData,
          });
          // Alert.alert('게시물 내용 변경', '작성자가 게시물 내용을 변경하였습니다.');
        }
      } catch (e) {
        reportSentry(e);
      }
    },
  });

  // 수정이나 신규 등록시
  useEffect(() => {
    let _mounted = true;
    if (_mounted && !!updated && !shareVisible) {
      setShareVisible(true);
    }
    return () => {
      _mounted = false;
      subs;
    };
  }, [updated]);

  const _handleDismiss = () => setWarningProps(null);

  if (!data?.getPost || loading) {
    return <Loading origin={`PostView_${postId}`} />;
  }
  if (error) {
    reportSentry(error);

    return <AccessDenied category={AccessDeniedReason.Error} target={AccessDeniedTarget.Post} navigateRoute={origin} extraInfo={error.message} />;
  }

  if (data.getPost === null) {
    return <AccessDenied category={AccessDeniedReason.Null} target={AccessDeniedTarget.Post} navigateRoute={origin} />;
  }

  if (!!user && data.getPost.postStatus === PostStatus.deleted) {
    return <AccessDenied category={AccessDeniedReason.Deleted} target={AccessDeniedTarget.Post} navigateRoute={origin} />;
  }
  if (!!user && data.getPost.blockedBy && data.getPost.blockedBy.includes(user.username)) {
    return <AccessDenied category={AccessDeniedReason.Blocked} target={AccessDeniedTarget.Post} navigateRoute={origin} />;
  }

  if (!!user && data.getPost.author.blockedUser && data.getPost.author.blockedUser.includes(user.username)) {
    return <AccessDenied category={AccessDeniedReason.UserBlockedBy} target={AccessDeniedTarget.Post} navigateRoute={origin} />;
  }

  if (!!user && data.getPost.author.blockedBy && data.getPost.author.blockedBy.includes(user.username)) {
    return (
      <AccessDenied
        category={AccessDeniedReason.UserBlocked}
        target={AccessDeniedTarget.Post}
        extraInfo={data.getPost.author.name}
        navigateRoute={origin}
      />
    );
  }

  if (data.getPost.author.accountStatus === AccountStatusType.disabled) {
    const mutationFunction = async () => {
      try {
        const input = {
          id: postId,
          // createdAt: postCreatedAt,
          postStatus: PostStatus.authorDisabled,
        };
        await updatePostStatus({
          variables: { input },
          optimisticResponse: {
            updatePost: {
              __typename: 'Post',
              ...input,
            },
          },
        });
      } catch (e) {
        reportSentry(e);
      }
    };

    return (
      <AccessDenied
        category={AccessDeniedReason.UserDisabled}
        target={AccessDeniedTarget.Post}
        navigateRoute={origin}
        {...(!!user && { mutationFunction, loading: updatePostStatusLoading })}
      />
    );
  }

  const item = data.getPost;
  const { author, postTitle, postLink, postPicture, postContent, numOfComments, numOfLikes, numOfViews, createdAt, thumbnailURL, postTags } = item;
  const isAuthor = !!user && user.username === author.id;
  const authorName = getUsername(author.id, author.name);
  const postNumbers: PostNumbers = {
    numOfComments,
    numOfLikes,
    numOfViews,
  };

  const shareImageURL = imgURLs.length > 0 ? imgURLs[0] : undefined;

  const _handleNavToCommentView = () => {
    if (!user) {
      setNeedAuthVisible(true);
    }
    if (!profileUpdated) {
      setNeedProfileUpdateVisible(true);
    } else {
      storeDispatch({
        type: SET_COMMENT_STATE,
        postId,
        postAuthorId: author.id,
        postTitle,
        // receiverId: author.id,
        receiverName: authorName,
      });
      navigation.push('PostCommentView', { origin: 'PostView' });
    }
  };

  const renderHeader = () => {
    return (
      <SwitchStackHeader appearance={appearance} border>
        <Left>
          <BackButton onPress={_handleBackButton} />
        </Left>
        <Body></Body>
        <Right>
          <PostHeaderButtons
            postItem={item}
            setNeedAuthVisible={setNeedAuthVisible}
            shareImageURL={shareImageURL}
            handleNavToComment={_handleNavToCommentView}
            appearance={appearance}
          />
          <PostActionMenuButton
            postItem={item}
            setWarningProps={setWarningProps}
            refetch={refetch}
            isAuthor={isAuthor}
            isPostView
            setModalVisible={setModalVisible}
            origin={origin}
            imgURLs={imgURLs}
          />
        </Right>
      </SwitchStackHeader>
    );
  };
  // console.log('rerender postview');
  return (
    <>
      <SafeAreaView style={styles.contentContainerView}>
        <StatusBarNormal appearance={appearance} />
        {renderHeader()}

        <NativeSafeAreaView style={styles.contentContainerView}>
          <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={_handleRefreshControl} />}>
            <PostImageSlider postPictures={postPicture} imgURLs={imgURLs} setImgURLs={setImgURLs} appearance={appearance} />
            <PostLinkBox URL={postLink} thumbnailURL={thumbnailURL} />
            <PostAuthorBox userData={author} origin={'PostView'} />
            <AndroidDivider needMarginHorizontal />

            <PostInfoBox postTitle={postTitle} postNumbers={postNumbers} date={createdAt} postTags={postTags} />
            <AndroidDivider needMarginHorizontal />
            <PostContentBox postContent={postContent} />
            <MyBannerAd advId={AD_IDS.PostViewBanner} size={BannerAdSize.LARGE_BANNER} needMarginBottom />
            <PostWarning />
            <PostCommentsHeader numOfComments={numOfComments} handleNavToComment={_handleNavToCommentView} />
            <PostComments addedToId={postId} postTitle={postTitle} snackbarDispatch={snackbarDispatch} setWarningProps={setWarningProps} />
          </ScrollView>
        </NativeSafeAreaView>
        <MySnackbar dispatch={snackbarDispatch} snackbarState={snackbarState} />
      </SafeAreaView>
      <Portal>
        {!!user && (
          <ReportForm
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            target="게시물"
            targetId={postId!}
            reportTargetType={ReportTargetType.postReport}
            numOfReported={1}
            setWarningProps={setWarningProps}
            submitted={Boolean(warningProps)}
          />
        )}
      </Portal>
      {needAuthVisible && (
        <NeedAuthBottomSheet navigation={navigation} setNeedAuthVisible={setNeedAuthVisible} params={{ postId }} origin="PostView" />
      )}
      {!!user && needProfileUpdateVisible && (
        <NeedProfileUpdate
          profileUpdated={profileUpdated}
          setNeedProfileUpdateVisible={setNeedProfileUpdateVisible}
          params={{ origin: 'PostView', postId, userId: user?.username ?? '', identityId, backToOrigin: origin }}
          appearance={appearance}
        />
      )}
      <Portal>
        {warningProps && (
          <WarningDialog
            handleDismiss={_handleDismiss}
            dismissable
            dismissText="아니오"
            visible
            snackbarDispatch={snackbarDispatch}
            origin={origin}
            navigation={navigation}
            appearance={appearance}
            {...warningProps}
          />
        )}
      </Portal>
      <ItemShareVisibleDialog
        itemName={'게시물'}
        suffix={'을'}
        shareVisible={shareVisible}
        setShareVisible={setShareVisible}
        updated={updated}
        appearance={appearance}
        postItem={item}
        shareImageURL={shareImageURL}
      />
    </>
  );
};

export default PostViewScreen;
