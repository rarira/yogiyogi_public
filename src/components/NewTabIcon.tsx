import React, { memo } from 'react';
import { getThemeColor } from '../configs/theme';
import { useStoreDispatch, useStoreState } from '../stores/initStore';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import NewButtonModal from './NewButtonModal';
import { SET_AUTHSTORE_STATE } from '../stores/actionTypes';
import { TouchableOpacity } from 'react-native';

const NewTabIcon = () => {
  const {
    authStore: { isNewButtonTouched, appearance },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();

  const _handleTouch = () => {
    storeDispatch({ type: SET_AUTHSTORE_STATE, isNewButtonTouched: !isNewButtonTouched });
  };

  const size = isNewButtonTouched ? 30 : 26;

  // });
  return (
    <>
      <NewButtonModal />
      <TouchableOpacity
        style={{
          width: size * 2,
          height: size * 2,
          backgroundColor: !isNewButtonTouched
            ? getThemeColor('primary', appearance)
            : getThemeColor('accent', appearance),
          borderRadius: (size * 2) / 2,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 110,
        }}
        onPress={_handleTouch}
      >
        <MaterialIcons name="add-circle" color={getThemeColor('uiBackground', appearance)} size={size} />
      </TouchableOpacity>
    </>
  );
};

export default memo(NewTabIcon);
