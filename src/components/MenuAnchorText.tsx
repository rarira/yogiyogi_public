import { Text } from 'react-native';
import styled from 'styled-components';
import theme, { getThemeColor } from '../configs/theme';
import { AppearanceType } from '../types/store';

const MenuAnchorText = styled(Text)<{ blur?: boolean; appearance: AppearanceType }>`
  color: ${props =>
    props.blur ? getThemeColor('disabled', props.appearance) : getThemeColor('primary', props.appearance)};
  /* margin-bottom: ${theme.size.small}; */
  font-size: ${theme.fontSize.normal}px;
  font-weight: bold;
  margin: ${theme.size.small}px 0 ${theme.size.small}px ${theme.size.xs}px;
`;

export default MenuAnchorText;
