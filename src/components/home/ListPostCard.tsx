import { AppearanceType, PostData } from '../../types/store';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import theme, { getThemeColor } from '../../configs/theme';

import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PostNumberBox from '../comm/PostNumberBox';
import getPublicS3Picture from '../../functions/getPublicS3Picture';
import getTagString from '../../functions/getTagString';
import getYearMonthDate from '../../functions/getYearMonthDate';
import isEqual from 'react-fast-compare';
import reportSentry from '../../functions/reportSentry';
import { useStoreState } from '../../stores/initStore';

interface Props extends NavigationInjectedProps {
  item: PostData;
}

const EMPTY_THUMBNAIL = require('../../static/img/emptyThumbnail.png');

const ListPostCard = ({ item, navigation }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();

  const styles = getThemedStyles(appearance);
  const [imgURL, setImgURL] = useState<string | null>(null);
  const {
    id,
    postPicture,
    postTitle,
    thumbnailURL,
    createdAt,
    numOfComments,
    numOfLikes,
    // numOfDislikes,
    numOfViews,
    postTags,
    // author,
  } = item;

  const postNumbers = {
    numOfComments,
    numOfLikes,
    // numOfDislikes,
    numOfViews,
  };

  // const isMyself = author.id === user.username;
  const dateString = useMemo(() => getYearMonthDate(createdAt), [createdAt]);

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
      origin: 'Home',
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
          {!!postTags && (
            <Text style={styles.cardInfoText}>
              <Icon name="tag-multiple" color={theme.colors.text} /> {getTagString(postTags)}
            </Text>
          )}
          <View style={styles.cardStatusRow}>
            <Text style={styles.cardInfoText}>{dateString}</Text>
            <PostNumberBox postNumbers={postNumbers} fromHome />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const getThemedStyles = (appearance: AppearanceType) =>
  StyleSheet.create({
    container: {
      flexDirection: 'column',
      // backgroundColor: theme.colors.cardBackground,
    },
    thumbnailContainer: {
      height: theme.iconSize.smallThumbnail,

      width: theme.iconSize.smallThumbnail,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    thumbnailImage: {
      flex: 1,
      width: theme.iconSize.smallThumbnail,
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
      alignItems: 'center',
    },
    cardInfoText: {
      color: getThemeColor('backdrop', appearance),
      fontSize: theme.fontSize.error,
    },

    cardTitleRow: {
      flexDirection: 'row',
      marginBottom: theme.size.small,
    },
    cardTitleText: {
      color: getThemeColor('text', appearance),
      fontSize: theme.fontSize.small,
      fontWeight: '600',
    },
  });

export default memo(withNavigation(ListPostCard), isEqual);
