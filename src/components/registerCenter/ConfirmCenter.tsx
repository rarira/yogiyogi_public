import { Dialog } from 'react-native-paper';
import { CHANGE_REGISTER_CENTER_STATE, RESET_CENTER_STATE } from '../../stores/actionTypes';
import MapView, { Marker } from 'react-native-maps';
import { MySnackbarAction, OPEN_SNACKBAR } from '../MySnackbar';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { memo, useState } from 'react';
import { createCenter, createMyCenter } from '../../graphql/mutations';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import BackButton from '../BackButton';
import Body from '../Body';
import CancelButton from '../CancelButton';
import { CenterType } from '../../API';
import HeadlineSub from '../HeadlineSub';
import Left from '../Left';
import MyDialogContainer from '../MyDialogContainer';
import NextProcessButton from '../NextProcessButton';
import PageCounter from '../PageCounter';
import Right from '../Right';
import SwitchStackHeader from '../SwitchStackHeader';
import { View } from 'react-native';

import { customListMyCentersByUser } from '../../customGraphqls';
import gql from 'graphql-tag';
import produce from 'immer';
import reportSentry from '../../functions/reportSentry';
import throttle from 'lodash/throttle';
import { useMutation } from '@apollo/react-hooks';
import uuidv4 from 'uuid/v4';
import ThemedButton from '../ThemedButton';
import { getCompStyles } from '../../configs/compStyles';
import MyDialogTitle from '../MyDialogTitle';
import DialogContentText from '../DialogContentText';

interface Props extends NavigationInjectedProps {
  snackbarDispatch: (arg: MySnackbarAction) => void;
  setCancelVisible: (arg: boolean) => void;
}

const CREATE_CENTER = gql(createCenter);
const CREATE_MY_CENTER = gql(createMyCenter);
const LIST_MY_CENTERS = gql(customListMyCentersByUser);

const ConfirmCenter = ({ snackbarDispatch, navigation, setCancelVisible }: Props) => {
  const [createCenter, { loading: loading1 }] = useMutation(CREATE_CENTER);
  const [createMyCenter, { loading: loading2 }] = useMutation(CREATE_MY_CENTER);
  const [visible, setVisible] = useState(false);
  const {
    authStore,
    centerStore: { centerSelected, origin },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();
  const compStyles = getCompStyles(authStore.appearance);

  const registerButton = () => {
    return (
      <NextProcessButton
        loading={loading1 || loading2}
        disabled={loading1 || loading2}
        onPress={throttle(async () => {
          // console.log(centerSelected);
          try {
            const centerId = uuidv4();
            // Center Table 에 putItem 하되, 이미 기록되어 있는 경우는 에러 발생하지만 MyCenter Table에는 등록할 수 있게 조치
            try {
              await createCenter({
                variables: {
                  input: {
                    id: centerId,
                    type: CenterType.daumAPI,
                    name: centerSelected.place_name,
                    address: centerSelected.road_address_name || centerSelected.address_name,
                    lat: centerSelected.y,
                    lng: centerSelected.x,
                    apiId: centerSelected.id,
                    ...(centerSelected.phone !== '' && { tel: centerSelected.phone }),
                    ...(centerSelected.place_url !== '' && { homepage: centerSelected.place_url }),
                    ...(centerSelected.category_name !== '' && { category: centerSelected.category_name }),
                  },
                },
              });
            } catch (e) {
              // console.log(JSON.parse(JSON.stringify(e)));
              if (e.graphQLErrors[0].errorType !== 'DynamoDB:ConditionalCheckFailedException') {
                throw e;
              }
              // reportSentry(e);
            }
            // MyCenter 테이블에 putItem 등록
            await createMyCenter({
              variables: {
                input: {
                  id: uuidv4(),
                  createdAt: new Date().toISOString(),
                  myCenterCenterId: centerId,
                  myCenterUserId: authStore.user.username,
                },
              },
              update: (cache, { data: createMyCenterResult }) => {
                try {
                  const queryResult: any = cache.readQuery({
                    query: LIST_MY_CENTERS,
                    variables: { myCenterUserId: authStore.user.username },
                  });

                  const { items, ...others } = queryResult.listMyCentersByUser;
                  const { id, center, createdAt } = createMyCenterResult.createMyCenter;
                  const newCenter = {
                    id: id,
                    center: {
                      address: center.address,
                      id: center.id,
                      name: center.name,
                      type: center.type,
                      __typename: 'Center',
                    },
                    createdAt: createdAt,
                    __typename: 'MyCenter',
                  };
                  const newItems = produce(items, (draft: any[]) => {
                    draft.push(newCenter);
                  });
                  const newData = { listMyCentersByUser: { items: newItems, ...others } };
                  cache.writeQuery({
                    query: LIST_MY_CENTERS,
                    variables: { myCenterUserId: authStore.user.username },
                    data: newData,
                  });
                } catch (e) {
                  console.log(e);
                }
              },
            });
            setVisible(true);
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
        children="마이센터에 추가"
      />
    );
  };

  const renderHeader = () => (
    <SwitchStackHeader appearance={authStore.appearance}>
      <Left>
        <BackButton
          onPress={() => storeDispatch({ type: CHANGE_REGISTER_CENTER_STATE, registerCenterState: 'searchCenter' })}
        />
      </Left>
      <Body>
        <PageCounter pageNumber={2} totalPageNumber={2} />
      </Body>
      <Right>
        <CancelButton onPress={() => setCancelVisible(true)} />
      </Right>
    </SwitchStackHeader>
  );

  const _handleDialogOnPress = () => {
    storeDispatch({ type: RESET_CENTER_STATE, registerCenterState: 'searchCenter' });
    navigation.navigate(origin);
  };

  return (
    <>
      {renderHeader()}
      <View
        style={{
          flex: 1,
        }}
      >
        <View style={compStyles.screenMarginHorizontal}>
          {/* <MyHeadline>위치 확인</MyHeadline> */}
          <HeadlineSub text="지도 상의 위치를 확인하신후 아래 버튼을 터치하여 추가하세요" />
        </View>
        <View style={compStyles.mapContainer}>
          <MapView
            initialRegion={{
              latitude: Number(centerSelected.y),
              longitude: Number(centerSelected.x),
              latitudeDelta: 0.0058,
              longitudeDelta: 0.0058,
            }}
            style={compStyles.mapViewStyle}
            showsUserLocation={true}
            userLocationAnnotationTitle="현재 위치"
            zoomControlEnabled
            showsMyLocationButton={true}
          >
            <Marker
              coordinate={{ latitude: Number(centerSelected.y), longitude: Number(centerSelected.x) }}
              title={centerSelected.place_name}
              description={centerSelected.road_address_name}
            />
          </MapView>
        </View>
        {registerButton()}
      </View>

      <MyDialogContainer visible={visible} onDismiss={() => {}}>
        <MyDialogTitle>마이센터 추가 완료</MyDialogTitle>
        <Dialog.Content>
          <DialogContentText bold text={centerSelected.place_name} />
          <DialogContentText text="을/를 성공적으로 추가하였습니다" />
        </Dialog.Content>
        <Dialog.Actions>
          <ThemedButton onPress={_handleDialogOnPress}>확인</ThemedButton>
        </Dialog.Actions>
      </MyDialogContainer>
    </>
  );
};

export default memo(withNavigation(ConfirmCenter));
