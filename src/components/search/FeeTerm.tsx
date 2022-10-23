import { Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import React, { memo, useEffect, useState } from 'react';

import throttle from 'lodash/throttle';
import ThemedButton from '../ThemedButton';
import { getCompStyles } from '../../configs/compStyles';
import { getTheme } from '../../configs/theme';
import { useStoreState } from '../../stores/initStore';

interface Props {
  termDispatch: (arg: {}) => void;
  handleClose: () => void;
  feeTerm: number;
}

interface FeeObj {
  label: string;
  value: number;
}

const numeral = require('numeral');

const FeeTerm = ({ termDispatch, handleClose, feeTerm }: Props) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const compStyles = getCompStyles(appearance);
  const theme = getTheme(appearance);

  const [fee, setFee] = useState(feeTerm);
  const [feeArray, setFeeArray] = useState<FeeObj[]>([]);

  useEffect(() => {
    const getArray = (max: number) => {
      let tempArray: FeeObj[] = [];
      for (let i = 0; i < max; i = i + 1000) {
        tempArray.push({ label: numeral(i).format('0,0'), value: i });
      }
      return tempArray;
    };

    const feeArray = getArray(1000000);
    setFeeArray(feeArray);
  }, []);

  const _handleSetTerm = () => {
    termDispatch({ type: 'setTerm', feeTerm: fee });
    handleClose();
  };

  const _handleOnValueChange = throttle((itemValue: number, itemIndex: number) => {
    setFee(itemValue);
  }, 100);

  return (
    <View style={compStyles.searchContainer}>
      <View style={[compStyles.buttons, compStyles.searchTermButtons]}>
        <ThemedButton
          mode="text"
          compact
          color={theme.colors.accent}
          onPress={handleClose}
          style={compStyles.buttonMarginRight}
        >
          취소
        </ThemedButton>
        <ThemedButton mode="text" compact onPress={_handleSetTerm} disabled={!fee}>
          선택한 수업료로 설정
        </ThemedButton>
      </View>
      <View style={compStyles.pickerContainer}>
        <Picker selectedValue={fee} style={compStyles.picker} onValueChange={_handleOnValueChange}>
          {feeArray.map((fee: FeeObj) => (
            <Picker.Item key={fee.value} label={fee.label} value={fee.value} />
          ))}
        </Picker>
        <Text style={compStyles.text}>원/타임</Text>
      </View>
    </View>
  );
};

export default memo(FeeTerm);
