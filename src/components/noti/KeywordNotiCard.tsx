import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import DeleteButton from '../DeleteButton';
import KoreanParagraph from '../KoreanParagraph';
import { NewClassNotiType } from '../../types/store';
import TimeDistance from '../TimeDistance';
import { removeNewClassNoti } from '../../functions/manageNewClassNotis';
import { getTheme } from '../../configs/theme';
import throttle from 'lodash/throttle';

interface Props extends NavigationInjectedProps {
  item: NewClassNotiType;
}

const KeywordNotiCard = ({ item, navigation }: Props) => {
  const {
    authStore: { newClassNotis, appearance },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  const { title, classId, hostId, keywordsMatched, region, isRegionMatched, createdAt } = item;
  const _handleOnPress = () => navigation.navigate('ClassView', { classId, hostId, origin: 'NotiList' });
  const _handleClear = () => removeNewClassNoti({ item, storeDispatch, newClassNotis });

  return (
    <View style={styles.rowContainer}>
      <TouchableOpacity key={classId} style={styles.container} onPress={_handleOnPress}>
        <KoreanParagraph
          text={keywordsMatched ? keywordsMatched.join(',') : ''}
          textStyle={styles.tagText}
          // paragraphStyle={{ flex: 1, marginBottom: theme.size.xs }}
          numberOfLines={2}
        />

        <Text style={styles.titleText}>{title}</Text>

        <View style={styles.headRow}>
          <TimeDistance time={createdAt} />
          <Text style={[styles.tagText, !isRegionMatched && styles.tagNormal]}>@{region}</Text>
        </View>
      </TouchableOpacity>
      <DeleteButton handleOnPress={throttle(_handleClear, 1000)} needMarginLeft appearance={appearance} />
    </View>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    rowContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.size.normal,
      paddingRight: theme.size.big,
      borderColor: theme.colors.disabled,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: theme.size.small,
    },
    container: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
    },
    headRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    tagText: {
      fontSize: theme.size.normal,
      color: theme.colors.focus,
      fontWeight: 'bold',
    },
    tagNormal: { color: theme.colors.text, fontWeight: 'normal' },
    titleText: {
      fontSize: theme.size.medium,
      color: theme.colors.text,
      marginVertical: theme.size.small,
    },
  });
export default memo(withNavigation(KeywordNotiCard));
