import { CANCEL_COMMENT_INPUT, SET_COMMENT_STATE } from '../../stores/actionTypes';
import { CommentDepth, CommentNotiStatus, CommentStatus, CommentType, CreateCommentInput } from '../../API';
import { Keyboard, TextInput } from 'react-native';
import { MySnackbarAction, OPEN_SNACKBAR } from '../MySnackbar';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { Ref } from 'react';
import {
  customCreateComment,
  customListCommentsByAddedTo,
  customUpdateComment,
  customUpdateCommentNumbers,
  customUpdatePostNumbers,
} from '../../customGraphqls';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import BottomStickyInput from '../BottomStickyInput';
import { MAX_COMMENT_LENGTH } from '../../configs/variables';
import gql from 'graphql-tag';
import reportSentry from '../../functions/reportSentry';
import throttle from 'lodash/throttle';
import { useMutation } from '@apollo/react-hooks';
import uuidv4 from 'uuid/v4';

interface Props extends NavigationInjectedProps {
  commentViewReceiverId?: string;
  snackbarDispatch: (arg: MySnackbarAction) => void;
  textInputEl: Ref<TextInput>;
  origin: string;
  setNeedProfileUpdateVisible: (arg: boolean) => void;
}

const CREATE_COMMENT = gql(customCreateComment);
const UPDATE_POST_NUMBERS = gql(customUpdatePostNumbers);
const UPDATE_COMMENT_NUMBERS = gql(customUpdateCommentNumbers);
const UPDATE_COMMENT = gql(customUpdateComment);

const LIST_COMMENTS_OF_POST = gql(customListCommentsByAddedTo);
// const GET_POST = gql(customGetPost);

const PostCommentInput = ({ snackbarDispatch, textInputEl, origin, setNeedProfileUpdateVisible }: Props) => {
  const {
    authStore: { user, profileName, profileUpdated },
    commentStore,
  } = useStoreState();
  const storeDispatch = useStoreDispatch();

  const {
    postId,
    postAuthorId,
    postTitle,
    editComment,
    replyToComment,
    content,
    // receiverId,
    receiverName,
    commentViewAddedToId,
    commentViewAuthorId,
  } = commentStore;

  const [createCommentFn, { loading: ccLoading }] = useMutation(CREATE_COMMENT);
  const [updatePostNumbers, { loading: upLoading }] = useMutation(UPDATE_POST_NUMBERS);
  const [updateCommentNumbers, { loading: ucnLoading }] = useMutation(UPDATE_COMMENT_NUMBERS);
  const [updateComment, { loading: ucLoading }] = useMutation(UPDATE_COMMENT);

  const isMain =
    (!!editComment && editComment.commentDepth === CommentDepth.MAIN) || (!replyToComment && origin !== 'CommentView');

  const id = uuidv4();
  const addedToId =
    origin === 'PostCommentView'
      ? postId
      : !replyToComment
      ? commentViewAddedToId
      : replyToComment.commentDepth === CommentDepth.MAIN
      ? replyToComment.id
      : replyToComment.addedToId;

  const commentReceiverId =
    origin === 'PostCommentView' ? postAuthorId : !replyToComment ? commentViewAuthorId : replyToComment.author.id;

  const replyInfo = {
    repliedToId: !!replyToComment ? replyToComment.id : origin === 'PostCommentView' ? postId : commentViewAddedToId,
    // repliedToType: !!replyToComment ? ReplyType.COMMENT : ReplyType.POST,
    repliedPostTitle: postTitle,
  };

  const _handleOnCancel = () => {
    Keyboard.dismiss();
    storeDispatch({ type: CANCEL_COMMENT_INPUT });
  };

  // console.log('store:', commentStore, profileName);

  const _handleOnPress = throttle(async () => {
    if (!profileUpdated) {
      setNeedProfileUpdateVisible(true);
    } else if (content.length > MAX_COMMENT_LENGTH) {
      snackbarDispatch({ type: OPEN_SNACKBAR, message: `${MAX_COMMENT_LENGTH}를 초과했습니다` });
    } else {
      Keyboard.dismiss();
      try {
        const createdAt = new Date().toISOString();

        if (!editComment) {
          const input: CreateCommentInput = {
            id,
            addedToId,
            originalId: postId,
            commentAuthorId: user.username,
            commentAuthorName: profileName,
            commentReceiverId,
            createdAt,
            commentType: CommentType.POST,
            commentDepth: isMain ? CommentDepth.MAIN : CommentDepth.SUB,
            commentStatus: CommentStatus.OPEN,
            commentNotiStatus: CommentNotiStatus.OPEN,
            commentContent: content,
            numOfSub: 0,
            numOfReported: 0,
            numOfLikes: 0,
            replyInfo,
          };

          // console.log(input);

          // Comment DB 생성
          await createCommentFn({
            variables: { input },
            update: (store, { data }) => {
              const variables = {
                addedToId,
                sortDirection: 'ASC',
                limit: 20,
                // ...(origin === 'PostCommentView' && {
                filter: { not: { and: [{ commentStatus: { eq: CommentStatus.DELETED } }, { numOfSub: { eq: 0 } }] } },
                // }),
              };

              try {
                const queryResult: any = store.readQuery({
                  query: LIST_COMMENTS_OF_POST,
                  variables,
                });

                if (!!queryResult && !!queryResult?.listCommentsByAddedTo) {
                  const { items, ...others } = queryResult.listCommentsByAddedTo;
                  const newArray = (items || []).concat([data.createComment]);
                  const newData = {
                    listCommentsByAddedTo: {
                      items: newArray,
                      ...others,
                    },
                  };
                  store.writeQuery({
                    query: LIST_COMMENTS_OF_POST,
                    variables,
                    data: newData,
                  });
                }
              } catch (e) {
                console.log(e);
              }
            },
          });

          // Post DB의 numOfComments +1 생성
          await updatePostNumbers({
            variables: {
              id: postId,
              // postCreatedAt,
              toAdd: 'numOfComments',
            },
            // update: (store, { data }) => {
            //   const variables = { id: postId };
            //   try {
            //     const queryResult: any = store.readQuery({
            //       query: GET_POST,
            //       variables,
            //     });

            //     if (!!queryResult && !!queryResult?.getPost) {
            //       const { numOfComments, numOfLikes, numOfViews, ...others } = queryResult.getPost;
            //       const {
            //         numOfComments: newNumOfComments,
            //         numOfLikes: newNumOfLikes,
            //         numOfViews: newNumOfViews,
            //       } = data.updatePostNumbers;
            //       const newData = {
            //         getPost: {
            //           numOfComments: newNumOfComments,
            //           numOfLikes: newNumOfLikes,
            //           numOfViews: newNumOfViews,
            //           ...others,
            //         },
            //       };
            //       store.writeQuery({
            //         query: GET_POST,
            //         variables,
            //         data: newData,
            //       });
            //     }
            //   } catch (e) {
            //     console.log(e);
            //   }
            // },
          });

          // 상위 MAIN depth Commnet DB의 numOfSub +1 생성
          if (!isMain) {
            await updateCommentNumbers({
              variables: {
                commentId: addedToId,
                userId: user.username,
                addSub: id,
              },
            });
          }
          // 댓글 생성 초기화

          snackbarDispatch({
            type: OPEN_SNACKBAR,
            message: `댓글 ${!!editComment ? '수정' : '작성'} 완료`,
            sideEffect: () => _handleOnCancel(),
          });
        } else {
          // 댓글 내용 수정
          await updateComment({
            variables: {
              input: {
                id: editComment.id,
                commentContent: content,
                commentNotiStatus: editComment.commentNotiStatus,
                createdAt: editComment.createdAt,
              },
            },
          });

          // 댓글 수정 초기화
          _handleOnCancel();
        }
      } catch (e) {
        reportSentry(e);
        snackbarDispatch({
          type: OPEN_SNACKBAR,
          message: `${origin === 'CommentView' ? '답글' : '댓글'} 작성 실패`,
        });
      }
      // finally {
      // }
    }
  }, 5000);

  const _setContent = (text: string) => storeDispatch({ type: SET_COMMENT_STATE, content: text });
  const editable = !(origin === 'CommentView' && !replyToComment && !editComment);
  return (
    <BottomStickyInput
      text={content}
      prefix={receiverName}
      setText={_setContent}
      handleOnPress={_handleOnPress}
      placeholder={
        editable
          ? `${origin === 'CommentView' ? '답글' : '댓글'} 내용을 입력하세요...`
          : `'답글 달기'를 눌러 답글을 달 댓글을 선택하세요`
      }
      maxLength={MAX_COMMENT_LENGTH}
      usingAccessoryView={false}
      loading={ccLoading || upLoading || ucnLoading || ucLoading}
      textInputEl={textInputEl}
      editComment={editComment}
      editable={editable}
      replyToComment={replyToComment}
    />
  );
};

export default withNavigation(PostCommentInput);
