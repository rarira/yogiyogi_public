import { AppearanceType, PostData } from '../../types/store';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import theme, { getThemeColor } from '../../configs/theme';

import FastImage from 'react-native-fast-image';
import PostBookmarkButton from './PostBookmarkButton';
import PostNumberBox from './PostNumberBox';
import getPostCategory from '../../functions/getPostCategory';
import getPostCategoryColor from '../../functions/getPostCategoryColor';
import getPublicS3Picture from '../../functions/getPublicS3Picture';
import getYearMonthDate from '../../functions/getYearMonthDate';
import isEqual from 'react-fast-compare';
import reportSentry from '../../functions/reportSentry';
import { useStoreState } from '../../stores/initStore';

interface Props extends NavigationInjectedProps {
  item: PostData;
  origin: string;
}

const EMPTY_THUMBNAIL = require('../../static/img/emptyThumbnail.png');

const PostListCard = ({ item, origin, navigation }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const styles = getThemedStyles(appearance);
  const [imgURL, setImgURL] = useState<string | null>(null);
  const {
    id,
    postCategory,
    postPicture,
    postTitle,
    thumbnailURL,
    createdAt,
    numOfComments,
    numOfLikes,
    // numOfDislikes,
    numOfViews,
    blockedBy,
    // author,
  } = item;

  // const isMyself = author.id === user.username;
  const dateString = useMemo(() => getYearMonthDate(createdAt), [createdAt]);
  const fromBookmarkList = origin === 'BookmarkList';
  const categoryString = useMemo(() => getPostCategory(postCategory), [postCategory]);
  const categoryColor = useMemo(() => ({ color: getPostCategoryColor(postCategory, appearance) }), [postCategory]);
  const postNumbers = {
    numOfComments,
    numOfLikes,
    // numOfDislikes,
    numOfViews,
  };

  useEffect(() => {
    let _mounted = true;
    if (_mounted) {
      if (!!postPicture && postPicture.length > 0) {
        (async function() {
          try {
            const result = await getPublicS3Picture(postPicture[0].key);
            setImgURL(result.toString());
          } catch (e) {
            reportSentry(e);
          }
        })();
      } else if (thumbnailURL) {
        setImgURL(thumbnailURL);
      }
    }
    return () => {
      _mounted = false;
    };
  }, []);

  const _handleOnPress = () =>
    navigation.navigate('PostView', {
      postId: id,
      //  postCreatedAt: createdAt,
      origin,
    });

  const renderThumbnail = useMemo(() => {
    const isFavIcon = !!imgURL && imgURL.startsWith('favicon_');
    const finalURL = isFavIcon ? imgURL!.slice(8) : imgURL;
    return (
      <View style={styles.thumbnailContainer}>
        <FastImage
          source={finalURL ? { uri: finalURL, priority: FastImage.priority.high } : EMPTY_THUMBNAIL}
          style={styles.thumbnailImage}
          resizeMode={isFavIcon ? FastImage.resizeMode.center : FastImage.resizeMode.contain}
        />
      </View>
    );
  }, [imgURL]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.cardWrapper}
        onPress={_handleOnPress}
        // onLayout={_handleOnLayout}
      >
        <View style={styles.cardLeft}>{renderThumbnail}</View>
        <View style={styles.cardBody}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitleText} numberOfLines={3} ellipsizeMode="tail">
              {postTitle}
            </Text>
          </View>

          {!fromBookmarkList && <PostNumberBox postNumbers={postNumbers} />}
          <View style={styles.cardStatusRow}>
            <Text style={styles.cardInfoText}>{dateString}</Text>
            {!fromBookmarkList && <Text style={[styles.postCategoryText, categoryColor]}>{categoryString}</Text>}
          </View>
        </View>
        {fromBookmarkList && <PostBookmarkButton postId={id} />}
      </TouchableOpacity>
    </View>
  );
};

const getThemedStyles = (appearance: AppearanceType) =>
  StyleSheet.create({
    container: {
      flexDirection: 'column',
      marginHorizontal: theme.size.big,
      // backgroundColor: theme.colors.cardBackground,
      // borderRadius: theme.size.small,
      // borderColor: theme.colors.disabled,
      // borderWidth: 1,
      // padding: 10,
    },
    thumbnailContainer: {
      height: theme.iconSize.postThumbnail,
      // flex: 1,
      width: theme.iconSize.postThumbnail,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      // borderRadius: theme.size.big,
      // borderColor: 'red',
      // borderWidth: 1,
    },
    thumbnailImage: {
      flex: 1,
      // height:theme.iconSize.postThumbnail,
      width: theme.iconSize.postThumbnail,
      borderRadius: theme.size.small,
    },
    cardWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cardLeft: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },

    cardBody: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-start',
      marginHorizontal: theme.size.normal,
    },

    cardStatusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    cardInfoText: {
      color: getThemeColor('backdrop', appearance),
      fontSize: theme.fontSize.small,
    },
    postCategoryText: {
      fontWeight: '600',
      fontSize: theme.fontSize.small,
      color: getThemeColor('text', appearance),
    },

    cardTitleRow: {
      flexDirection: 'row',
      marginBottom: theme.size.small,
    },
    cardTitleText: {
      color: getThemeColor('text', appearance),
      fontSize: theme.fontSize.medium,
      fontWeight: '600',
    },
  });

export default memo(withNavigation(PostListCard), isEqual);
