import { MySnackbarAction, OPEN_SNACKBAR } from '../MySnackbar';
import { ScrollView, Text, View } from 'react-native';
import { memo, useEffect, useState } from 'react';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import AddClassHeader from './AddClassHeader';
import { CHANGE_ADD_CLASS_STATE } from '../../stores/actionTypes';
import HeadlineSub from '../HeadlineSub';
import { List } from 'react-native-paper';
import ListMyCenters from '../ListMyCenters';
import NextProcessButton from '../NextProcessButton';
import React from 'react';
import { getCompStyles } from '../../configs/compStyles';

interface Props {
  snackbarDispatch: (arg: MySnackbarAction) => void;
  setCancelVisible: (arg: boolean) => void;
}

const MyCenterClass = ({ setCancelVisible, snackbarDispatch }: Props) => {
  const [newCenterChoosed, setNewCenterChoosed] = useState(false);

  const {
    authStore,
    classStore: { summary, center, repostMode },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();
  const compStyles = getCompStyles(authStore.appearance);

  const [selectedMyCenter, setSelectedMyCenter] = useState({
    id: center ? center.id : '',
    address: center ? center.address : '',
    name: center ? center.name : '',
  });

  useEffect(() => {
    let _mounted = true;
    if (_mounted) {
      if (center && selectedMyCenter.id !== center.id) {
        setNewCenterChoosed(true);
      }
    }
    return () => {
      _mounted = false;
    };
  }, [center, selectedMyCenter.id]);

  const _handleOnPress = () => {
    if (selectedMyCenter.id === '') {
      snackbarDispatch({
        type: OPEN_SNACKBAR,
        message: '하나의 마이센터를 반드시 선택하세요',
      });
    } else {
      storeDispatch({
        type: CHANGE_ADD_CLASS_STATE,
        addClassState: summary ? 'confirmClass' : 'tagClass',
        center: selectedMyCenter,
      });
    }
  };

  const subHeadlineText = repostMode
    ? '기존 선택 센터를 그대로 이용하시려면 다음으로 진행하시고 아니면 아래 목록에서 오른쪽 동그라미를 터치하여 새로 선택하세요'
    : '클래스가 이루어질 장소를 마이센터에서 오른쪽 동그라미를 터치하여 선택하세요. 마이센터가 없을 경우 새로 추가하신 후 선택하세요';
  return (
    <>
      <AddClassHeader backRoute="expireClass" setCancelVisible={setCancelVisible} summary={summary} pageCounterNumber={5} />
      <ScrollView
        alwaysBounceVertical={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={compStyles.scrollViewContainer}
      >
        <View style={compStyles.screenMarginHorizontal}>
          <HeadlineSub text={subHeadlineText} />
        </View>
        {repostMode && !newCenterChoosed && (
          <View style={compStyles.screenMarginHorizontal}>
            <Text style={compStyles.listFont}>기존 선택 센터</Text>
            <List.Item
              title={center.name}
              description={center.address}
              style={compStyles.listItem}
              descriptionStyle={compStyles.listItemDescription}
              titleStyle={compStyles.listItemTitle}
            />
          </View>
        )}

        <ListMyCenters
          authStore={authStore}
          storeDispatch={storeDispatch}
          snackbarDispatch={snackbarDispatch}
          setSelectedMyCenter={setSelectedMyCenter}
          selectedMyCenter={selectedMyCenter}
        />
        <NextProcessButton children={summary ? '수정 완료' : ''} onPress={_handleOnPress} />
      </ScrollView>
    </>
  );
};
export default memo(MyCenterClass);
