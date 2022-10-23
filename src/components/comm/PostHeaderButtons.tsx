import { AppearanceType, PostData, PostNumbers } from '../../types/store';
import React from 'react';

import PostBookmarkButton from './PostBookmarkButton';
import PostCommentButton from './PostCommentButton';
import PostLikeButton from './PostLikeButton';
import SharePostButton from './SharePostButton';
import { handlePostShare } from '../classView/KakaoShare';
import { useActionSheet } from '@expo/react-native-action-sheet';

interface Props {
  postItem: PostData;
  setNeedAuthVisible: (arg: boolean) => void;
  shareImageURL?: string;
  handleNavToComment(): void;
  appearance: AppearanceType;
}

const PostHeaderButtons = ({ postItem, setNeedAuthVisible, shareImageURL, handleNavToComment, appearance }: Props) => {
  const { id, numOfLikes, numOfComments, numOfViews, thumbnailURL } = postItem;
  const { showActionSheetWithOptions } = useActionSheet();
  const postNumbers: PostNumbers = {
    numOfLikes,
    numOfComments,
    numOfViews,
  };

  return (
    <>
      <PostCommentButton needMarginRight handleNavToComment={handleNavToComment} />
      <PostLikeButton
        setNeedAuthVisible={setNeedAuthVisible}
        needMarginRight
        postId={id}
        // postCreatedAt={createdAt}
        postNumbers={postNumbers}
      />
      <PostBookmarkButton
        setNeedAuthVisible={setNeedAuthVisible}
        needMarginRight
        postId={id}
        // postCreatedAt={createdAt}
      />

      <SharePostButton
        handleOnPressShare={handlePostShare(
          postItem!,
          showActionSheetWithOptions,
          shareImageURL || thumbnailURL!,
          postNumbers,
          appearance,
        )}
        needMarginRight
      />
    </>
  );
};

export default PostHeaderButtons;
// memo(PostHeaderButtons, isEqual);
