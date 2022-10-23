import { StyleSheet, View } from 'react-native';

import styled from 'styled-components';
import theme, { getThemeColor } from '../configs/theme';
import { AppearanceType } from '../types/store';

const MyDivider = styled(View)<{ appearance: AppearanceType }>`
  background-color: ${props => getThemeColor('borderColor', props.appearance)};
  height: ${StyleSheet.hairlineWidth}px;
  margin-right: ${theme.size.big}px;
  margin-left: ${theme.size.big}px;
`;

export default MyDivider;
