import Body from '../components/Body';
import CancelButton from '../components/CancelButton';
import HeaderTitle from '../components/HeaderTitle';
import HelpCarousel from '../components/addClassHelp/HelpCarousel';
import Left from '../components/Left';
import ModalScreenContainer from './ModalScreenContainter';
import { NavigationStackScreenProps } from 'react-navigation-stack';
import React from 'react';
import Right from '../components/Right';
import SwitchStackHeader from '../components/SwitchStackHeader';
import { View } from 'react-native';
import { getStyles } from '../configs/styles';
import useHandleAndroidBack from '../functions/handleAndroidBack';
import { useStoreState } from '../stores/initStore';
import { getThemeColor } from '../configs/theme';

interface Props extends NavigationStackScreenProps {}

const AddClassHelpScreen = ({ navigation }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const styles = getStyles(appearance);

  const _handleBackButton = () => {
    navigation.goBack();
  };

  useHandleAndroidBack(navigation, _handleBackButton);

  const renderHeader = () => (
    <SwitchStackHeader appearance={appearance}>
      <Left>
        <CancelButton onPress={_handleBackButton} />
      </Left>
      <Body flex={5}>
        <HeaderTitle tintColor={getThemeColor('text', appearance)}>클래스 등록시 주의점</HeaderTitle>
      </Body>
      <Right />
    </SwitchStackHeader>
  );

  return (
    <ModalScreenContainer
      children1={
        <>
          {renderHeader()}
          <View style={styles.contentsColumnCenterContainer}>
            <HelpCarousel onCancel={_handleBackButton} appearance={appearance} />
          </View>
        </>
      }
    />
  );
};

export default AddClassHelpScreen;
