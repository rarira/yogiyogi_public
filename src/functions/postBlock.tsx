import { Alert } from 'react-native';
import { MutationFunction } from '@apollo/react-common';
import { UpdateBlockInput } from '../API';
import { WarningProps } from '../components/WarningDialog';
import { getMyBlockedList } from '../customGraphqls';
import gql from 'graphql-tag';
import reportSentry from '../functions/reportSentry';

const GET_MY_BLOCKED_LIST = gql(getMyBlockedList);

const postBlock = (
  addPostBlock: MutationFunction,
  postId: string,
  username: string,
  setWarningProps: (arg: Partial<WarningProps> | null) => void,
) => () => {
  const postBlockInput: UpdateBlockInput = {
    blockedBy: username,
    postId,
  };

  const _handleBlock = async () => {
    setWarningProps(null);

    try {
      await addPostBlock({
        variables: { input: postBlockInput },
        optimisticResponse: {
          __typename: 'Mutation',
          addPostBlock: {
            __typename: 'Post',
            id: postId,
            blockedBy: [username],
          },
        },
        update: store => {
          try {
            const queryResult: any = store.readQuery({
              query: GET_MY_BLOCKED_LIST,
              variables: { id: username },
            });

            if (!!queryResult && !!queryResult.getUser) {
              const { blockedPost, ...others } = queryResult.getUser;
              const newArray = (blockedPost || []).concat([postId]);
              const newData = {
                getUser: {
                  blockedPost: newArray,
                  ...others,
                },
              };
              store.writeQuery({
                query: GET_MY_BLOCKED_LIST,
                variables: { id: username },
                data: newData,
              });
            }
          } catch (e) {
            console.log(e);
          }
        },
      });
      Alert.alert('게시물 차단 완료');
    } catch (e) {
      reportSentry(e);
      Alert.alert('에러 발생', e.message);
    }
  };

  setWarningProps!({
    dialogTitle: '게시물 차단',
    dialogContent: `본 게시물을 차단합니다. 한번 차단하면 다시는 내용을 보실 수 없습니다. 그래도 차단하시겠습니까?`,
    handleOk: _handleBlock,
    okText: '예, 차단하겠습니다',
    navigateBack: true,
  });
};

export default postBlock;
