import React, { memo } from 'react';

import { UpdateBlockInput } from '../../API';
import { WarningProps } from '../WarningDialog';
import { customAddClassBlock } from '../../customGraphqls';
import gql from 'graphql-tag';

import throttle from 'lodash/throttle';
import { useMutation } from '@apollo/react-hooks';
import { useStoreState } from '../../stores/initStore';
import ThemedButton from '../ThemedButton';
import { getTheme } from '../../configs/theme';

interface Props {
  classId: string;
  setWarningProps: (arg: Partial<WarningProps> | null) => void;
}

const ADD_CLASS_BLOCK = gql(customAddClassBlock);

const BlockButton = ({ classId, setWarningProps }: Props) => {
  const [classBlock, { loading }] = useMutation(ADD_CLASS_BLOCK);
  const {
    authStore: {
      user: { username, appearance },
    },
  } = useStoreState();

  const theme = getTheme(appearance);

  const _handleWarnings = (handleOk: () => void, loading: boolean) => {
    setWarningProps({
      dialogTitle: '클래스 차단',
      dialogContent: `본 클래스를 차단합니다. 한번 차단하면 다시는 내용을 보실 수 없습니다. 그래도 차단하시겠습니까?`,
      handleOk,
      okText: '예, 차단하겠습니다',
      loading,
      navigateBack: true,
    });
  };

  const _handleOnPress = () => {
    const mutationFunction = throttle(async () => {
      const classBlockInput: UpdateBlockInput = {
        blockedBy: username,
        classId,
      };
      try {
        await classBlock({
          variables: { input: classBlockInput },
          // refetchQueries,
          optimisticResponse: {
            __typename: 'Mutation',
            addClassBlock: {
              __typename: 'Class',
              id: classId,
              blockedBy: [username],
            },
          },
        });
      } catch (e) {
        //스크린에서 처리할 수 있게 에러를 던짐
        throw e;
      }
    }, 1000);
    _handleWarnings(mutationFunction, loading);
  };

  return (
    <ThemedButton mode="text" icon="content-cut" color={theme.colors.accent} onPress={_handleOnPress}>
      차단
    </ThemedButton>
  );
};

export default memo(BlockButton);
