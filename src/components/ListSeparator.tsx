import { StyleSheet, View } from 'react-native';

import styled from 'styled-components';
import theme, { getThemeColor } from '../configs/theme';
import { AppearanceType } from '../types/store';

const ListSeparator = styled(View)<{
  marginVerticalBig?: boolean;
  marginVerticalSmall?: boolean;
  appearance: AppearanceType;
}>`
  background-color: ${props => getThemeColor('grey200', props.appearance)};
  height: ${StyleSheet.hairlineWidth}px;
  width: 100%;
  margin-top: ${props =>
    props.marginVerticalBig ? theme.size.big : props.marginVerticalSmall ? theme.size.xs : theme.size.normal}px;
  margin-bottom: ${props =>
    props.marginVerticalBig ? theme.size.big : props.marginVerticalSmall ? theme.size.xs : theme.size.normal}px;
`;

export default ListSeparator;
