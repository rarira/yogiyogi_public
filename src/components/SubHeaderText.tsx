import { Text } from 'react-native';
import styled from 'styled-components';
import theme, { getThemeColor } from '../configs/theme';
import { AppearanceType } from '../types/store';

const SubHeaderText = styled(Text)<{ needMarginBottom?: boolean; appearance: AppearanceType }>`
  color: ${props => getThemeColor('text', props.appearance)};
  font-weight: bold;
  font-size: ${theme.fontSize.normal}px;
  margin: 0 0 ${theme.size.small}px 0;
  margin-bottom: ${props => (props.needMarginBottom ? theme.size.normal : 0)}px;
`;

export default SubHeaderText;
