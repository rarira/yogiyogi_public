import { NavigationParams, NavigationRoute, NavigationScreenProp } from 'react-navigation';
import { PostData, StoreAction } from '../types/store';

import { Dispatch } from 'react';
import { PREPARE_UPDATE_POST } from '../stores/actionTypes';

const postEdit = (
  postItem: PostData,
  navigation: NavigationScreenProp<NavigationRoute<NavigationParams>, NavigationParams>,
  origin: string,
  storeDispatch: Dispatch<StoreAction>,
  imgURLs: string[],
) => async () => {
  let {
    id: postId,
    // createdAt: postCreatedAt,
    postTitle,
    postLink,
    postPicture,
    postContent,
    postCategory,
    thumbnailURL,
  } = postItem!;

  storeDispatch({
    type: PREPARE_UPDATE_POST,
    postId,
    // postCreatedAt,
    postTitle,
    postLink,
    postCategory,
    postContent,
    postPictureKeys: imgURLs,
    thumbnailURL,
    toRemovePicture: [],
    postPicture,
    // originalPictureLength: !!imgURLs ? imgURLs.length : undefined,
  });

  navigation.navigate('AddPost', { origin });
};
export default postEdit;
