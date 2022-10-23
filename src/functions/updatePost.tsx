import { PostStatus, UpdatePostInput } from '../API';

import { Keyboard } from 'react-native';
import { PostStoreType } from '../types/store';
import { S3Object } from '../types/apiResults';
import asyncForEach from './asyncForEach';
import awsmobile from '../aws-exports';
import compact from 'lodash/compact';
import { customGetPost } from '../customGraphqls';
import gql from 'graphql-tag';
// import reportSentry from './reportSentry';
import uploadToS3 from './uploadToS3';

interface Args {
  postStore: PostStoreType;
  mutationFn: any;
}

const { aws_user_files_s3_bucket_region: region, aws_user_files_s3_bucket: bucket } = awsmobile;
const GET_POST = gql(customGetPost);

const updatePost = async ({ postStore, mutationFn }: Args) => {
  const {
    postId,
    // postCreatedAt,
    postTitle,
    postCategory,
    postLink,
    postPictureKeys,
    postContent,
    thumbnailURL,
    toRemovePicture,
    postPicture,
  } = postStore;

  // console.log('updatePost', postPictureKeys, toRemovePicture, postPicture);
  Keyboard.dismiss();
  try {
    let newPostPicture: Array<S3Object | null> = postPicture ?? [];

    if (toRemovePicture.length > 0) {
      await asyncForEach(toRemovePicture, (item: number) => {
        newPostPicture![item] = null;
      });
    }
    await asyncForEach(newPostPicture, (item: any) => {
      if (!!item) {
        delete item.__typename;
      }
    });

    if (postPictureKeys.length > 0) {
      await asyncForEach(postPictureKeys, async (pathToFile: string | null, index: number) => {
        if (!!pathToFile && !pathToFile.startsWith('http')) {
          const tempArray = pathToFile.split('.');
          const fileExt = tempArray.length > 2 ? `.${tempArray.pop()}` : '';
          const key = `posts/${postId}_${index}${fileExt}`;
          await uploadToS3(pathToFile, key, 'public', 'image/jpeg');
          await newPostPicture.push({
            bucket,
            key,
            region,
          });
        }
      });
    }
    // console.log(newPostPicture, thumbnailURL);
    let finalPostPicture = compact(newPostPicture);
    let updatedThumbnailURL = finalPostPicture.length > 0 ? null : thumbnailURL;
    let url = postLink;
    if (!!url && !(url.startsWith('http') || url.startsWith('https'))) {
      url = 'http://' + postLink;
    }

    const input: UpdatePostInput = {
      id: postId!,
      // createdAt: postCreatedAt!,
      postTitle,
      postContent,
      //comm,
      postCategory,
      // postAuthorId: username,
      ...(postLink && { postLink: url }),
      ...(newPostPicture && { postPicture: finalPostPicture }),
      // numOfComments: 0,
      // numOfLikes: 0,
      // numOfViews: 0,
      // numOfDislikes: 0,
      thumbnailURL: updatedThumbnailURL,
      postStatus: PostStatus.open,
    };

    await mutationFn({
      variables: {
        input,
      },

      update: (store, { data: { updatePost } }) => {
        store.writeQuery({
          query: GET_POST,
          variables: { id: postId! },
          data: { getPost: updatePost },
        });
      },
      // refetchQueries: {
      //   query: GET_POST,
      //   variables: { id: postId! },
      // },
    });
  } catch (e) {
    throw e;
  }
};

export default updatePost;
