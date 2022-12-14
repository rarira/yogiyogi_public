import { Dialog } from 'react-native-paper';
import { ClassFeeClass, ConfirmClass, DateClass, DayClass, MemoClass, MyCenterClass, TagClass, TimeClass, TitleClass } from '../components/addClass';
import MySnackbar, { snackbarInitialState, snackbarReducer } from '../components/MySnackbar';
import React, { memo, useEffect, useReducer, useState } from 'react';
import WarningDialog, { WarningProps } from '../components/WarningDialog';
import { useStoreDispatch, useStoreState } from '../stores/initStore';

import CancelDialog from '../components/CancelDialog';
import { ClassStoreType } from '../types/store';
import KoreanParagraph from '../components/KoreanParagraph';
import ModalScreenContainer from './ModalScreenContainter';
import MyDialogContainer from '../components/MyDialogContainer';
import { NavigationStackScreenProps } from 'react-navigation-stack';
import NeedProfileUpdate from '../components/NeedProfileUpdate';
import { RESET_CLASS_STATE } from '../stores/actionTypes';
import asyncCheckScreenIsFirst from '../functions/asyncCheckScreenIsFirst';
import reportSentry from '../functions/reportSentry';

import useHandleAndroidBack from '../functions/handleAndroidBack';
import ThemedButton from '../components/ThemedButton';
import { getStyles } from '../configs/styles';
import MyDialogTitle from '../components/MyDialogTitle';
import { getThemeColor } from '../configs/theme';
import ExpireClass from '../components/addClass/ExpireClass';

interface Props extends NavigationStackScreenProps {}

const AddClassScreen = ({ navigation }: Props) => {
  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);
  const [cancelVisible, setCancelVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [repostVisible, setRepostVisible] = useState<boolean | null>(null);
  const [warningProps, setWarningProps] = useState<Partial<WarningProps> | null>(null);

  const origin = navigation.getParam('origin');

  const {
    classStore,
    authStore: { user, profileUpdated, isFirst, identityId, appearance },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();
  const styles = getStyles(appearance);

  useEffect(() => {
    let _mounted = true;
    if (_mounted && !classStore.updateMode) {
      if (user) {
        (async function() {
          try {
            const isFirstTime = asyncCheckScreenIsFirst('AddClass', isFirst, storeDispatch);
            // const isFirstTime = true;
            if (isFirstTime) {
              setDialogVisible(true);
            }
          } catch (e) {
            reportSentry(e);
          }
        })();
      }
    }
    return () => {
      _mounted = false;
    };
  }, [classStore.updateMode]);

  useEffect(() => {
    let _mounted = true;
    if (_mounted && classStore.repostMode && !!repostVisible === null) {
      setRepostVisible(true);
    }
    return () => {
      _mounted = false;
    };
  }, [classStore.repostMode]);

  useHandleAndroidBack(navigation, () => setCancelVisible(true));

  const renderAddClassComponent = (classStore: ClassStoreType) => {
    if (!user) return null;
    switch (classStore.addClassState) {
      case 'init':
      case 'titleClass':
        return <TitleClass navigation={navigation} />;

      case 'dateClass':
        return (
          <DateClass
            cancelVisible={cancelVisible}
            setCancelVisible={setCancelVisible}
            snackbarDispatch={snackbarDispatch}
            setWarningProps={setWarningProps}
          />
        );

      case 'dayClass':
        return <DayClass cancelVisible={cancelVisible} setCancelVisible={setCancelVisible} />;

      case 'timeClass':
        return <TimeClass cancelVisible={cancelVisible} setCancelVisible={setCancelVisible} snackbarDispatch={snackbarDispatch} />;
      case 'expireClass':
        return <ExpireClass setCancelVisible={setCancelVisible} snackbarDispatch={snackbarDispatch} />;
      case 'myCenterClass':
        return <MyCenterClass setCancelVisible={setCancelVisible} snackbarDispatch={snackbarDispatch} />;
      case 'tagClass':
        return <TagClass setCancelVisible={setCancelVisible} snackbarDispatch={snackbarDispatch} />;
      case 'classFeeClass':
        return <ClassFeeClass setCancelVisible={setCancelVisible} />;

      case 'memoClass':
        return <MemoClass setCancelVisible={setCancelVisible} />;

      case 'confirmClass':
        return <ConfirmClass cancelVisible={cancelVisible} setCancelVisible={setCancelVisible} snackbarDispatch={snackbarDispatch} origin={origin} />;
      default:
        return null;
    }
  };

  const _handleDialogDismiss = () => setDialogVisible(false);
  const _handleRepostDialogDismiss = () => setRepostVisible(false);

  const _navToHelp = () => {
    setDialogVisible(false);
    navigation.push('AddClassHelp');
  };
  const _handleCancelOnPress = () => {
    storeDispatch({
      type: RESET_CLASS_STATE,
    });
    navigation.navigate(`${classStore.updateMode ? 'ClassView' : 'Home'}`);
  };
  return (
    <ModalScreenContainer
      children1={renderAddClassComponent(classStore)}
      children2={
        <>
          {!!user && (
            <NeedProfileUpdate
              profileUpdated={profileUpdated}
              // setNeedProfileUpdateVisible={setNeedProfileUpdateVisible}
              params={{ userId: user?.username ?? '', identityId }}
              appearance={appearance}
            />
          )}

          <MySnackbar dispatch={snackbarDispatch} snackbarState={snackbarState} />
          <CancelDialog
            cancelVisible={cancelVisible}
            setCancelVisible={setCancelVisible}
            title={`????????? ${classStore.updateMode ? '??????' : '??????'} ??????`}
            onCancel={_handleCancelOnPress}
            appearance={appearance}
          />
          <MyDialogContainer visible={dialogVisible} onDismiss={_handleDialogDismiss} dismissable={false}>
            <MyDialogTitle>????????? ????????? ????????????????</MyDialogTitle>
            <Dialog.Content>
              <KoreanParagraph text="????????? ????????? ????????? ?????? ?????? ????????? ????????? ?????????????" textStyle={styles.dialogContentWarningText} />
            </Dialog.Content>
            <Dialog.Actions>
              <ThemedButton color={getThemeColor('accent', appearance)} onPress={_navToHelp}>
                ???
              </ThemedButton>
              <ThemedButton onPress={_handleDialogDismiss}>?????????, ??????????????????</ThemedButton>
            </Dialog.Actions>
          </MyDialogContainer>
          <MyDialogContainer visible={!!repostVisible} onDismiss={_handleRepostDialogDismiss} dismissable={false}>
            <MyDialogTitle>????????? ????????? ?????? ??????</MyDialogTitle>
            <Dialog.Content>
              <KoreanParagraph text="?????? ???????????? ????????? ????????? ???????????? ?????? ????????? ????????? ???????????????." textStyle={styles.listItemTitle} />
              <KoreanParagraph text="??????, ?????? ??? ????????? ????????? ?????? ???????????? ?????????." textStyle={styles.dialogContentWarningText} />
            </Dialog.Content>
            <Dialog.Actions>
              <ThemedButton onPress={_handleRepostDialogDismiss}>???</ThemedButton>
              {/* <ThemedButton onPress={_handleRepostDialogDismiss}>?????????, ??????????????????</ThemedButton> */}
            </Dialog.Actions>
          </MyDialogContainer>

          {warningProps && (
            <WarningDialog
              {...warningProps}
              handleDismiss={() => setWarningProps(null)}
              dismissable
              dismissText="?????????"
              visible
              snackbarDispatch={snackbarDispatch}
              origin={origin}
              navigation={navigation}
              appearance={appearance}
            />
          )}
        </>
      }
    />
  );
};

export default memo(AddClassScreen);
