import { CreatePostInput, PostStatus, PostType } from '../API';

import { PostStoreType } from '../types/store';
import { S3Object } from '../types/apiResults';
import asyncForEach from './asyncForEach';
import awsmobile from '../aws-exports';
// import reportSentry from './reportSentry';
import uploadToS3 from './uploadToS3';

interface Args {
  username: string;
  postStore: PostStoreType;
  mutationFn: any;
  id: string;
}

const { aws_user_files_s3_bucket_region: region, aws_user_files_s3_bucket: bucket } = awsmobile;

const createPost = async ({ username, postStore, mutationFn, id }: Args) => {
  const { postTitle, postCategory, postLink, postPictureKeys, postContent, thumbnailURL, postTags } = postStore;
  const createdAt = new Date().toISOString();
  try {
    let postPicture: S3Object[] | null = postPictureKeys.length > 0 ? [] : null;
    if (postPictureKeys.length > 0) {
      await asyncForEach(postPictureKeys, async (pathToFile: string, index: number) => {
        const tempArray = pathToFile.split('.');
        const fileExt = tempArray.length > 2 ? `.${tempArray.pop()}` : '';
        const key = `posts/${id}_${index}_${createdAt}${fileExt}`;
        await uploadToS3(pathToFile, key, 'public', 'image/jpeg');
        await postPicture?.push({
          bucket,
          key,
          region,
        });
      });
    }

    let postTagsString = '';

    if (postCategory === 'info' && postTags.length > 0) {
      postTagsString = postTags.join(',');
    }
    const input: CreatePostInput = {
      id,
      postTitle,
      postContent,
      postType: PostType.comm,
      postCategory,
      postAuthorId: username,
      ...(postLink && { postLink }),
      ...(postPicture && { postPicture }),
      ...(postTagsString && { postTags: postTagsString }),
      createdAt,
      numOfComments: 0,
      numOfLikes: 0,
      numOfViews: 0,
      // numOfDislikes: 0,
      thumbnailURL,
      postStatus: PostStatus.open,
    };

    await mutationFn({
      variables: {
        input,
      },
    });
  } catch (e) {
    throw e;
  }
};

export default createPost;
