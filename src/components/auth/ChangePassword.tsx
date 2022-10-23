import * as Yup from 'yup';

import { Dialog } from 'react-native-paper';
import { Formik, FormikValues } from 'formik';
import { Keyboard, Platform, View } from 'react-native';
import { MySnackbarAction, OPEN_SNACKBAR } from '../MySnackbar';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { useState } from 'react';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import AndroidDivider from '../AndroidDivider';
import Auth from '@aws-amplify/auth';
import AuthContainer from './AuthContainer';
import { CHANGE_AUTH_STATE } from '../../stores/actionTypes';
import CancelButton from '../CancelButton';
import CancelDialog from '../CancelDialog';
import DialogContentText from '../DialogContentText';
import KeyboardDismissButton from '../KeyboardDismissButton';
import Left from '../Left';
import MyDialogContainer from '../MyDialogContainer';
import NextProcessButton from '../NextProcessButton';
import ResetFormButton from '../ResetFormButton';
import Right from '../Right';
import SingeLineInputField from '../SingleLineInputField';
import SwitchStackHeader from '../SwitchStackHeader';

import reportSentry from '../../functions/reportSentry';
import { withNextInputAutoFocusForm } from 'react-native-formik';
import ThemedButton from '../ThemedButton';
import { getCompStyles } from '../../configs/compStyles';
import MyDialogTitle from '../MyDialogTitle';

const Form = withNextInputAutoFocusForm(View);

const validationSchema = Yup.object().shape({
  newPassword: Yup.string()
    .required('필수 입력입니다')
    .trim('공백 문자는 허용되지 않습니다')
    .strict(true)
    .min(8, '비밀번호는 8자 이상입니다')
    .matches(/[a-z]/, '소문자가 포함되어야 합니다')
    .matches(/[A-Z]/, '대문자가 포함되어야 합니다')
    .matches(/[0-9]/, '숫자가 포함되어야 합니다')
    .matches(/^[a-zA-Z0-9]+$/, '영문 대/소문자, 숫자만 입력하세요'),
  newPasswordConfirm: Yup.string()
    .required('필수 입력입니다')
    .test('isSame', '같지 않아요', function test(val) {
      return val === this.parent.newPassword;
    }),
});

interface Props extends NavigationInjectedProps {
  snackbarDispatch: (arg: MySnackbarAction) => void;
}

const ChangePassword = ({ snackbarDispatch, navigation }: Props) => {
  const [visible, setVisible] = useState(false);
  const [cancelVisible, setCancelVisible] = useState(false);

  const {
    authStore: { user, appearance },
  } = useStoreState();

  const storeDispatch = useStoreDispatch();
  const compStyles = getCompStyles(appearance);

  const handleSubmit = async (
    values: FormikValues,
    resetForm: (nextValues?: {
      values: { oldPassword: string; newPassword: string; newPasswordConfirm: string };
    }) => void,
  ) => {
    const _handleResetForm = () => resetForm({ values: { oldPassword: '', newPassword: '', newPasswordConfirm: '' } });

    Keyboard.dismiss();
    try {
      // const user = await Auth.currentAuthenticatedUser();

      await Auth.changePassword(user, values.oldPassword, values.newPassword);

      setVisible(true);
    } catch (e) {
      //OPTION: error code : https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_ChangePassword.html
      switch (e.code) {
        case 'NotAuthorizedException':
          snackbarDispatch({
            type: OPEN_SNACKBAR,
            message: '잘못된 현재 비밀 번호',
            sideEffect: _handleResetForm,
            snackbarType: 'error',
          });
          break;
        case 'LimitExceededException':
          snackbarDispatch({
            type: OPEN_SNACKBAR,
            message: '시도 횟수 초과, 잠시 후 다시 시도하세요',
            sideEffect: _handleResetForm,
            snackbarType: 'error',
          });
          break;
        default:
          reportSentry(e);
          snackbarDispatch({
            type: OPEN_SNACKBAR,
            message: e.message,
            sideEffect: _handleResetForm,
            snackbarType: 'error',
          });
          break;
      }
    }
  };

  const renderHeader = () => {
    const _handleOnCancelHeader = () => {
      Keyboard.dismiss();
      setCancelVisible(true);
    };
    return (
      <SwitchStackHeader appearance={appearance}>
        <Left>
          <CancelButton onPress={_handleOnCancelHeader} />
        </Left>
        <Right>
          <KeyboardDismissButton />
        </Right>
      </SwitchStackHeader>
    );
  };

  const _handleOnDismiss = () => {
    setVisible(false);
  };
  const _handleOnCancel = () => {
    storeDispatch({ type: CHANGE_AUTH_STATE, authState: 'signedIn' });
  };
  return (
    <>
      {renderHeader()}
      <AuthContainer headline="비밀번호 변경">
        <Formik
          validateOnChange={true}
          validateOnBlur={true}
          validateOnMount={true}
          initialValues={{
            oldPassword: '',
            newPassword: '',
            newPasswordConfirm: '',
          }}
          onSubmit={(values, actions) => handleSubmit(values, actions.resetForm)}
          validationSchema={validationSchema}
        >
          {props => {
            const _handleResetForm = () =>
              props.resetForm({
                values: {
                  oldPassword: '',
                  newPassword: '',
                  newPasswordConfirm: '',
                },
              });
            const noError: Boolean = Object.entries(props.errors).length === 0;

            return (
              <Form style={compStyles.form}>
                <View style={compStyles.authTopSpace} />

                <SingeLineInputField
                  labelText="현재 비밀번호"
                  name="oldPassword"
                  type="password"
                  placeholder="현재 비밀번호를 입력하세요"
                  clearButtonMode="while-editing"
                />
                <AndroidDivider needMarginVertical />

                <SingeLineInputField
                  labelText="새로운 비밀번호"
                  name="newPassword"
                  type="password"
                  placeholder="최소 8자, 알파벳 대/소문자, 숫자 포함"
                  clearButtonMode="while-editing"
                  textContentType="newPassword"
                />
                <AndroidDivider needMarginVertical />

                <SingeLineInputField
                  labelText="새로운 비밀번호 다시 입력"
                  name="newPasswordConfirm"
                  type="password"
                  placeholder="한번 더 입력하세요"
                  clearButtonMode="while-editing"
                />
                <View style={compStyles.flex1} />

                <View style={compStyles.pressButtonsInARow}>
                  {Platform.OS === 'android' && <ResetFormButton onPress={_handleResetForm} />}
                  <NextProcessButton
                    containerStyle={compStyles.flex1}
                    onPress={props.handleSubmit}
                    mode="contained"
                    children="비밀번호 변경"
                    disabled={!noError}
                    marginHorizontalNeedless
                    loading={props.isSubmitting || (props.isValidating && !props.errors)}
                  />
                </View>
              </Form>
            );
          }}
        </Formik>
      </AuthContainer>

      <MyDialogContainer visible={visible} onDismiss={_handleOnDismiss} dismissable={false}>
        <MyDialogTitle>비밀번호 변경 완료</MyDialogTitle>
        <Dialog.Content>
          <DialogContentText text="비밀번호가 변경되었습니다" />
        </Dialog.Content>
        <Dialog.Actions>
          <ThemedButton onPress={_handleOnCancel}>확인</ThemedButton>
        </Dialog.Actions>
      </MyDialogContainer>

      <CancelDialog
        title="비밀번호 변경 중단"
        onCancel={_handleOnCancel}
        cancelVisible={cancelVisible}
        setCancelVisible={setCancelVisible}
        appearance={appearance}
      />
    </>
  );
};

export default withNavigation(ChangePassword);
