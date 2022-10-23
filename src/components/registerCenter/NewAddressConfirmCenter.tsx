import { Dialog } from 'react-native-paper';
import { CHANGE_REGISTER_CENTER_STATE, RESET_CENTER_STATE } from '../../stores/actionTypes';
import { Keyboard, TouchableWithoutFeedback, View } from 'react-native';
import { MySnackbarAction, OPEN_SNACKBAR } from '../MySnackbar';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { useMemo, useState } from 'react';
import { createCenter, createMyCenter } from '../../graphql/mutations';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import BackButton from '../BackButton';
import Body from '../Body';
import CancelButton from '../CancelButton';
import { CenterType } from '../../API';
import FocusText from '../FocusText';
import HeadlineSub from '../HeadlineSub';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import KeyboardDismissButton from '../KeyboardDismissButton';
import Left from '../Left';
import MyDialogContainer from '../MyDialogContainer';
import NextProcessButton from '../NextProcessButton';
import PageCounter from '../PageCounter';
import Right from '../Right';
import SingleLineInputField from '../SingleLineInputField';
import SwitchStackHeader from '../SwitchStackHeader';

import { customListMyCentersByUser } from '../../customGraphqls';
import gql from 'graphql-tag';
import produce from 'immer';
import reportSentry from '../../functions/reportSentry';
import throttle from 'lodash/throttle';
import { useMutation } from '@apollo/react-hooks';
import uuidv4 from 'uuid/v4';
import ThemedButton from '../ThemedButton';
import { getCompStyles } from '../../configs/compStyles';
import MyDialogTitle from '../MyDialogTitle';
import DialogContentText from '../DialogContentText';

interface Props extends NavigationInjectedProps {
  snackbarDispatch: (arg: MySnackbarAction) => void;
  setCancelVisible: (arg: boolean) => void;
}

const CREATE_CENTER = gql(createCenter);
const CREATE_MY_CENTER = gql(createMyCenter);
const LIST_MY_CENTERS = gql(customListMyCentersByUser);

const NewAddressConfirmCenter = ({ snackbarDispatch, navigation, setCancelVisible }: Props) => {
  const [createCenter, { loading: loading1 }] = useMutation(CREATE_CENTER);
  const [createMyCenter, { loading: loading2 }] = useMutation(CREATE_MY_CENTER);

  const [visible, setVisible] = useState(false);
  const [placeName, setPlaceName] = useState('');
  const [inputError, setInputError] = useState('');

  const {
    authStore,
    centerStore: { addressSelected, origin },
  } = useStoreState();

  const compStyles = getCompStyles(authStore.appearance);
  const storeDispatch = useStoreDispatch();
  const renderButton = () => {
    return (
      <NextProcessButton
        loading={loading1 || loading2}
        disabled={!placeName}
        // disabled={loading1 || loading2}
        mode="contained"
        onPress={throttle(async () => {
          Keyboard.dismiss();
          if (!placeName) {
            setInputError('센터 이름은 필수 항목입니다');
            return;
          }
          const id = uuidv4();
          try {
            await createCenter({
              variables: {
                input: {
                  id,
                  type: CenterType.userAdded,
                  name: placeName,
                  address: addressSelected.road_address_name || addressSelected.address_name,
                  lat: addressSelected.y,
                  lng: addressSelected.x,
                  // tel: addressSelected.phone,
                  // homepage: addressSelected.place_url,
                  // category: addressSelected.category_name,
                },
              },
            });

            await createMyCenter({
              variables: {
                input: {
                  id: uuidv4(),
                  createdAt: new Date().toISOString(),
                  myCenterCenterId: id,
                  myCenterUserId: authStore.user.username,
                },
              },
              update: (cache, { data: createMyCenterResult }) => {
                try {
                  const queryResult: any = cache.readQuery({
                    query: LIST_MY_CENTERS,
                    variables: { myCenterUserId: authStore.user.username },
                  });

                  const { items, ...others } = queryResult.listMyCentersByUser;
                  const { id, center, createdAt } = createMyCenterResult.createMyCenter;
                  const newCenter = {
                    id: id,
                    center: {
                      address: center.address,
                      id: center.id,
                      name: center.name,
                      type: center.type,
                      __typename: 'Center',
                    },
                    createdAt: createdAt,
                    __typename: 'MyCenter',
                  };
                  const newItems = produce(items, (draft: any[]) => {
                    draft.push(newCenter);
                  });
                  const newData = { listMyCentersByUser: { items: newItems, ...others } };
                  cache.writeQuery({
                    query: LIST_MY_CENTERS,
                    variables: { myCenterUserId: authStore.user.username },
                    data: newData,
                  });
                } catch (err) {
                  console.log(err);
                }
              },
            });
            setVisible(true);
            // console.log(result);
          } catch (e) {
            reportSentry(e);
            // 에러 snackbar 출력
            snackbarDispatch({
              type: OPEN_SNACKBAR,
              message: e.message,
            });
          }
        }, 5000)}
        children="마이센터에 추가"
      />
    );
  };

  const renderHeader = useMemo(() => {
    const _handleOnCancel = () => {
      Keyboard.dismiss();
      setCancelVisible(true);
    };
    const _handleOnBack = () => storeDispatch({ type: CHANGE_REGISTER_CENTER_STATE, registerCenterState: 'newAddressCenter' });
    return (
      <SwitchStackHeader appearance={authStore.appearance}>
        <Left>
          <BackButton onPress={_handleOnBack} />
        </Left>
        <Body>
          <PageCounter pageNumber={3} totalPageNumber={3} />
        </Body>
        <Right>
          <KeyboardDismissButton needMarginRight />
          <CancelButton onPress={_handleOnCancel} />
        </Right>
      </SwitchStackHeader>
    );
  }, [storeDispatch, authStore.appearance]);

  const _handleDialogOnPress = () => {
    storeDispatch({ type: RESET_CENTER_STATE, registerCenterState: 'searchCenter' });
    navigation.navigate(origin);
  };

  const _handlePlaceNameOnChangeText = (input: string) => setPlaceName(input);
  const _handleOnDismiss = () => {
    setVisible(false);
  };
  return (
    <TouchableWithoutFeedback style={compStyles.flex1} onPress={Keyboard.dismiss} accessible={false}>
      <View style={compStyles.flex1}>
        {renderHeader}

        <View style={compStyles.flex1}>
          <View style={compStyles.screenMarginHorizontal}>
            <HeadlineSub text="입력하신 주소지 센터의 이름을 입력하시고 '마이센터에 추가' 버튼을 터치하세요" />
          </View>

          <KeyboardAwareScrollView
            keyboardDismissMode="on-drag"
            onScrollBeginDrag={Keyboard.dismiss}
            contentContainerStyle={compStyles.flexGrow1}
            keyboardShouldPersistTaps="handled"
            // extraScrollHeight={normalize(20)}
            enableOnAndroid={true}
          >
            <View style={[compStyles.screenMarginHorizontal, compStyles.focusContainer]}>
              <FocusText appearance={authStore.appearance}>{addressSelected.address_name}</FocusText>
              <SingleLineInputField
                labelText="센터 이름"
                value={placeName}
                placeholder="센터의 이름을 입력하세요(필수)"
                onChangeText={_handlePlaceNameOnChangeText}
                withFormik={false}
                stateError={inputError}
                autoCorrect={false}
                autoCapitalize="none"
                maxLength={15}
              />
            </View>
            <View style={compStyles.flex1} />
            {renderButton()}
          </KeyboardAwareScrollView>
        </View>

        <MyDialogContainer visible={visible} onDismiss={_handleOnDismiss} dismissable={false}>
          <MyDialogTitle>마이센터 추가 완료</MyDialogTitle>
          <Dialog.Content>
            <DialogContentText bold text={placeName} />
            <DialogContentText text="을/를 성공적으로 추가하였습니다" />
          </Dialog.Content>
          <Dialog.Actions>
            <ThemedButton onPress={_handleDialogOnPress}>확인</ThemedButton>
          </Dialog.Actions>
        </MyDialogContainer>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default withNavigation(NewAddressConfirmCenter);
