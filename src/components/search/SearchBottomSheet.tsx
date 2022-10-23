import MySnackbar, { snackbarInitialState, snackbarReducer } from '../MySnackbar';
import React, { ReducerAction, memo, useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

import DateStartTerm from './DateStartTerm';
import DurationTerm from './DurationTerm';
import FeeTerm from './FeeTerm';
import RBSheet from 'react-native-raw-bottom-sheet';
import RegionTerm from './RegionTerm';
import TagTerm from './TagTerm';
import { TermState } from '../../stores/ClassStore';
import TimeStartTerm from './TimeStartTerm';

import getDimensions from '../../functions/getDimensions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppearanceType } from '../../types/store';
import { getCompStyles } from '../../configs/compStyles';

interface Props {
  termState: TermState;
  dispatch: (arg: ReducerAction<any>) => void;
  appearance: AppearanceType;
}

const SearchBottomSheet = ({ termState, dispatch, appearance }: Props) => {
  const compStyles = getCompStyles(appearance);

  const insets = useSafeAreaInsets();
  const bottomSheetEl = useRef<RBSheet>(null);
  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);

  const { termMode, durationTerm, dateStartTerm, timeStartTerm, regionTerm, tagTerm, feeTerm } = termState;
  const { SCREEN_HEIGHT, STATUS_BAR_HEIGHT, HEADER_HEIGHT } = getDimensions();

  useEffect(() => {
    if (termMode !== '') {
      bottomSheetEl!.current!.open();
    }
  }, [termMode]);

  const _handleClose = useCallback(() => bottomSheetEl!.current!.close(), [bottomSheetEl]);

  const height = useMemo(() => {
    switch (termMode) {
      case 'durationTerm':
        return 200 + insets.bottom;
      case 'dateStartTerm':
        return 420 + insets.bottom;
      case 'timeStartTerm':
        return 300;
      case 'regionTerm':
        return Math.min(580, SCREEN_HEIGHT - HEADER_HEIGHT - STATUS_BAR_HEIGHT);
      case 'tagTerm':
        return Math.min(550, SCREEN_HEIGHT - HEADER_HEIGHT - STATUS_BAR_HEIGHT);
      case 'feeTerm':
        return 380;
      default:
        return 300;
    }
  }, [termMode]);

  const renderTerms = () => {
    switch (termMode) {
      case 'durationTerm':
        return <DurationTerm termDispatch={dispatch} handleClose={_handleClose} durationTerm={durationTerm} />;

      case 'dateStartTerm':
        return <DateStartTerm termDispatch={dispatch} handleClose={_handleClose} dateStartTerm={dateStartTerm} />;
      case 'timeStartTerm':
        return (
          <TimeStartTerm
            termDispatch={dispatch}
            handleClose={_handleClose}
            timeStartTerm={timeStartTerm}
            appearance={appearance}
          />
        );
      case 'regionTerm':
        return <RegionTerm termDispatch={dispatch} handleClose={_handleClose} regionTerm={regionTerm} />;
      case 'tagTerm':
        return (
          <TagTerm
            termDispatch={dispatch}
            handleClose={_handleClose}
            tagTerm={tagTerm}
            snackbarDispatch={snackbarDispatch}
          />
        );
      case 'feeTerm':
        return <FeeTerm termDispatch={dispatch} handleClose={_handleClose} feeTerm={feeTerm} />;
    }
  };

  const customStyles = {
    container: {
      ...compStyles.bottomSheetContainer,
      paddingBottom: insets.bottom,
    },
  };

  const _handleSheetClose = () => dispatch({ type: 'setTermMode', termMode: '' });
  return (
    <>
      <RBSheet
        ref={bottomSheetEl}
        height={height}
        openDuration={250}
        customStyles={customStyles}
        onClose={_handleSheetClose}
        closeOnDragDown={false}
      >
        {renderTerms()}
        <MySnackbar dispatch={snackbarDispatch} snackbarState={snackbarState} />
      </RBSheet>
    </>
  );
};

export default memo(SearchBottomSheet);
