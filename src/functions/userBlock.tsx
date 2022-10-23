import { Alert } from 'react-native';
import { MutationFunction } from '@apollo/react-common';
import { UpdateBlockInput } from '../API';
import { WarningProps } from '../components/WarningDialog';
import { getMyBlockedList } from '../customGraphqls';
import gql from 'graphql-tag';
import reportSentry from '../functions/reportSentry';

const GET_MY_BLOCKED_LIST = gql(getMyBlockedList);

const userBlock = (
  addUserBlock: MutationFunction,
  userId: string,
  username: string,
  setWarningProps: (arg: Partial<WarningProps> | null) => void,
) => () => {
  const userBlockInput: UpdateBlockInput = {
    blockedBy: username,
    userId,
  };

  const _handleBlock = async () => {
    try {
      await addUserBlock({
        variables: { input: userBlockInput },
        optimisticResponse: {
          __typename: 'Mutation',
          addUserBlock: {
            __typename: 'User',
            id: userId,
            blockedBy: [username],
          },
        },
        update: store => {
          try {
            const queryResult: any = store.readQuery({
              query: GET_MY_BLOCKED_LIST,
              variables: { id: username },
            });
            const { blockedUser, ...others } = queryResult.getUser;
            const newArray = (blockedUser || []).concat([userId]);
            const newData = {
              getUser: {
                blockedUser: newArray,
                ...others,
              },
            };
            store.writeQuery({ query: GET_MY_BLOCKED_LIST, variables: { id: username }, data: newData });
          } catch (e) {
            console.log(e);
          }
        },
      });
      Alert.alert('사용자 차단 완료');
    } catch (e) {
      reportSentry(e);
      Alert.alert('에러 발생', e.message);
    }
  };

  setWarningProps!({
    dialogTitle: '사용자 차단',
    dialogContent: `본 사용자를 차단합니다. 한번 차단하면 해당 사용자의 프로필, 채팅방, 클래스 등 관련 내용을 보실 수 없습니다. 그래도 차단하시겠습니까?`,
    handleOk: _handleBlock,
    okText: '예, 차단하겠습니다',
    navigateBack: true,
  });
};

export default userBlock;
