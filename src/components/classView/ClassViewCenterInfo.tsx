import { CenterType, GetClassQuery } from '../../API';
import { Linking, Platform, View } from 'react-native';
import React, { memo } from 'react';

import CenterMapView from './CenterMapView';
import ClassSummaryDataTableRow from '../ClassSummaryDataTableRow';
import theme, { getTheme } from '../../configs/theme';
import ThemedButton from '../ThemedButton';
import { AppearanceType } from '../../types/store';

interface Props {
  item: Partial<GetClassQuery['getClass']>;
  isAdminPost: boolean;
  appearance: AppearanceType;
}
const ClassViewCenterInfo = ({ item, isAdminPost, appearance }: Props) => {
  const { lat, lng, name, address, tel, homepage, type } = item!.center!;
  const theme = getTheme(appearance);

  const centerDataStyle = {
    property: { flex: 2 },
    valueText: { color: theme.colors.placeholder },
    container: { marginHorizontal: theme.size.small, paddingVertical: theme.size.small, borderBottomWidth: 0 },
  };

  const numLat = Number(isAdminPost ? item!.extraInfo!.centerY : lat);
  const numLng = Number(isAdminPost ? item!.extraInfo!.centerX : lng);
  const centerName = isAdminPost ? item!.extraInfo?.centerName ?? '' : name!;

  const centerAddress = isAdminPost ? item!.extraInfo!.centerAddress : address!;
  const centerHomepage = isAdminPost ? item!.extraInfo!.centerHomepage : homepage;
  const centerPhone = isAdminPost ? item!.extraInfo!.centerPhone : tel;

  const _handleURL = (url: string) => () => Linking.openURL(url);

  const renderOpenURLButtons = (url: string) => (
    <ThemedButton icon="explore" mode="text" onPress={_handleURL(url)}>
      {type === CenterType.daumAPI ? '센터 카카오맵 페이지 보기' : '웹사이트 보기'}
    </ThemedButton>
  );

  const renderCallButtons = (phoneNumber: string) => (
    <ThemedButton icon="call" mode="text" onPress={_handleURL(`tel:${phoneNumber}`)} color={theme.colors.focus}>
      {phoneNumber}
    </ThemedButton>
  );

  const renderAddressButtons = (lat: string, lng: string) => {
    const geoString =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?ll=${lat},${lng}&q=${centerAddress}`
        : `geo:${lat},${lng}?q=${centerAddress}`;
    return (
      <ThemedButton icon="map" mode="text" onPress={_handleURL(geoString)} color={theme.colors.focus}>
        지도 앱에서 보기
      </ThemedButton>
    );
  };

  return (
    <>
      <CenterMapView latitude={numLat} longitude={numLng} address={centerAddress} name={centerName} />
      <View>
        <ClassSummaryDataTableRow
          property="센터 이름"
          value={centerName}
          style={centerDataStyle}
          appearance={appearance}
        />
        <ClassSummaryDataTableRow
          property="센터 주소"
          value={centerAddress}
          style={centerDataStyle}
          appearance={appearance}
        />
        {isAdminPost
          ? renderAddressButtons(item!.extraInfo!.centerY, item!.extraInfo!.centerX)
          : renderAddressButtons(lat!, lng!)}
        {centerPhone && renderCallButtons(centerPhone!)}
        {centerHomepage && renderOpenURLButtons(centerHomepage!)}
      </View>
    </>
  );
};

export default memo(ClassViewCenterInfo);
