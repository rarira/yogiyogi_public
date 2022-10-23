import React, { memo } from 'react';

import { IconButton } from 'react-native-paper';
import Loading from './Loading';
import { MyCenterItem } from '../types/store';
import { MySnackbarAction } from './MySnackbar';
import { OPEN_SNACKBAR } from './MySnackbar';
import { StyleSheet } from 'react-native';
import { customListMyCentersByUser } from '../customGraphqls';
import { deleteMyCenter } from '../graphql/mutations';
import gql from 'graphql-tag';
import reportSentry from '../functions/reportSentry';

import { throttle } from 'lodash';
import { useMutation } from '@apollo/react-hooks';

interface Props {
  item: MyCenterItem;
  snackbarDispatch: (arg: MySnackbarAction) => void;
  username: string;
  theme: any;
}

const DELETE_MY_CENTER = gql(deleteMyCenter);
const LIST_MY_CENTERS = gql(customListMyCentersByUser);

const MyCenterDeleteButton = ({ item, snackbarDispatch, username, theme }: Props) => {
  const [deleteMyCenter, { loading }] = useMutation(DELETE_MY_CENTER);

  if (loading) {
    return (
      <Loading
        size={theme.fontSize.subheading}
        color={theme.colors.focus}
        style={styles.loadingIcon}
        origin="MyCenterDeleteButton"
      />
    );
  }
  return (
    <IconButton
      icon="clear"
      disabled={loading}
      color={theme.colors.placeholder}
      size={theme.fontSize.subheading}
      onPress={throttle(async () => {
        try {
          await deleteMyCenter({
            variables: {
              input: {
                id: item.id,
                createdAt: item.createdAt,
              },
            },
            update: cache => {
              const {
                listMyCentersByUser: { items, ...others },
              }: any = cache.readQuery({
                query: LIST_MY_CENTERS,
                variables: { myCenterUserId: username },
              });
              cache.writeQuery({
                query: LIST_MY_CENTERS,
                variables: { myCenterUserId: username },
                data: {
                  listMyCentersByUser: {
                    items: items.filter((center: MyCenterItem) => center.id !== item.id),
                    ...others,
                  },
                },
              });
            },
          });
          snackbarDispatch({
            type: OPEN_SNACKBAR,
            message: '삭제하였습니다',
          });
          // console.log(result);
        } catch (e) {
          reportSentry(e);
          // 에러 snackbar 출력
          snackbarDispatch({
            type: OPEN_SNACKBAR,
            message: e.message,
          });
        }
      }, 5000)}
    />
  );
};

const styles = StyleSheet.create({
  loadingIcon: { flex: 0, height: 28, width: 28, margin: 10 },
});

export default memo(MyCenterDeleteButton);
