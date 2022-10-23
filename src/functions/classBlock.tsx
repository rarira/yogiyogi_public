import { Alert } from 'react-native';
import { MutationFunction } from '@apollo/react-common';
import { UpdateBlockInput } from '../API';
import { WarningProps } from '../components/WarningDialog';
import { getMyBlockedList } from '../customGraphqls';
import gql from 'graphql-tag';
import reportSentry from '../functions/reportSentry';

const GET_MY_BLOCKED_LIST = gql(getMyBlockedList);

const classBlock = (
  addClassBlock: MutationFunction,
  classId: string,
  username: string,
  setWarningProps: (arg: Partial<WarningProps> | null) => void,
) => () => {
  const classBlockInput: UpdateBlockInput = {
    blockedBy: username,
    classId,
  };

  const _handleBlock = async () => {
    try {
      await addClassBlock({
        variables: { input: classBlockInput },
        optimisticResponse: {
          __typename: 'Mutation',
          addClassBlock: {
            __typename: 'Class',
            id: classId,
            blockedBy: [username],
          },
        },
        update: store => {
          // console.log(store);
          try {
            const queryResult: any = store.readQuery({
              query: GET_MY_BLOCKED_LIST,
              variables: { id: username },
            });
            // console.log(queryResult);
            if (!!queryResult && !!queryResult?.getUser) {
              const { blockedClass, ...others } = queryResult.getUser;
              const newArray = (blockedClass || []).concat([classId]);
              const newData = {
                getUser: {
                  blockedClass: newArray,
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
      Alert.alert('클래스 차단 완료');
    } catch (e) {
      reportSentry(e);
      Alert.alert('에러 발생', e.message);
    }
  };

  setWarningProps!({
    dialogTitle: '클래스 차단',
    dialogContent: `본 클래스를 차단합니다. 한번 차단하면 다시는 내용을 보실 수 없습니다. 그래도 차단하시겠습니까?`,
    handleOk: _handleBlock,
    okText: '예, 차단하겠습니다',
    navigateBack: true,
  });
};

export default classBlock;
