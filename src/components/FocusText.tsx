import { Text } from 'react-native';
import styled from 'styled-components';
import theme, { getThemeColor } from '../configs/theme';
import { AppearanceType } from '../types/store';

const FocusText = styled(Text)<{ blur?: boolean; appearance: AppearanceType }>`
  color: ${props =>
    props.blur ? getThemeColor('disabled', props.appearance) : getThemeColor('focus', props.appearance)};
  /* margin-bottom: ${theme.size.small}; */
  font-size: ${theme.fontSize.normal}px;
  margin: ${theme.size.small}px 0px ${theme.size.small}px 0px;
`;

export default FocusText;
