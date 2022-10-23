import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import BackButton from '../BackButton';
import Body from '../Body';
import { CHANGE_ADD_CLASS_STATE } from '../../stores/actionTypes';
import CancelButton from '../CancelButton';
import { Keyboard } from 'react-native';
import KeyboardDismissButton from '../KeyboardDismissButton';
import Left from '../Left';
import PageCounter from '../PageCounter';
import React from 'react';
import Right from '../Right';
import SwitchStackHeader from '../SwitchStackHeader';
import { getCompStyles } from '../../configs/compStyles';
import { TOTAL_ADD_CLASS_PAGE } from '../../configs/variables';

interface Props {
  summary: boolean;
  cancelVisible?: boolean;
  setCancelVisible: (arg: boolean) => void;
  backRoute: string;
  pageCounterNumber: number;
  bannerVisible?: boolean;
  needKeyboardDismissButton?: boolean;
}
const AddClassHeader = ({
  bannerVisible,
  summary,
  cancelVisible,
  setCancelVisible,
  backRoute,
  pageCounterNumber,
  needKeyboardDismissButton,
}: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const compStyles = getCompStyles(appearance);
  const storeDispatch = useStoreDispatch();

  const _handleBackButton = () => storeDispatch({ type: CHANGE_ADD_CLASS_STATE, addClassState: backRoute });
  const _handleCancelButton = () => {
    if (needKeyboardDismissButton) {
      Keyboard.dismiss();
    }
    if (summary) {
      storeDispatch({ type: CHANGE_ADD_CLASS_STATE, addClassState: 'confirmClass', summary });
    } else {
      setCancelVisible(true);
    }
  };
  return (
    <SwitchStackHeader appearance={appearance} {...(bannerVisible && { style: compStyles.opacity01 })} appearance={appearance}>
      <Left>
        <BackButton {...(summary && { style: compStyles.displayNone })} onPress={_handleBackButton} disabled={bannerVisible || cancelVisible} />
      </Left>
      <Body>
        <PageCounter pageNumber={pageCounterNumber} totalPageNumber={TOTAL_ADD_CLASS_PAGE} />
      </Body>
      <Right>
        {needKeyboardDismissButton && <KeyboardDismissButton needMarginRight />}
        <CancelButton onPress={_handleCancelButton} disabled={bannerVisible || cancelVisible} />
      </Right>
    </SwitchStackHeader>
  );
};

export default AddClassHeader;
