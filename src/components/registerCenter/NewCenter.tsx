import { Dialog, Searchbar } from 'react-native-paper';
import { CHANGE_ADDRESS_SELECTED, CHANGE_REGISTER_CENTER_STATE, CHOOSE_RESELECT } from '../../stores/actionTypes';
import Downshift, { ControllerStateAndHelpers, DownshiftState, StateChangeOptions } from 'downshift';
import { FlatList, Keyboard, View } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import { Address } from 'aws-sdk/clients/ec2';
import BackButton from '../BackButton';
import Body from '../Body';
import CancelButton from '../CancelButton';
import { Center } from '../../types/store';
import HeadlineSub from '../HeadlineSub';
import { KakaoAPIKey } from '../../configs/apiKeys';
import KeyboardDismissButton from '../KeyboardDismissButton';
import Left from '../Left';
import MyDialogContainer from '../MyDialogContainer';
import MyHeadline from '../MyHeadline';
import NewCenterResultsCard from './NewCenterResultsCard';
import NewCenterTip from './NewCenterTip';
import PageCounter from '../PageCounter';
import Right from '../Right';
import SwitchStackHeader from '../SwitchStackHeader';
import axios from 'axios';

import debounce from 'lodash/debounce';

import ThemedButton from '../ThemedButton';
import { getCompStyles } from '../../configs/compStyles';
import { getThemeColor } from '../../configs/theme';
import MyDialogTitle from '../MyDialogTitle';
import DialogContentText from '../DialogContentText';

interface Props {
  cancelVisible: boolean;
  setCancelVisible: (arg: boolean) => void;
}

const NewCenter = ({ cancelVisible, setCancelVisible }: Props) => {
  const [visible, setVisible] = useState(false);

  const [items, setItems] = useState<Array<Address>>([]);

  const {
    authStore: { appearance },
    centerStore: { addressSelected, clearSelected },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();
  const compStyles = getCompStyles(appearance);

  useEffect(() => {
    if (!addressSelected && clearSelected) {
      clearSelected();
    }
  }, [addressSelected]);

  const _handleOnInputValueChage = async (inputValue: string, stateAndHelpers: ControllerStateAndHelpers<Center>) => {
    if (!inputValue) {
      return;
    } else if (stateAndHelpers.selectedItem) {
      return;
    }
    await fetchLists(inputValue);
  };

  const fetchLists = debounce(
    async (input: string) => {
      let page = 1;
      let tempArray: Address[] = [];

      do {
        const result: any = await axios.get('https://dapi.kakao.com/v2/local/search/address.json', {
          params: {
            query: input,
            size: 30,
            page,
          },
          headers: {
            Authorization: `KakaoAK ${KakaoAPIKey}`,
          },
        });
        tempArray = tempArray.concat(result.data.documents);
        if (result.data.meta.is_end) break;
        page++;
      } while (true);
      setItems(tempArray);
    },
    250,
    { leading: true, trailing: false },
  );

  const _handleOnChange = (item: Center | null, state: ControllerStateAndHelpers<Center>) => {
    Keyboard.dismiss();
    if (state.selectedItem) {
      storeDispatch({
        type: CHANGE_ADDRESS_SELECTED,
        addressSelected: item,
        clearSelected: state.clearSelection,
      });
      setVisible(true);
    }
  };

  // ????????? ???????????? ????????? dismissed ?????? ??????????????? ?????????
  const preventResetOnBlur = (state: DownshiftState<Center>, changes: StateChangeOptions<Center>) => {
    // console.log(state, changes);
    if (changes.type === Downshift.stateChangeTypes.blurInput) {
      return {}; // no-changes
    }
    return changes;
  };

  const renderTip = (mode: string | undefined) => <NewCenterTip mode={mode} appearance={appearance} />;

  const renderHeader = useMemo(() => {
    const _handleOnCancel = () => {
      Keyboard.dismiss();
      setCancelVisible(true);
    };
    const _handleOnBack = () =>
      storeDispatch({
        type: CHANGE_REGISTER_CENTER_STATE,
        registerCenterState: 'searchCenter',
      });
    return (
      <SwitchStackHeader appearance={appearance}>
        <Left>
          <BackButton onPress={_handleOnBack} />
        </Left>
        <Body>
          <PageCounter pageNumber={1} totalPageNumber={3} />
        </Body>
        <Right>
          <KeyboardDismissButton needMarginRight />
          <CancelButton onPress={_handleOnCancel} />
        </Right>
      </SwitchStackHeader>
    );
  }, [storeDispatch, appearance]);

  const _handleOnPress = () => {
    storeDispatch({ type: CHANGE_REGISTER_CENTER_STATE, registerCenterState: 'newAddressCenter' });
  };
  const _handleReselect = () => {
    setVisible(false);
    storeDispatch({
      type: CHOOSE_RESELECT,
    });
  };

  const _handleOnDismiss = () => {
    setVisible(false);
  };
  return (
    <>
      {renderHeader}
      <View
        style={[
          {
            flex: 1,
          },
          compStyles.screenMarginHorizontal,
        ]}
      >
        <MyHeadline>?????? ??????</MyHeadline>
        <HeadlineSub text="?????? ???????????? ????????? ????????? ??????????????? ??????????????? ???????????? ???????????????" />
        <Downshift
          itemToString={x => {
            return x ? x.address_name : '';
          }}
          onChange={_handleOnChange}
          onInputValueChange={_handleOnInputValueChage}
          stateReducer={preventResetOnBlur}
        >
          {({ getRootProps, getInputProps, getItemProps, isOpen, selectedItem }) => {
            const renderItem = ({ item }: { item: any }) => (
              <NewCenterResultsCard
                item={item}
                selectedItem={selectedItem}
                getItemProps={getItemProps}
                appearance={appearance}
              />
            );

            return (
              <View
                style={{
                  flex: 1,
                }}
                {...getRootProps(
                  {
                    refKey: 'innerRef',
                  },
                  {
                    suppressRefError: true,
                  },
                )}
              >
                <Searchbar
                  {...getInputProps()}
                  autoCorrect={false}
                  style={{ elevation: visible || cancelVisible ? 0 : 2 }}
                />
                {!isOpen && renderTip('guide')}
                {isOpen && (
                  <>
                    <FlatList
                      data={items}
                      keyExtractor={(item: any, index: number) => `${item.x}${item.y}${index}`}
                      keyboardShouldPersistTaps="handled"
                      renderItem={renderItem}
                      contentContainerStyle={compStyles.flatListContentContainer}
                      style={compStyles.flatListContainer}
                      ListEmptyComponent={renderTip('empty')}
                      keyboardDismissMode="on-drag"
                      onScrollBeginDrag={Keyboard.dismiss}
                    />
                  </>
                )}
              </View>
            );
          }}
        </Downshift>
      </View>

      <MyDialogContainer visible={visible} onDismiss={_handleOnDismiss} dismissable={false}>
        <MyDialogTitle>?????? ?????? ??????</MyDialogTitle>
        <Dialog.Content>
          <DialogContentText bold text={addressSelected && addressSelected.address_name} />
          <DialogContentText text="??? ?????????????????????????" />
        </Dialog.Content>
        <Dialog.Actions>
          <ThemedButton onPress={_handleReselect} color={getThemeColor('accent', appearance)}>
            ?????? ??????
          </ThemedButton>
          <ThemedButton onPress={_handleOnPress}>??????</ThemedButton>
        </Dialog.Actions>
      </MyDialogContainer>
    </>
  );
};

export default NewCenter;
