import { View } from 'react-native';
import { memo } from 'react';
import styled from 'styled-components';
import theme, { getThemeColor } from '../configs/theme';
import { AppearanceType } from '../types/store';

const EmptySeparator = styled(View)<{
  marginVerticalBig?: boolean;
  marginVerticalSmall?: boolean;
  appearance: AppearanceType;
}>`
  background-color: ${props => getThemeColor('background', props.appearance)};
  width: 100%;
  height: ${props =>
    props.marginVerticalBig ? theme.size.big : props.marginVerticalSmall ? theme.size.xs : theme.size.normal}px;
`;

export default memo(EmptySeparator);
