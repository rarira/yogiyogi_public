import MySnackbar, { snackbarInitialState, snackbarReducer } from '../MySnackbar';
import React, { Ref, memo, useCallback, useReducer } from 'react';

import PostTags from './PostTags';
import RBSheet from 'react-native-raw-bottom-sheet';

import getDimensions from '../../functions/getDimensions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCompStyles } from '../../configs/compStyles';
import { useStoreState } from '../../stores/initStore';

interface Props {
  postTags: string[];
  bottomSheetEl: Ref<RBSheet>;
}

const AddPostBottomSheet = ({ postTags, bottomSheetEl }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const insets = useSafeAreaInsets();
  const compStyles = getCompStyles(appearance);

  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);

  const { SCREEN_HEIGHT, STATUS_BAR_HEIGHT, HEADER_HEIGHT } = getDimensions();

  const _handleClose = useCallback(() => bottomSheetEl!.current!.close(), [bottomSheetEl]);

  const height = Math.min(550, SCREEN_HEIGHT - HEADER_HEIGHT - STATUS_BAR_HEIGHT);

  const renderTerms = () => {
    return <PostTags handleClose={_handleClose} snackbarDispatch={snackbarDispatch} />;
  };

  const customStyles = {
    container: {
      ...compStyles.bottomSheetContainer,
      paddingBottom: insets.bottom,
    },
  };

  return (
    <>
      <RBSheet
        ref={bottomSheetEl}
        height={height}
        duration={250}
        customStyles={customStyles}
        // onClose={_handleSheetClose}
        closeOnDragDown={false}
      >
        {renderTerms()}
        <MySnackbar dispatch={snackbarDispatch} snackbarState={snackbarState} />
      </RBSheet>
    </>
  );
};

export default memo(AddPostBottomSheet);
