import { NavigationParams, NavigationRoute, NavigationScreenProp, withNavigation } from 'react-navigation';
import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import DeleteBlockButton from './DeleteBlockButton';
import { MySnackbarAction } from '../MySnackbar';
import { getMyBlockedClass } from '../../customGraphqls';
import gql from 'graphql-tag';
import reportSentry from '../../functions/reportSentry';
import { getTheme } from '../../configs/theme';
import { useQuery } from '@apollo/react-hooks';
import { AppearanceType } from '../../types/store';

interface Props {
  classId: string;
  snackbarDispatch: (arg: MySnackbarAction) => void;
  myId: string;
  navigation: NavigationScreenProp<NavigationRoute<NavigationParams>, NavigationParams>;
  updateQuery: any;
  appearance: AppearanceType;
}

const GET_MY_BLOCKED_CLASS = gql(getMyBlockedClass);

const MyBlockedClassCard = ({ classId, snackbarDispatch, myId, navigation, updateQuery, appearance }: Props) => {
  const { error, data } = useQuery(GET_MY_BLOCKED_CLASS, {
    variables: { id: classId },
    fetchPolicy: 'cache-first',
  });

  if (!data || !data.getClass) {
    return null;
    // return <Loading size={5} />;
  }

  if (error) {
    reportSentry(error);
    return null;
  }

  const {
    id,
    title,
    host: { id: hostId },
    blockedBy,
  } = data.getClass;

  const _handleOnPress = () => navigation.navigate('ClassView', { classId: id, hostId, origin: 'MyBlockedList' });

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity onPress={_handleOnPress}>
        <Text style={styles.cardTitleText} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
      </TouchableOpacity>
      <DeleteBlockButton
        myId={myId}
        classId={classId}
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

export default memo(withNavigation(MyBlockedClassCard));
