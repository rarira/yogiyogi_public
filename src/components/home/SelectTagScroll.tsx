import React, { Dispatch, memo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { getTheme, normalize } from '../../configs/theme';

import MyChip from '../MyChip';
import { NavigationInjectedProps } from 'react-navigation';
import { SET_HOME_STATE } from '../../functions/useHomeState';
import { withNavigation } from 'react-navigation';
import { AppearanceType } from '../../types/store';

interface Props extends NavigationInjectedProps {
  subscribedTags: string[];
  homeDispatch: Dispatch<any>;
  choosedTag: string[] | null;
  appearance: AppearanceType;
}

const SelectTagScroll = ({ subscribedTags, homeDispatch, choosedTag, navigation, appearance }: Props) => {
  const _handleSubs = () => navigation.navigate('MySubs', { origin: 'Home' });
  const _handleChooseTag = (tag: string) => () => {
    let nextChoosedTag: string[];
    if (choosedTag?.includes(tag)) {
      nextChoosedTag = choosedTag.filter((item: string) => item !== tag);
    } else {
      nextChoosedTag = (choosedTag || []).concat([tag]);
    }
    homeDispatch({ type: SET_HOME_STATE, choosedTag: nextChoosedTag });
  };

  const theme = getTheme(appearance);
  const styles = getThemedStyles(theme);

  return (
    <ScrollView alwaysBounceHorizontal={false} contentContainerStyle={styles.container} horizontal={true}>
      {subscribedTags.length === 0 && (
        <TouchableOpacity onPress={_handleSubs}>
          <Text style={styles.emptyText}>구독중인 키워드가 없습니다. 터치하여 키워드를 구독하세요</Text>
        </TouchableOpacity>
      )}
      {subscribedTags.map((tag: string) => {
        const choosed = choosedTag !== null && choosedTag.includes(tag);

        return <MyChip name={tag} key={tag} onPress={_handleChooseTag(tag)} choosed={choosed} fullName />;
      })}
    </ScrollView>
  );
};

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      marginVertical: theme.size.small,
      marginLeft: theme.size.big,
      paddingRight: normalize(50),
      width: 'auto',
    },

    tagText: { fontSize: theme.fontSize.medium },
    cancelButton: { marginHorizontal: 0, paddingHorizontal: 0 },
    emptyText: { fontSize: theme.fontSize.medium, color: theme.colors.placeholder },
  });

export default memo(withNavigation(SelectTagScroll));
