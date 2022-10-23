import * as Yup from 'yup';

import { Formik, FormikValues } from 'formik';
import { Keyboard, Platform, ScrollView, View } from 'react-native';
import { NavigationParams, NavigationRoute, NavigationScreenProp } from 'react-navigation';
import React, { memo } from 'react';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import Body from '../Body';
import { CHANGE_ADD_CLASS_STATE } from '../../stores/actionTypes';
import CancelButton from '../CancelButton';
import HeadlineSub from '../HeadlineSub';
import KeyboardDismissButton from '../KeyboardDismissButton';
import Left from '../Left';
import MyHeadline from '../MyHeadline';
import NextProcessButton from '../NextProcessButton';
import PageCounter from '../PageCounter';
import ResetFormButton from '../ResetFormButton';
import Right from '../Right';
import ShowDisclaimerButton from '../ShowDisclaimerButton';
import SingleLineInputField from '../SingleLineInputField';
import SwitchStackHeader from '../SwitchStackHeader';
import { getCompStyles } from '../../configs/compStyles';
import { getThemeColor } from '../../configs/theme';
import { withNextInputAutoFocusForm } from 'react-native-formik';
import { TOTAL_ADD_CLASS_PAGE } from '../../configs/variables';

const Form = withNextInputAutoFocusForm(View);
interface Props {
  navigation: NavigationScreenProp<NavigationRoute<NavigationParams>, NavigationParams>;
}

const validationSchema = Yup.object().shape({
  title: Yup.string()
    .required('필수 입력입니다')
    .min(5, '제목은 5자 이상입니다')
    .max(20, '20자 이하로 입력하세요')
    .trim(),
});

const TitleClass = ({ navigation }: Props) => {
  const storeDispatch = useStoreDispatch();
  const {
    authStore: { appearance },
    classStore: { summary, title, updateMode },
  } = useStoreState();
  const compStyles = getCompStyles(appearance);
  const origin = navigation.getParam('origin');

  const renderHeader = () => {
    const _handleCancelButton = () => {
      if (summary) {
        storeDispatch({ type: CHANGE_ADD_CLASS_STATE, addClassState: 'confirmClass' });
      } else if (origin) {
        navigation.navigate(origin);
      } else {
        navigation.navigate(`${updateMode ? 'ClassView' : 'Home'}`);
      }
    };

    const _handleHelpButton = () => navigation.push('AddClassHelp');

    return (
      <SwitchStackHeader appearance={appearance}>
        <Left>
          <CancelButton onPress={_handleCancelButton} />
        </Left>
        <Body>
          <PageCounter pageNumber={1} totalPageNumber={TOTAL_ADD_CLASS_PAGE} />
        </Body>
        <Right>
          <KeyboardDismissButton needMarginRight />
          <ShowDisclaimerButton iconName="help" onPress={_handleHelpButton} color={getThemeColor('focus', appearance)} appearance={appearance} />
        </Right>
      </SwitchStackHeader>
    );
  };

  const _handleOnSubmit = (values: FormikValues) => {
    Keyboard.dismiss();
    storeDispatch({
      type: CHANGE_ADD_CLASS_STATE,
      addClassState: summary ? 'confirmClass' : 'dateClass',
      title: values.title.trim(),
    });
  };

  return (
    <>
      {renderHeader()}
      <ScrollView
        alwaysBounceVertical={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[compStyles.scrollViewContainer, compStyles.screenMarginHorizontal]}
      >
        <MyHeadline>클래스 {updateMode ? '수정' : '등록'}</MyHeadline>
        {!updateMode && <HeadlineSub text="선생님을 구하는 클래스 정보를 하나하나 입력합니다" />}

        <Formik
          validateOnChange={false}
          validateOnBlur={true}
          initialValues={{
            title,
          }}
          onSubmit={_handleOnSubmit}
          validationSchema={validationSchema}
        >
          {props => {
            const _handleResetForm = () => props.resetForm({ values: { title: '' } });
            return (
              <Form style={compStyles.form}>
                <SingleLineInputField
                  labelText="제목"
                  name="title"
                  type="string"
                  placeholder="알기 쉬운 제목을 입력하세요"
                  // value={props.values.title}
                  autoCorrect={false}
                  maxLength={20}
                  clearButtonMode="while-editing"
                />
                <View style={compStyles.flex1} />
                <View style={compStyles.pressButtonsInARow}>
                  {props.values.title !== '' && Platform.OS === 'android' && <ResetFormButton onPress={_handleResetForm} />}
                  <NextProcessButton
                    children={summary ? '수정 완료' : ''}
                    containerStyle={compStyles.flex1}
                    onPress={props.handleSubmit}
                    marginHorizontalNeedless
                    loading={props.isSubmitting || (props.isValidating && !props.errors)}
                  />
                </View>
              </Form>
            );
          }}
        </Formik>
      </ScrollView>
    </>
  );
};

export default memo(TitleClass);
