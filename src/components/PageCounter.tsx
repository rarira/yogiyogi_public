import React, { memo } from 'react';
import { Text, View } from 'react-native';
import theme, { getThemeColor } from '../configs/theme';

import { AppearanceType } from '../types/store';
import styled from 'styled-components';
import { useStoreState } from '../stores/initStore';

interface Props {
  pageNumber: number | string;
  totalPageNumber: number | string;
}

const PageNumberText = styled(Text)<{
  appearance?: AppearanceType;
}>`
  color: ${props => getThemeColor('focus', props.appearance)};
  font-size: ${theme.fontSize.medium}px;
`;

const TotalPageText = styled(Text)<{
  appearance?: AppearanceType;
}>`
  color: ${props => getThemeColor('placeholder', props.appearance)};
  font-size: ${theme.fontSize.medium}px;
`;

const RowDirectionView = styled(View)<{
  appearance?: AppearanceType;
}>`
  flex-direction: row;
`;

const PageCounter = ({ pageNumber, totalPageNumber }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  return (
    <RowDirectionView>
      <PageNumberText appearance={appearance}>{pageNumber} </PageNumberText>
      <TotalPageText appearance={appearance}>/ {totalPageNumber}</TotalPageText>
    </RowDirectionView>
  );
};

export default memo(PageCounter);
