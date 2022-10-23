import { Dialog } from 'react-native-paper';
import React, { memo, useState } from 'react';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import AddClassHeader from './AddClassHeader';
import { CHANGE_ADD_CLASS_STATE } from '../../stores/actionTypes';
import { CLASS_TAG_LIMIT } from '../../configs/variables';
import HeadlineSub from '../HeadlineSub';
import MyDialogContainer from '../MyDialogContainer';
import { MySnackbarAction } from '../MySnackbar';
import NextProcessButton from '../NextProcessButton';
import { ScrollView } from 'react-native';
import SelectTags from '../SelectTags';

import ThemedButton from '../ThemedButton';
import { getCompStyles } from '../../configs/compStyles';
import { getTheme } from '../../configs/theme';
import MyDialogTitle from '../MyDialogTitle';
import DialogContentText from '../DialogContentText';

interface Props {
  setCancelVisible: (arg: boolean) => void;
  snackbarDispatch: (arg: MySnackbarAction) => void;
}

const TagClass = ({ setCancelVisible, snackbarDispatch }: Props) => {
  const [visible, setVisible] = useState(false);

  const storeDispatch = useStoreDispatch();
  const {
    classStore: { summary, tags },
    authStore: { appearance },
  } = useStoreState();
  const [selectedTags, setSelectedTags] = useState<string[]>(tags);
  const compStyles = getCompStyles(appearance);
  const theme = getTheme(appearance);

  const onPress = () => {
    if (selectedTags.length === 0) {
      setVisible(true);
    } else {
      storeDispatch({
        type: CHANGE_ADD_CLASS_STATE,
        addClassState: summary ? 'confirmClass' : 'classFeeClass',
        tags: selectedTags,
      });
    }
  };

  return (
    <>
      <AddClassHeader backRoute="myCenterClass" setCancelVisible={setCancelVisible} summary={summary} pageCounterNumber={6} />
      <ScrollView
        alwaysBounceVertical={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[compStyles.scrollViewContainer, compStyles.screenMarginHorizontal]}
      >
        <HeadlineSub text={`클래스 특징을 최대 ${CLASS_TAG_LIMIT}개의 키워드로 선택해 주세요`} />
        <SelectTags selectedTags={selectedTags} setSelectedTags={setSelectedTags} snackbarDispatch={snackbarDispatch} />
        <NextProcessButton children={summary ? '수정 완료' : ''} onPress={onPress} marginHorizontalNeedless />
      </ScrollView>
      <MyDialogContainer
        visible={visible}
        onDismiss={() => {
          setVisible(false);
        }}
        // dismissable={false}
      >
        <MyDialogTitle>선택한 키워드 없음</MyDialogTitle>
        <Dialog.Content>
          <DialogContentText text="키워드를 입력하셔야 많은 사용자에게 검색됩니다. 그래도 그대로 진행하시겠습니까?" />
        </Dialog.Content>
        <Dialog.Actions>
          <ThemedButton
            onPress={() => {
              setVisible(false);
            }}
          >
            다시 선택
          </ThemedButton>
          <ThemedButton
            onPress={() => {
              storeDispatch({ type: CHANGE_ADD_CLASS_STATE, addClassState: 'classFeeClass', tags: [] });
            }}
            color={theme.colors.accent}
          >
            그대로 진행
          </ThemedButton>
        </Dialog.Actions>
      </MyDialogContainer>
    </>
  );
};

export default memo(TagClass);
