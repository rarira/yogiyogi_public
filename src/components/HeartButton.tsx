import { TouchableOpacity, TouchableWithoutFeedbackProps } from 'react-native';
import React, { memo, useEffect, useState } from 'react';
import { addHeart, removeHeart } from '../functions/manageHearts';
import { useStoreDispatch, useStoreState } from '../stores/initStore';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getTheme } from '../configs/theme';

interface Props extends TouchableWithoutFeedbackProps {
  parallaxHeaderVisible?: boolean;
  needMarginRight?: boolean;
  item: any;
  size?: number;
  setNeedAuthVisible?: (arg: boolean) => void;
}
const HeartButton = ({ needMarginRight, parallaxHeaderVisible, item, size, setNeedAuthVisible, ...rest }: Props) => {
  const [hearted, setHearted] = useState(false);

  const {
    authStore: { user, hearts, appearance },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();
  const theme = getTheme(appearance);

  useEffect(() => {
    let _mounted = true;
    if (_mounted && hearts) {
      const bool = hearts[item.id] ? true : false;
      setHearted(bool);
    }
    return () => {
      _mounted = false;
    };
  }, [hearts]);

  // console.log('reload, ', bookmarked, item);

  const _handleOnPress = () => {
    const heartItem = {
      id: item.id,
      title: item.title,
      tagSearchable: item.tagSearchable,
      regionSearchable: item.regionSearchable,
      host: {
        id: item.host.id,
      },
      dateStart: item.dateStart,
      timeStart: item.timeStart,
      classFee: item.classFee,
    };
    const args = { item: heartItem, storeDispatch, hearts };

    if (!user && !!setNeedAuthVisible) {
      setNeedAuthVisible(true);
    } else if (hearted) {
      removeHeart(args);
    } else {
      addHeart(args);
    }
  };

  const color = hearted ? theme.colors.red : parallaxHeaderVisible ? theme.colors.background : theme.colors.placeholder;

  const iconName = hearted ? 'heart' : 'heart-outline';

  // if (!user) return null;
  return (
    <TouchableOpacity
      onPress={_handleOnPress}
      hitSlop={{ top: 15, left: 15, bottom: 15, right: 15 }}
      {...rest}
      {...(needMarginRight && { style: { marginRight: theme.size.medium } })}
    >
      <Icon name={iconName} size={size || theme.iconSize.big} color={color} />
    </TouchableOpacity>
  );
};

export default memo(HeartButton);
