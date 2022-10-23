import { Dialog } from 'react-native-paper';
import { AppearanceType } from '../types/store';
import { getThemeColor } from '../configs/theme';
import React, { FunctionComponent } from 'react';
import { useStoreState } from '../stores/initStore';
import { StyleSheet } from 'react-native';

interface Props {}

const MyDialogTitle: FunctionComponent<Props> = ({ children, ...rest }) => {
  const {
    authStore: { appearance },
  } = useStoreState();
  const styles = getThemedStyles(appearance);

  return (
    <Dialog.Title style={styles.text} {...rest}>
      {children}
    </Dialog.Title>
  );
};

const getThemedStyles = (appearance: AppearanceType) =>
  StyleSheet.create({
    text: {
      color: getThemeColor('text', appearance),
    },
  });

export default MyDialogTitle;
