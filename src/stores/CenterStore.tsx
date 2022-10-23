import {
  CHANGE_CENTER_SELECTED,
  CHOOSE_RESELECT,
  CHANGE_REGISTER_CENTER_STATE,
  CHANGE_ADDRESS_SELECTED,
  RESET_CENTER_STATE,
  REGISTER_MY_CENTER,
  UPDATE_ADDRESS_SELECTED,
} from './actionTypes';
import { StoreAction, CenterStoreType } from '../types/store';

export const centerInitialState: CenterStoreType = {
  registerCenterState: 'init',
  addressSelected: null,
  centerSelected: null,
  clearSelected: undefined,
  myCenters: null,
  origin: '',
};

export const centerReducer = (state: CenterStoreType, action: StoreAction) => {
  switch (action.type) {
    case CHANGE_CENTER_SELECTED:
      return {
        ...state,
        centerSelected: action.centerSelected,
        clearSelected: action.clearSelected,
      };
    case CHANGE_ADDRESS_SELECTED:
      return {
        ...state,
        addressSelected: action.addressSelected,
        clearSelected: action.clearSelected,
      };
    case UPDATE_ADDRESS_SELECTED:
      return {
        ...state,
        addressSelected: action.addressSelected || state.addressSelected,
        registerCenterState: 'newAddressConfirmCenter',
      };
    case CHOOSE_RESELECT:
      return {
        ...state,
        centerSelected: null,
        addressSelected: null,
      };
    case CHANGE_REGISTER_CENTER_STATE:
      return {
        ...state,
        registerCenterState: action.registerCenterState,
      };
    case RESET_CENTER_STATE:
      return {
        ...centerInitialState,
        registerCenterState: action.registerCenterState || centerInitialState.registerCenterState,
        myCenters: state.myCenters,
        origin: state.origin,
      };
    case REGISTER_MY_CENTER:
      return {
        ...state,
        myCenters: action.myCenters,
        registerCenterState: 'searchCenter',
        origin: action.origin,
      };
    default:
      return state;
  }
};
