import * as Yup from 'yup';

import { Formik, FormikValues } from 'formik';
import { Keyboard, KeyboardEvent, LayoutChangeEvent, Platform, ScrollView, View } from 'react-native';
import { memo, useEffect, useState } from 'react';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import AddClassHeader from './AddClassHeader';
import { CHANGE_ADD_CLASS_STATE } from '../../stores/actionTypes';
import HeadlineSub from '../HeadlineSub';
import NextProcessButton from '../NextProcessButton';
import React from 'react';
import ResetFormButton from '../ResetFormButton';
import SingleLineInputField from '../SingleLineInputField';

import getDimensions from '../../functions/getDimensions';
import theme from '../../configs/theme';
import { withNextInputAutoFocusForm } from 'react-native-formik';
import { getCompStyles } from '../../configs/compStyles';

const Form = withNextInputAutoFocusForm(View);
interface Props {
  setCancelVisible: (arg: boolean) => void;
}

const validationSchema = Yup.object().shape({
  memo: Yup.string().max(1000, '1000자 이내로 입력하세요'),
});

const { SCREEN_HEIGHT, IS_IPHONE_X, HEADER_HEIGHT, STATUS_BAR_HEIGHT } = getDimensions();

const MemoClass = ({ setCancelVisible }: Props) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [textInputY, setTextInputY] = useState(0);

  // const [textInputY, setTextInputY] = useState(0);
  const {
    classStore: { summary, memo },
    authStore: { appearance },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();
  const compStyles = getCompStyles(appearance);

  useEffect(() => {
    // let _mounted = true;
    // if (_mounted) {
    const updateListener = Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow';
    const resetListener = Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide';

    const _updateKeyboardY = (event: KeyboardEvent) => {
      setKeyboardHeight(event.endCoordinates.height);
    };
    const _resetKeyboardY = () => {
      setKeyboardHeight(0);
    };
    const updateKeyboardY = Keyboard.addListener(updateListener, _updateKeyboardY);
    const resetKeyboardY = Keyboard.addListener(resetListener, _resetKeyboardY);
    // }
    return () => {
      updateKeyboardY.remove();
      resetKeyboardY.remove();
      // _mounted = false;
    };
  }, []);

  const _handleOnSubmit = (values: FormikValues) => {
    Keyboard.dismiss();
    storeDispatch({ type: CHANGE_ADD_CLASS_STATE, addClassState: 'confirmClass', memo: values.memo });
  };

  const _handleOnLayout = (event: LayoutChangeEvent) => {
    setTextInputY(event.nativeEvent.layout.y);
  };

  const initialMemo = `(필요시 아래 내용 등을 포함하여 자유롭게 작성하세요.작성하지 않으시려면 초기화를 눌러 삭제하세요)

강사 경력 : _개월/년 이상

난이도 : 초급 / 중급 / 고급

스피커 : 블루투스/AUX/개인지참

인센티브 :
  `;

  const top =
    (keyboardHeight === 0 ? textInputY : keyboardHeight) +
    HEADER_HEIGHT +
    STATUS_BAR_HEIGHT +
    (keyboardHeight === 0 ? 130 : Platform.OS === 'ios' ? 80 : 0) +
    (IS_IPHONE_X ? 28 : 0);
  const height = SCREEN_HEIGHT - top;

  return (
    <>
      <AddClassHeader
        backRoute="classFeeClass"
        setCancelVisible={setCancelVisible}
        summary={summary}
        pageCounterNumber={8}
        needKeyboardDismissButton
      />

      <ScrollView
        alwaysBounceVertical={false}
        contentContainerStyle={[compStyles.screenMarginHorizontal]}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        scrollEnabled={true}
      >
        <HeadlineSub marginBottom={0} text="추가로 제공해야 할 정보를 입력하세요" />

        <Formik
          validateOnChange={false}
          validateOnBlur={true}
          initialValues={{
            memo: memo || initialMemo,
          }}
          onSubmit={_handleOnSubmit}
          validationSchema={validationSchema}
        >
          {props => {
            const _handleResetForm = () => props.resetForm({ values: { memo: '' } });
            return (
              <View onLayout={_handleOnLayout}>
                <Form style={[compStyles.form, { justifyContent: 'space-between', marginTop: theme.size.big }]}>
                  <SingleLineInputField
                    name="memo"
                    labelText="추가 정보"
                    type="string"
                    multiline
                    autoCorrect={false}
                    value={props.values.memo}
                    maxLength={300}
                    style={{
                      // textAlignVertical: 'top',
                      height,
                      // width: '100%',
                      // borderColor: 'red',
                      // borderWidth: 1,
                    }}
                    autoFocasd
                  />

                  {/* <View style={compStyles.flex1} /> */}

                  <View style={[compStyles.pressButtonsInARow]}>
                    {props.values.memo !== '' && <ResetFormButton onPress={_handleResetForm} />}

                    <NextProcessButton
                      children={summary ? '수정 완료' : ''}
                      onPress={props.handleSubmit}
                      marginHorizontalNeedless
                      containerStyle={compStyles.flex1}
                      loading={props.isSubmitting || (props.isValidating && !props.errors)}
                    />
                  </View>
                </Form>
              </View>
            );
          }}
        </Formik>
      </ScrollView>
    </>
  );
};

export default memo(MemoClass);
