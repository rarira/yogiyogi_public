import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import DeleteBlockButton from './DeleteBlockButton';
import { MySnackbarAction } from '../MySnackbar';
import { getMyBlockedPost } from '../../customGraphqls';
import gql from 'graphql-tag';
import reportSentry from '../../functions/reportSentry';
import { getTheme } from '../../configs/theme';
import { useQuery } from '@apollo/react-hooks';
import { AppearanceType } from '../../types/store';

interface Props extends NavigationInjectedProps {
  postId: string;
  snackbarDispatch: (arg: MySnackbarAction) => void;
  myId: string;
  updateQuery: any;
  appearance: AppearanceType;
}

const GET_MY_BLOCKED_POST = gql(getMyBlockedPost);

const MyBlockedPostCard = ({ postId, snackbarDispatch, myId, navigation, updateQuery, appearance }: Props) => {
  const { error, data } = useQuery(GET_MY_BLOCKED_POST, {
    variables: { id: postId },
    fetchPolicy: 'cache-first',
  });

  if (!data || !data.getPost) {
    return null;
    // return <Loading size={5} />;
  }

  if (error) {
    reportSentry(error);
    return null;
  }

  const { id, postTitle, blockedBy } = data.getPost;

  const _handleOnPress = () => navigation.navigate('PostView', { postId: id, origin: 'MyBlockedList' });

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity onPress={_handleOnPress}>
        <Text style={styles.cardTitleText} numberOfLines={1} ellipsizeMode="tail">
          {postTitle}
        </Text>
      </TouchableOpacity>
      <DeleteBlockButton
        myId={myId}
        postId={id}
        snackbarDispatch={snackbarDispatch}
        blockedBy={blockedBy}
        updateQuery={updateQuery}
      />
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    cardWrapper: {
      // flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: theme.size.small,
      borderColor: theme.colors.borderColor,
      borderWidth: StyleSheet.hairlineWidth,
      padding: 10,
      borderRadius: 8,
    },
    cardTitleText: {
      // flex: 1,
      color: theme.colors.text,
      fontSize: theme.fontSize.normal,
    },
  });

export default memo(withNavigation(MyBlockedPostCard));
