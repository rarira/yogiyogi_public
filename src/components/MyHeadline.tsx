import React, { FunctionComponent } from 'react';
import theme, { getThemeColor } from '../configs/theme';

import { AppearanceType } from '../types/store';
import DeviceInfo from 'react-native-device-info';
import { Headline } from 'react-native-paper';
import styled from 'styled-components';
import { useStoreState } from '../stores/initStore';

const hasNotch = DeviceInfo.hasNotch();
const StyledHL = styled(Headline)<{ appearance: AppearanceType }>`
  font-size: ${theme.fontSize.heading}px;
  font-weight: bold;
  margin-top: ${hasNotch ? theme.size.normal : theme.size.small}px;
  color: ${props => getThemeColor('text', props.appearance)};
  /* margin-bottom: ${theme.size.small}; */
`;

const MyHeadline: FunctionComponent = ({ children }) => {
  const {
    authStore: { appearance },
  } = useStoreState();

  return <StyledHL appearance={appearance}>{children}</StyledHL>;
};

export default MyHeadline;
