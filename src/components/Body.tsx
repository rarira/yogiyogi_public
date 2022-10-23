import { View } from 'react-native';
import styled from 'styled-components';

const Body = styled(View)<{ flex?: number }>`
  flex: ${props => (props.flex ? props.flex : 1)};
  align-self: center;
  align-items: center;
`;

export default Body;
