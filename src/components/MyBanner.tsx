import { Image, View } from 'react-native';
import React, { memo } from 'react';

import { Banner } from 'react-native-paper';
import KoreanParagraph from './KoreanParagraph';
import styled from 'styled-components';

import { useStoreState } from '../stores/initStore';
import { getTheme } from '../configs/theme';

interface Props {
  message: string;
  onPress1?: () => void;
  label1: string;
  onPress2?: () => void;
  label2?: string;
  imgUri?: string;
  backgroundColor?: string;
  visible: boolean;
  setVisible: (arg: boolean) => void;
  disabled?: boolean;
}

const StyledBanner = styled(Banner)<{ backgroundColor?: string; theme: any }>`
  background-color: ${props => props.backgroundColor || props.theme.colors.blue50};
  margin-bottom: ${props => props.theme.size.small}px;
  box-shadow: 0 5px 3px ${props => props.theme.colors.grey200.concat('40')};
  /* elevation: 4; */
`;

const StyledImage = styled(Image)<{ size: number }>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
`;

const MyBanner = ({
  message,
  onPress1,
  label1,
  onPress2,
  label2,
  imgUri,
  visible,
  backgroundColor,
  setVisible,
  disabled,
}: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const theme = getTheme(appearance);

  const actions = [
    {
      label: label1,
      onPress: onPress1 === undefined ? () => setVisible(false) : onPress1,
      disabled,
      color: disabled ? theme.colors.disabled : theme.colors.notification,
    },
  ];

  if (onPress2 && label2) {
    actions[1] = {
      label: label2,
      onPress: onPress2,
      disabled,
      color: disabled ? theme.colors.disabled : theme.colors.notification,
    };
  }

  const BannerImage = (size: number) => (
    <StyledImage source={imgUri ? { uri: imgUri } : require('../static/img/help.png')} size={size} />
  );

  const textStyle = { fontSize: theme.fontSize.normal, color: theme.colors.text };

  return (
    <StyledBanner
      backgroundColor={backgroundColor}
      visible={visible}
      actions={actions}
      image={({ size }) => BannerImage(size)}
      theme={theme}
    >
      <View>
        <KoreanParagraph text={message} textStyle={textStyle} />
      </View>
    </StyledBanner>
  );
};

export default memo(MyBanner);
