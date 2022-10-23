import { CHANGE_REGISTER_CENTER_STATE, UPDATE_ADDRESS_SELECTED } from '../../stores/actionTypes';
import { Keyboard, Platform, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import React, { useMemo, useState } from 'react';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import BackButton from '../BackButton';
import Body from '../Body';
import CancelButton from '../CancelButton';
import FocusText from '../FocusText';
import HeadlineSub from '../HeadlineSub';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import KeyboardDismissButton from '../KeyboardDismissButton';
import Left from '../Left';
import NextProcessButton from '../NextProcessButton';
import PageCounter from '../PageCounter';
import ResetFormButton from '../ResetFormButton';
import Right from '../Right';
// import { ScrollView } from 'react-navigation';
import SingleLineInputField from '../SingleLineInputField';
import SwitchStackHeader from '../SwitchStackHeader';
import { getCompStyles } from '../../configs/compStyles';

// import { normalize } from '../../configs/theme';

interface Props {
  setCancelVisible: (arg: boolean) => void;
}

const NewAddressCenter = ({ setCancelVisible }: Props) => {
  const [detailAddress, setDetailAddress] = useState('');

  const {
    centerStore: { addressSelected },
    authStore: { appearance },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();
  const compStyles = getCompStyles(appearance);

  const onPress = () =>
    storeDispatch({
      type: UPDATE_ADDRESS_SELECTED,
      ...(detailAddress && {
        addressSelected: {
          ...addressSelected,
          address_name: `${addressSelected.address_name} ${detailAddress}`,
        },
      }),
    });

  const _handleOnChangeText = (input: string) => setDetailAddress(input);
  const _handleResetForm = () => _handleOnChangeText('');

  const renderHeader = useMemo(() => {
    const _handleOnCancel = () => {
      Keyboard.dismiss();
      setCancelVisible(true);
    };
    const _handleOnBack = () => storeDispatch({ type: CHANGE_REGISTER_CENTER_STATE, registerCenterState: 'newCenter' });
    return (
      <SwitchStackHeader appearance={appearance}>
        <Left>
          <BackButton onPress={_handleOnBack} />
        </Left>
        <Body>
          <PageCounter pageNumber={2} totalPageNumber={3} />
        </Body>
        <Right>
          <KeyboardDismissButton needMarginRight />
          <CancelButton onPress={_handleOnCancel} />
        </Right>
      </SwitchStackHeader>
    );
  }, [storeDispatch, appearance]);

  const latLng = {
    latitude: Number(addressSelected.y),
    longitude: Number(addressSelected.x),
  };
  return (
    <View style={compStyles.flex1}>
      {renderHeader}

      <View style={compStyles.flex1}>
        <View style={compStyles.screenMarginHorizontal}>
          <HeadlineSub text="지도 상의 위치를 확인하신후 필요시 상세 주소를 입력하세요" />
        </View>
        <KeyboardAwareScrollView
          keyboardDismissMode="on-drag"
          onScrollBeginDrag={Keyboard.dismiss}
          contentContainerStyle={compStyles.flexGrow1}
          keyboardShouldPersistTaps="handled"
          // extraScrollHeight={normalize(20)}
          enableOnAndroid={true}
        >
          <View style={compStyles.mapContainer}>
            <MapView
              initialRegion={{
                ...latLng,
                latitudeDelta: 0.0058,
                longitudeDelta: 0.0058,
              }}
              style={compStyles.mapViewStyle}
              showsUserLocation={true}
              userLocationAnnotationTitle="현재 위치"
              zoomControlEnabled
              showsMyLocationButton={true}
            >
              <Marker coordinate={latLng} title={addressSelected.place_name} description={addressSelected.road_address_name} />
            </MapView>
          </View>
          <View style={[compStyles.screenMarginHorizontal, compStyles.focusContainer]}>
            <FocusText appearance={appearance}>{addressSelected.address_name}</FocusText>
            <SingleLineInputField
              labelText="상세 주소"
              placeholder="건물 층, 호수 등을 입력하세요 (선택)"
              value={detailAddress}
              onChangeText={_handleOnChangeText}
              withFormik={false}
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
              // maxLength={20}
            />
          </View>
          <View style={[compStyles.pressButtonsInARow, compStyles.screenMarginHorizontal]}>
            {detailAddress !== '' && Platform.OS === 'android' && <ResetFormButton onPress={_handleResetForm} />}
            <NextProcessButton onPress={onPress} containerStyle={compStyles.flex1} marginHorizontalNeedless />
          </View>
        </KeyboardAwareScrollView>
      </View>
    </View>
  );
};

export default NewAddressCenter;
