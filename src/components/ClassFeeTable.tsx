import React, { memo, useMemo } from 'react';

import { DataTable } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native';
import { AppearanceType } from '../types/store';
import { getTheme } from '../configs/theme';

interface Props {
  numOfClass: number;
  classFee: any;
  isLongTerm: boolean;
  appearance: AppearanceType;
}

const numeral = require('numeral');

const DateDifferenceTable = ({ numOfClass, classFee, isLongTerm, appearance }: Props) => {
  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);
  const price = useMemo(() => numeral(classFee).format('0,0'), [classFee]);
  const totalPrice = useMemo(() => numeral(numeral(classFee).value() * numOfClass).format('0,0'), [
    classFee,
    numOfClass,
  ]);
  return (
    <DataTable style={styles.dataTableContainer}>
      <DataTable.Header style={styles.dataTableRow}>
        <DataTable.Title style={styles.alignCenter}>
          <Text style={styles.headerText}>타임{isLongTerm && ' (1주당)'}</Text>
        </DataTable.Title>
        <DataTable.Title style={styles.alignCenter}>
          <Text style={styles.headerText}>수업료 (1타임 당)</Text>
        </DataTable.Title>
        <DataTable.Title style={styles.alignCenter}>
          <Text style={styles.headerText}>수업료{isLongTerm && ' (1주당)'}</Text>
        </DataTable.Title>
      </DataTable.Header>
      <DataTable.Row style={styles.dataTableRow}>
        <DataTable.Cell style={styles.alignCenter}>
          <Text style={styles.classFeeText}>{numOfClass} 타임</Text>
        </DataTable.Cell>
        <DataTable.Cell style={styles.alignCenter}>
          <Text style={styles.classFeeText}>{price} 원</Text>
        </DataTable.Cell>
        <DataTable.Cell style={styles.alignCenter}>
          <Text style={styles.totalFeeText}>{totalPrice} 원</Text>
        </DataTable.Cell>
      </DataTable.Row>
    </DataTable>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    dataTableContainer: { marginBottom: theme.size.big },
    dataTableRow: {
      borderBottomWidth: 0,
      height: 30,
      padding: 0,
    },
    alignCenter: { justifyContent: 'center' },
    headerText: { color: theme.colors.placeholder, fontSize: theme.fontSize.medium },
    classFeeText: { color: theme.colors.text, fontWeight: '600', fontSize: theme.fontSize.normal },
    totalFeeText: { color: theme.colors.accent, fontWeight: 'bold', fontSize: theme.fontSize.normal },
  });

export default memo(DateDifferenceTable);
