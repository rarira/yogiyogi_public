import React, { FunctionComponent } from 'react';
import theme, { getThemeColor } from '../configs/theme';

import { AppearanceType } from '../types/store';
import { Headline } from 'react-native-paper';
import styled from 'styled-components';
import { useStoreState } from '../stores/initStore';

const StyledHL = styled(Headline)<{ appearance: AppearanceType }>`
  font-size: ${theme.fontSize.big}px;
  font-weight: 700;

  margin-bottom: ${theme.size.small}px;
  color: ${props => getThemeColor('text', props.appearance)};
`;

const MySubHeadline: FunctionComponent = ({ children }) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  return <StyledHL appearance={appearance}>{children}</StyledHL>;
};

export default MySubHeadline;
