import Loading from './Loading';
import React from 'react';

// import { Text } from 'react-native';

interface Props {
  loading?: boolean;
  eolMessage?: string;
  isEmpty?: boolean;
}

const FlatListFooter = ({ loading, eolMessage, isEmpty }: Props) => {
  if (isEmpty) return null;
  if (loading) {
    return <Loading size="small" origin="FlatListFooter" />;
  }
  // return <Text>{eolMessage}</Text>;
  return null;
};

export default FlatListFooter;
