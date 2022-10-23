import * as Yup from 'yup';

import { Formik, FormikValues } from 'formik';
import { Keyboard, Platform, ScrollView, StyleSheet, View } from 'react-native';
import React, { memo } from 'react';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import AddClassHeader from './AddClassHeader';
import AndroidDivider from '../AndroidDivider';
import { CHANGE_ADD_CLASS_STATE } from '../../stores/actionTypes';
import ClassFeeTable from '../ClassFeeTable';
import HeadlineSub from '../HeadlineSub';
import NextProcessButton from '../NextProcessButton';
import ResetFormButton from '../ResetFormButton';
import SingleLineInputField from '../SingleLineInputField';
import { getCompStyles } from '../../configs/compStyles';
import { withNextInputAutoFocusForm } from 'react-native-formik';

const Form = withNextInputAutoFocusForm(View);
interface Props {
  setCancelVisible: (arg: boolean) => void;
}

const validationSchema = Yup.object()
  .transform((value: any) => {
    value.classFee = numeral(value.classFee).value();
    return value;
  })
  .shape({
    classFee: Yup.number()
      .required('필수 입력입니다')
      .integer('정수만 입력하세요')
      .positive('양수만 입력하세요')
      .moreThan(0, '1이상 입력하세요'),
  });

const numeral = require('numeral');

const ClassFeeClass = ({ setCancelVisible }: Props) => {
  const {
    authStore: { appearance },
    classStore: { numOfClass, summary, classFee, isLongTerm },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();
  const compStyles = getCompStyles(appearance);

  const _handleOnSubmit = (values: FormikValues) => {
    Keyboard.dismiss();
    storeDispatch({
      type: CHANGE_ADD_CLASS_STATE,
      addClassState: summary ? 'confirmClass' : 'memoClass',
      classFee: numeral(values.classFee).value(),
    });
  };

  return (
    <>
      <AddClassHeader backRoute="tagClass" setCancelVisible={setCancelVisible} summary={summary} pageCounterNumber={7} needKeyboardDismissButton />
      <ScrollView
        alwaysBounceVertical={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[compStyles.scrollViewContainer, compStyles.screenMarginHorizontal]}
      >
        <HeadlineSub marginBottom={0} text="한 타임당 수업료를 입력하세요" />

        <Formik
          validateOnChange={false}
          validateOnBlur={true}
          initialValues={{
            classFee,
          }}
          onSubmit={_handleOnSubmit}
          validationSchema={validationSchema}
        >
          {props => {
            const _handleResetForm = () => props.resetForm({ values: { classFee: '' } });
            const price = numeral(props.values.classFee).format('0,0');
            return (
              <>
                <Form style={compStyles.form}>
                  {/* <View style={compStyles.inputWithSuffix}> */}
                  {/* <View style={compStyles.inputField}> */}
                  <View style={compStyles.authTopSpace} />
                  <SingleLineInputField
                    labelText="수업료"
                    name="classFee"
                    type="digits"
                    // placeholder="타임당 수업료(원)를 입력하세요"
                    suffix={'원 / 타임'}
                    value={price}
                    autoCorrect={false}
                    keyboardType="numeric"
                    clearButtonMode="while-editing"
                    style={styles.inputWindow}
                  />
                  {/* </View> */}
                  {/* </View> */}
                  <AndroidDivider needMarginVertical />

                  <ClassFeeTable numOfClass={numOfClass} classFee={props.values.classFee} isLongTerm={isLongTerm} appearance={appearance} />
                  <View style={compStyles.flex1} />
                  <View style={compStyles.pressButtonsInARow}>
                    {props.values.classFee !== '' && Platform.OS === 'android' && <ResetFormButton onPress={_handleResetForm} />}
                    <NextProcessButton
                      children={summary ? '수정 완료' : ''}
                      containerStyle={compStyles.flex1}
                      onPress={props.handleSubmit}
                      marginHorizontalNeedless
                      loading={props.isSubmitting || (props.isValidating && !props.errors)}
                    />
                  </View>
                </Form>
              </>
            );
          }}
        </Formik>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  inputWindow: {
    // width: '100%',
    flex: 1,
    // flexDirection: 'row',
    // justifyContent: 'flex-end',
    // backgroundColor: 'yellow',
    // alignItems: 'center',
    textAlign: 'right',
    padding: 0,
    // borderColor: 'red',
    // borderWidth: 1,
  },
});

export default memo(ClassFeeClass);
