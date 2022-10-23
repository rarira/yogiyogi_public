import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import BlockButton from './BlockButton';

import KoreanParagraph from '../KoreanParagraph';
import { WarningProps } from '../WarningDialog';

import { useStoreState } from '../../stores/initStore';
import ThemedButton from '../ThemedButton';
import theme, { getTheme, getThemeColor } from '../../configs/theme';
import { AppearanceType } from '../../types/store';

interface Props {
  host: string;
  classId: string;
  isHost: boolean;
  setWarningProps: (arg: Partial<WarningProps> | null) => void;
  setModalVisible: (arg: boolean) => void;
}

const StyledKoreanParagraph = ({ text, styles }: { text: string; styles: any }) => (
  <KoreanParagraph text={text} paragraphStyle={styles.paragraph} textStyle={styles.text} />
);

const ClassViewTerm = ({ host, classId, isHost, setWarningProps, setModalVisible }: Props) => {
  const {
    authStore: { user, appearance },
  } = useStoreState();

  const styles = getThemedStyles(appearance);

  const _handleReport = () => setModalVisible(true);
  return (
    <View style={styles.container}>
      <StyledKoreanParagraph styles={styles} text={`본 클래스의 주관자는 호스트 ${host}입니다.`} />
      <StyledKoreanParagraph
        styles={styles}
        text="클래스의 정보 등은 호스트에 의해 이후 수정될 수 있으므로 유의하시기 바랍니다."
      />
      <StyledKoreanParagraph
        styles={styles}
        text="라리라 스튜디오는 단순 중계자로 클래스 검색 결과, 거래자간 채팅, 선생님 선정 및 이후 클래스 진행 등에 대한 일체의 책임을 지지 않으며 관련 사항은 호스트에게 직접 문의하시기 바랍니다."
      />
      {!isHost && (
        <>
          <StyledKoreanParagraph
            styles={styles}
            text="본 클래스에 미풍양속을 저해하는 내용 및 사용자에게 불만스러운 컨텐츠가 있을 경우 아래 버튼을 이용하여 차단 및 신고하시기 바랍니다. 한번 차단 및 신고하는 클래스는 추후 검색 및 지원 등이 불가하오니 이점 양지하시기 바랍니다"
          />
          {!!user && (
            <View style={styles.buttonContainer}>
              <BlockButton classId={classId} setWarningProps={setWarningProps} />
              <ThemedButton
                mode="text"
                icon="report"
                color={getThemeColor('accent', appearance)}
                onPress={_handleReport}
              >
                신고
              </ThemedButton>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const getThemedStyles = (appearance: AppearanceType) =>
  StyleSheet.create({
    container: { flexDirection: 'column' },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: theme.size.small },
    paragraph: { marginBottom: theme.size.xs },
    text: { color: getThemeColor('backdrop', appearance), fontSize: theme.fontSize.small },
  });

export default memo(ClassViewTerm);
