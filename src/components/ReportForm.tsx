import * as Yup from 'yup';

import { Formik, FormikValues } from 'formik';
import { Keyboard, ScrollView, TouchableOpacity, View } from 'react-native';
import { Menu, Modal } from 'react-native-paper';
import { customAddClassBlock, customAddPostBlock, customAddUserBlock } from '../customGraphqls';
import { memo, useMemo, useState } from 'react';
import { getTheme, getThemeColor, normalize } from '../configs/theme';

import AndroidDivider from './AndroidDivider';
import Body from './Body';
import CancelButton from './CancelButton';
import HeaderTitle from './HeaderTitle';
import KeyboardDismissButton from './KeyboardDismissButton';
import Left from './Left';
import MenuAnchorText from './MenuAnchorText';
import NextProcessButton from './NextProcessButton';
import React from 'react';
import { ReportTargetType } from '../API';
import ResetFormButton from './ResetFormButton';
import Right from './Right';
import SingleLineInputField from './SingleLineInputField';
import SwitchStackHeader from './SwitchStackHeader';
import { WarningProps } from './WarningDialog';
import { getCompStyles } from './../configs/compStyles';
import getDimensions from '../functions/getDimensions';
import gql from 'graphql-tag';
import { reportSendMail } from '../graphql/mutations';
import throttle from 'lodash/throttle';
import { useMutation } from '@apollo/react-hooks';
import { useStoreState } from '../stores/initStore';
import { withNextInputAutoFocusForm } from 'react-native-formik';

const Form = withNextInputAutoFocusForm(View);
interface Props {
  target: string;
  modalVisible: boolean;
  setModalVisible: (arg: boolean) => void;
  reportTargetType: ReportTargetType;
  targetId: string;
  numOfReported?: number;
  setWarningProps: (arg: Partial<WarningProps> | null) => void;
  submitted: boolean;
}

const validationSchema = Yup.object().shape({
  extraInfo: Yup.string().max(100, '100자 이내로 입력하세요'),
});

const REPORT_SEND_MAIL = gql(reportSendMail);
const ADD_CLASS_BLOCK = gql(customAddClassBlock);
const ADD_USER_BLOCK = gql(customAddUserBlock);
const ADD_POST_BLOCK = gql(customAddPostBlock);

const ReportForm = ({
  target,
  modalVisible,
  setModalVisible,
  setWarningProps,
  reportTargetType,
  targetId,
  numOfReported,
  submitted,
}: Props) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [reportCategory, setReportCategory] = useState('');
  const {
    authStore: { user, appearance },
  } = useStoreState();
  const compStyles = getCompStyles(appearance);
  const theme = getTheme(appearance);

  // const { user?.username??'' } = user;
  const { STATUS_BAR_HEIGHT } = getDimensions();

  const getMutation = () => {
    let mutationGql: any;
    switch (reportTargetType) {
      case ReportTargetType.classReport:
        mutationGql = ADD_CLASS_BLOCK;
        break;

      case ReportTargetType.userReport:
        mutationGql = ADD_USER_BLOCK;
        break;

      case ReportTargetType.postReport:
        mutationGql = ADD_POST_BLOCK;
        break;
    }
    return mutationGql;
  };

  const [reportSendMail, { loading: loading1 }] = useMutation(REPORT_SEND_MAIL);
  const [addBlockMutation, { loading: loading2 }] = useMutation(getMutation());

  const renderHeader = useMemo(() => {
    const _handleCancel = () => {
      Keyboard.dismiss();
      setModalVisible(false);
    };
    return (
      <SwitchStackHeader appearance={appearance} paddingNeedles backgroundColor={theme.colors.uiBackground}>
        <Left>
          <CancelButton onPress={_handleCancel} />
        </Left>
        <Body>
          <HeaderTitle tintColor={getThemeColor('text', appearance)}>{target} 신고</HeaderTitle>
        </Body>
        <Right>
          <KeyboardDismissButton />
        </Right>
      </SwitchStackHeader>
    );
  }, [target, appearance]);

  const _handleSubmit = (values: FormikValues) => {
    const getAddBlockVariables = () => {
      let variables: any;
      switch (reportTargetType) {
        case ReportTargetType.classReport:
          variables = { blockedBy: user?.username ?? '', classId: targetId, numOfReported };
          break;

        case ReportTargetType.userReport:
          variables = {
            blockedBy: user?.username ?? '',
            userId: targetId,
            numOfReported,
          };
          break;

        case ReportTargetType.postReport:
          variables = {
            blockedBy: user?.username ?? '',
            postId: targetId,
            numOfReported,
          };
          break;
      }
      return variables;
    };

    const getOptimisticResponse = () => {
      const response: any = { __typename: 'Mutation' };
      const blockedInfo = { id: targetId, blockedBy: [user?.username ?? ''] };
      switch (reportTargetType) {
        case ReportTargetType.classReport:
          response.addClassBlock = {
            __typename: 'Class',
            ...blockedInfo,
          };
          break;

        case ReportTargetType.userReport:
          response.addUserBlock = {
            __typename: 'User',
            ...blockedInfo,
          };
          break;

        case ReportTargetType.postReport:
          response.addPostBlock = {
            __typename: 'Post',
            ...blockedInfo,
          };
          break;
      }
      return response;
    };
    Keyboard.dismiss();
    const reportFunction = throttle(async () => {
      try {
        await reportSendMail({
          variables: {
            input: {
              reporterId: user?.username ?? '',
              reportCategory,
              reportTargetType,
              targetId,
              extraInfo: values.extraInfo,
            },
          },
        });
        await addBlockMutation({
          variables: { input: getAddBlockVariables() },
          // refetchQueries,
          optimisticResponse: getOptimisticResponse(),
        });
      } catch (e) {
        throw e;
      }
    }, 1000);

    _handleWarnings(reportFunction, loading1 || loading2);
  };

  const _handleWarnings = (handleOk: () => void, loading: boolean) => {
    setWarningProps({
      dialogTitle: `${target} 신고`,
      dialogContent: `본 ${target}을/를 신고합니다. 운영자는 신고 내용 따라 적절한 조치를 취할 것이며, 신고한 ${target}은/는 자동 차단되며 허위 신고시는 사용에 지장을 초래할 수 있습니다. 그래도 신고하시겠습니까?`,
      handleOk,
      okText: '예, 신고하겠습니다',
      loading,
      // navigateBack: true,
    });
  };

  const _handleModalDismiss = () => setModalVisible(false);
  const _handleMenuDismiss = () => setMenuVisible(false);
  const _handleMenuOpen = () => setMenuVisible(true);

  const renderMenu = useMemo(() => {
    const reasonArray =
      reportTargetType === ReportTargetType.userReport
        ? ['욕설 등 비매너', '허위 프로필', '거래 약속 위반', '기타']
        : ['부적절한 콘텐츠', '스팸', '기타'];
    return (
      <View style={compStyles.searchTermContainer}>
        <Menu
          visible={menuVisible}
          onDismiss={_handleMenuDismiss}
          anchor={
            <TouchableOpacity onPress={_handleMenuOpen}>
              <MenuAnchorText appearance={appearance}>
                신고 이유: {reportCategory || '터치하여 선택하세요 (필수)'}
              </MenuAnchorText>
            </TouchableOpacity>
          }
          contentStyle={{
            backgroundColor: getThemeColor('background', appearance),
          }}
        >
          {reasonArray.map(reason => (
            <Menu.Item
              key={reason}
              onPress={() => {
                setReportCategory(reason);
                setMenuVisible(false);
              }}
              title={reason}
              titleStyle={{ color: getThemeColor('text', appearance), fontWeight: 'bold' }}
            />
          ))}
        </Menu>
      </View>
    );
  }, [reportTargetType, menuVisible, reportCategory]);

  if (!user) return null;

  return (
    <Modal
      visible={modalVisible}
      onDismiss={_handleModalDismiss}
      contentContainerStyle={{
        marginHorizontal: theme.size.big,
        marginTop: STATUS_BAR_HEIGHT + theme.size.big,
        paddingHorizontal: theme.size.big,
        borderRadius: theme.size.medium,
        // flex: 1,
        height: normalize(320),
        backgroundColor: theme.colors.uiBackground,
        opacity: submitted ? 0 : 1,
      }}
      wrapperStyle={compStyles.form}
    >
      {renderHeader}
      <ScrollView
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        scrollEnabled={true}
        alwaysBounceVertical={false}
        contentContainerStyle={compStyles.flexGrow1}
      >
        {renderMenu}
        <AndroidDivider needMarginVertical />

        <Formik
          validateOnChange={true}
          validateOnBlur={true}
          validateOnMount={true}
          initialValues={{
            extraInfo: '',
          }}
          onSubmit={_handleSubmit}
          validationSchema={validationSchema}
        >
          {props => {
            const _handleResetForm = () => props.resetForm({ values: { extraInfo: '' } });
            const noError: Boolean = Object.entries(props.errors).length === 0;

            return (
              <View style={compStyles.flex1}>
                <Form style={compStyles.form}>
                  <View style={compStyles.flexGrow1}>
                    <SingleLineInputField
                      labelText="추가 정보"
                      name="extraInfo"
                      type="string"
                      multiline
                      maxLength={100}
                      autoCorrect={false}
                      style={compStyles.reportFormInput}
                      placeholder="신고를 위해 추가로 필요한 정보가 있으면 100자 이내로 입력하세요"
                    />
                  </View>
                  <View style={[compStyles.pressButtonsInARow, compStyles.searchTermButtons]}>
                    {props.values.extraInfo !== '' && <ResetFormButton onPress={_handleResetForm} isModal />}
                    <NextProcessButton
                      children={reportCategory ? '신고 제출' : '신고 이유를 선택하세요'}
                      onPress={props.handleSubmit}
                      marginHorizontalNeedless
                      containerStyle={[compStyles.flex1, compStyles.searchTermButtons]}
                      disabled={!reportCategory || !noError}
                      loading={loading1 || loading2 || props.isSubmitting || (props.isValidating && !props.errors)}
                    />
                  </View>
                </Form>
              </View>
            );
          }}
        </Formik>
      </ScrollView>
    </Modal>
  );
};

export default memo(ReportForm);
