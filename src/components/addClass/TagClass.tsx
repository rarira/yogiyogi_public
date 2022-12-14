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
        <HeadlineSub text={`????????? ????????? ?????? ${CLASS_TAG_LIMIT}?????? ???????????? ????????? ?????????`} />
        <SelectTags selectedTags={selectedTags} setSelectedTags={setSelectedTags} snackbarDispatch={snackbarDispatch} />
        <NextProcessButton children={summary ? '?????? ??????' : ''} onPress={onPress} marginHorizontalNeedless />
      </ScrollView>
      <MyDialogContainer
        visible={visible}
        onDismiss={() => {
          setVisible(false);
        }}
        // dismissable={false}
      >
        <MyDialogTitle>????????? ????????? ??????</MyDialogTitle>
        <Dialog.Content>
          <DialogContentText text="???????????? ??????????????? ?????? ??????????????? ???????????????. ????????? ????????? ?????????????????????????" />
        </Dialog.Content>
        <Dialog.Actions>
          <ThemedButton
            onPress={() => {
              setVisible(false);
            }}
          >
            ?????? ??????
          </ThemedButton>
          <ThemedButton
            onPress={() => {
              storeDispatch({ type: CHANGE_ADD_CLASS_STATE, addClassState: 'classFeeClass', tags: [] });
            }}
            color={theme.colors.accent}
          >
            ????????? ??????
          </ThemedButton>
        </Dialog.Actions>
      </MyDialogContainer>
    </>
  );
};

export default memo(TagClass);
