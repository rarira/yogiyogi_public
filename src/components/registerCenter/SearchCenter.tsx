import { Dialog, Searchbar } from 'react-native-paper';
import { CHANGE_CENTER_SELECTED, CHANGE_REGISTER_CENTER_STATE, CHOOSE_RESELECT, RESET_CENTER_STATE } from '../../stores/actionTypes';
import Downshift, { ControllerStateAndHelpers, DownshiftState, StateChangeOptions } from 'downshift';
import { FlatList, Keyboard, View } from 'react-native';
import { MySnackbarAction, OPEN_SNACKBAR } from '../MySnackbar';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import React, { useEffect, useState } from 'react';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import Body from '../Body';
import CancelButton from '../CancelButton';
import { Center } from '../../types/store';
import HeadlineSub from '../HeadlineSub';
import { KakaoAPIKey } from '../../configs/apiKeys';
import KeyboardDismissButton from '../KeyboardDismissButton';
import KoreanParagraph from '../KoreanParagraph';
import Left from '../Left';
import MyDialogContainer from '../MyDialogContainer';
import MyHeadline from '../MyHeadline';
import NextProcessButton from '../NextProcessButton';
import PageCounter from '../PageCounter';
import Right from '../Right';
import SearchCenterResultsCard from './SearchCenterResultsCard';
import SwitchStackHeader from '../SwitchStackHeader';
import axios from 'axios';
import debounce from 'lodash/debounce';
import reportSentry from '../../functions/reportSentry';
import { getTheme, getThemeColor } from '../../configs/theme';
import { getCompStyles } from '../../configs/compStyles';
import MyDialogTitle from '../MyDialogTitle';
import ThemedButton from '../ThemedButton';
import DialogContentText from '../DialogContentText';

interface Props extends NavigationInjectedProps {
  snackbarDispatch: (arg: MySnackbarAction) => void;
}

const SearchCenter = ({ snackbarDispatch, navigation }: Props) => {
  const [visible, setVisible] = useState(false);
  const [resultState, setResultState] = useState('ok');
  const [items, setItems] = useState<Array<Center>>([]);

  const {
    authStore: { appearance },
    centerStore: { centerSelected, clearSelected, myCenters, origin },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();
  const theme = getTheme(appearance);
  const compStyles = getCompStyles(appearance);

  useEffect(() => {
    if (!centerSelected && clearSelected) {
      clearSelected();
    }
  }, [centerSelected]);

  const _handleOnInputValueChange = async (inputValue: string, stateAndHelpers: ControllerStateAndHelpers<Center>) => {
    if (!inputValue) {
      return;
    } else if (inputValue.length <= 2) {
      setResultState('tooShortQuery');
      return;
    } else if (stateAndHelpers.selectedItem) {
      return;
    }

    await fetchLists(inputValue);
  };

  const _handleOnChange = (item: Center | null, state: ControllerStateAndHelpers<Center>) => {
    Keyboard.dismiss();
    if (state.selectedItem) {
      if (myCenters.includes(item!.id)) {
        snackbarDispatch({
          type: OPEN_SNACKBAR,
          message: '?????? ????????? ???????????????',
          sideEffect: () => state.clearSelection(),
          snackbarType: 'error',
        });
      } else {
        storeDispatch({
          type: CHANGE_CENTER_SELECTED,
          centerSelected: item,
          clearSelected: state.clearSelection,
        });
        setVisible(true);
      }
    }
  };

  const fetchLists = debounce(
    async (input: string) => {
      let page = 1;
      let tempArray: Center[] = [];
      try {
        do {
          const result: any = await axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
            params: {
              query: input,
              size: 15,
              page,
            },
            headers: {
              Authorization: `KakaoAK ${KakaoAPIKey}`,
            },
          });

          if (result.data.meta.total_count > 200) {
            setResultState('tooManyResults');
            break;
          }
          setResultState('ok');
          tempArray = tempArray.concat(result.data.documents);

          if (result.data.meta.is_end) break;
          page++;
        } while (true);
      } catch (e) {
        reportSentry(e);
      }

      setItems(tempArray);
    },
    250,
    { leading: true, trailing: false },
  );

  // ????????? ???????????? ????????? dismissed ?????? ??????????????? ?????????
  const preventResetOnBlur = (state: DownshiftState<Center>, changes: StateChangeOptions<Center>) => {
    // console.log(state, changes);
    if (changes.type === Downshift.stateChangeTypes.blurInput) {
      return {}; // no-changes
    }
    return changes;
  };

  const registerButton = (mode: string) => {
    const _handleOnPress = () => storeDispatch({ type: RESET_CENTER_STATE, registerCenterState: 'newCenter' });
    return (
      <View style={compStyles.inMenuContentView}>
        {mode === 'new' ? (
          <KoreanParagraph
            text="???????????? ?????? ?????? ?????????????????? ?????? ????????? ???????????????"
            textStyle={compStyles.resultText}
            paragraphStyle={compStyles.resultParagraph}
          />
        ) : mode === 'footer' ? (
          <KoreanParagraph
            text="???????????? ????????? ???????????? ????????? ?????? ???????????? ????????????????????? ?????? ????????? ???????????? ?????? ???????????????"
            textStyle={compStyles.resultText}
            paragraphStyle={compStyles.resultParagraph}
          />
        ) : (
          <View>
            <KoreanParagraph text="?????? ????????? ????????????" textStyle={compStyles.noResultText} paragraphStyle={compStyles.resultParagraph} />
            <KoreanParagraph
              text="?????? ???????????? ????????????????????? ?????? ????????? ???????????? ?????? ???????????????"
              textStyle={compStyles.noResultText}
              paragraphStyle={compStyles.resultParagraph}
            />
          </View>
        )}
        <NextProcessButton onPress={_handleOnPress} children="?????? ??????" containerStyle={{ width: '50%' }} />
      </View>
    );
  };

  const renderHeader = () => {
    const _handleOnPress = () => navigation.navigate(origin);
    return (
      <SwitchStackHeader appearance={appearance}>
        <Left>
          <CancelButton onPress={_handleOnPress} />
        </Left>
        <Body>
          <PageCounter pageNumber={1} totalPageNumber={2} />
        </Body>
        <Right>
          <KeyboardDismissButton />
        </Right>
      </SwitchStackHeader>
    );
  };

  const renderResults = (getItemProps: any, selectedItem: Center) => {
    const renderItem = ({ item }: { item: Center }) => (
      <SearchCenterResultsCard item={item} selectedItem={selectedItem} getItemProps={getItemProps} appearance={appearance} />
    );

    switch (resultState) {
      case 'tooManyResults':
        return (
          <>
            <KoreanParagraph
              text="??????????????? ?????? ????????????. ??? ??????????????? ???????????????"
              textStyle={compStyles.noResultText}
              paragraphStyle={compStyles.noResultParagraph}
            />
            {registerButton('new')}
          </>
        );
      case 'tooShortQuery':
        return (
          <>
            <KoreanParagraph
              text="???????????? ?????? ????????????. 3??? ?????? ???????????????"
              textStyle={compStyles.noResultText}
              paragraphStyle={compStyles.noResultParagraph}
            />
            {registerButton('new')}
          </>
        );
      case 'ok':
        return (
          <FlatList
            data={items}
            keyExtractor={(item: Center) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={renderItem}
            contentContainerStyle={compStyles.flatListContentContainer}
            style={compStyles.flatListContainer}
            ListEmptyComponent={() => registerButton('empty')}
            ListFooterComponent={items.length !== 0 ? () => registerButton('footer') : null}
            keyboardDismissMode="on-drag"
            onScrollBeginDrag={Keyboard.dismiss}
          />
        );
    }
  };

  return (
    <>
      {renderHeader()}
      <View style={[compStyles.flex1, , compStyles.screenMarginHorizontal]}>
        <MyHeadline>?????? ??????</MyHeadline>
        <HeadlineSub text="??????????????? ???????????? ????????? ????????? ?????? ????????? ???????????? ??? ??????????????? ???????????? ???????????????" />

        <Downshift
          itemToString={x => {
            return x ? x.place_name : '';
          }}
          onChange={_handleOnChange}
          onInputValueChange={_handleOnInputValueChange}
          stateReducer={preventResetOnBlur}
        >
          {({ getRootProps, getInputProps, getItemProps, isOpen, selectedItem }) => {
            return (
              <View
                style={compStyles.flex1}
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
                  autoCapitalize="none"
                  style={{
                    elevation: visible ? 0 : 2,
                  }}
                  // theme={theme}
                />
                {!isOpen && items.length === 0 && registerButton('new')}
                {isOpen && renderResults(getItemProps, selectedItem!)}
              </View>
            );
          }}
        </Downshift>
      </View>

      <MyDialogContainer
        visible={visible}
        onDismiss={() => {
          setVisible(false);
        }}
        dismissable={false}
      >
        <MyDialogTitle>?????? ?????? ??????</MyDialogTitle>
        <Dialog.Content>
          <DialogContentText bold text={centerSelected && centerSelected.place_name} />
          <DialogContentText text="??? ?????????????????????????" />
        </Dialog.Content>
        <Dialog.Actions>
          <ThemedButton
            onPress={() => {
              setVisible(false);
              storeDispatch({
                type: CHOOSE_RESELECT,
              });
            }}
            color={getThemeColor('accent', appearance)}
          >
            ?????? ??????
          </ThemedButton>
          <ThemedButton
            onPress={() => {
              storeDispatch({ type: CHANGE_REGISTER_CENTER_STATE, registerCenterState: 'confirmCenter' });
            }}
          >
            ??????
          </ThemedButton>
        </Dialog.Actions>
      </MyDialogContainer>
    </>
  );
};

export default withNavigation(SearchCenter);
