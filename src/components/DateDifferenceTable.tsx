import React, { memo } from 'react';

import { DataTable } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import differenceInCalendarDays from 'date-fns/difference_in_calendar_days';
import parse from 'date-fns/parse';
import theme from '../configs/theme';

interface Props {
  dateStart: string;
  dateEnd: string;
}

const DateDifferenceTable = ({ dateStart, dateEnd }: Props) => {
  const dateStartParsed = parse(dateStart);
  const dateEndParsed = parse(dateEnd);

  return (
    <DataTable style={styles.dataTableContainer}>
      <DataTable.Header style={styles.dataTableRow}>
        <DataTable.Title style={styles.alignCenter}>시작일</DataTable.Title>
        <DataTable.Title style={styles.alignCenter}>종료일</DataTable.Title>
        <DataTable.Title style={styles.alignCenter}>기간(일)</DataTable.Title>
      </DataTable.Header>
      <DataTable.Row style={styles.dataTableRow}>
        <DataTable.Cell style={styles.alignCenter}>{dateStart}</DataTable.Cell>
        <DataTable.Cell style={styles.alignCenter}>{dateEnd ? dateEnd : '미정'}</DataTable.Cell>
        <DataTable.Cell style={styles.alignCenter}>
          {dateEnd ? differenceInCalendarDays(dateEndParsed, dateStartParsed) + 1 : '미정'}
        </DataTable.Cell>
      </DataTable.Row>
    </DataTable>
  );
};

const styles = StyleSheet.create({
  dataTableContainer: { marginBottom: theme.size.big },
  dataTableRow: { borderBottomWidth: 0, height: 30, padding: 0 },
  alignCenter: { justifyContent: 'center' },
});

export default memo(DateDifferenceTable);
