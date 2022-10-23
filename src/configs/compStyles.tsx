import { Dimensions, StyleSheet } from 'react-native';
import theme, { getThemeColor, normalize } from './theme';

import { AppearanceType } from '../types/store';

const { width } = Dimensions.get('window');

export const getCompStyles = (appearance?: AppearanceType) =>
  StyleSheet.create({
    form: { flex: 1, flexDirection: 'column', justifyContent: 'flex-start' },
    scrollViewContainer: {
      flex: 1,
      flexDirection: 'column',
      backgroundColor: getThemeColor('background', appearance),
      // borderColor: 'red',
      // borderWidth: 1,
    },
    authTopSpace: { height: theme.size.big },
    focusContainer: {
      flexDirection: 'column',
      marginVertical: theme.size.small,
    },
    screenMarginHorizontal: { marginHorizontal: theme.size.big },
    detailSearchHeadline: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      // flexWrap: 'wrap',
      marginBottom: theme.size.small,
    },
    inMenuContentView: {
      flex: 1,
      flexDirection: 'column',
      marginTop: theme.size.big,
      alignItems: 'center',
      backgroundColor: getThemeColor('background', appearance),
    },
    highlighter: {
      backgroundColor: getThemeColor('focus', appearance),
    },
    flatListContentContainer: {
      paddingVertical: theme.size.normal,
    },
    flatListContainer: {
      marginBottom: theme.size.normal,
    },
    resultText: {
      color: getThemeColor('primary', appearance),
    },
    noResultText: {
      color: getThemeColor('error', appearance),
      fontSize: theme.fontSize.small,
    },
    noResultParagraph: {
      marginTop: theme.size.small,
    },
    mapContainer: {
      flex: 1,
      margin: 0,
      width,
      alignItems: 'center',
    },
    mapViewStyle: StyleSheet.absoluteFillObject,

    multiItemsInARow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginVertical: theme.size.small,
    },
    pressButtonsInARow: {
      // flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: getThemeColor('background', appearance),
    },
    summaryText: { fontSize: theme.fontSize.medium, color: getThemeColor('text', appearance) },
    normalVerticalPadding: { paddingVertical: theme.size.big },
    flex1: { flex: 1 },
    flexGrow1: { flexGrow: 1 },
    reportFormInput: { height: 100, textAlignVertical: 'top' },
    opacity01: { opacity: 0.1 },
    displayNone: { display: 'none' },
    containerMarginVertical: { marginVertical: theme.size.big },
    searchContainer: {
      width: '100%',
      backgroundColor: getThemeColor('uiBackground', appearance),
      flex: 1,
    },
    textContainer: { marginHorizontal: theme.size.normal, marginBottom: theme.size.small },
    text: { fontSize: theme.fontSize.normal, color: getThemeColor('text', appearance) },
    buttons: {
      height: 40,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      margin: theme.size.small,
      backgroundColor: getThemeColor('background', appearance),
    },
    searchTermButtons: {
      backgroundColor: getThemeColor('uiBackground', appearance),
    },
    buttonMarginRight: { marginRight: theme.size.small },
    pickerContainer: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    picker: { height: 300, width: 200, justifyContent: 'center' },
    switchContainer: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    durationPicker: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-start',
      marginBottom: 40,
      marginHorizontal: 30,
    },
    bottomSheetContainer: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingHorizontal: theme.size.normal,
      backgroundColor: getThemeColor('uiBackground', appearance),
    },
    searchTermContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      marginVertical: theme.size.small,
    },
    shareRow: {
      marginHorizontal: theme.size.normal,
      marginBottom: theme.size.normal,
      justifyContent: 'flex-start',
      alignItems: 'center',
      flexDirection: 'row',
    },
    shareRowLeftIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.size.normal,
      backgroundColor: getThemeColor('grey200', appearance),
    },
    resultParagraph: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginHorizontal: theme.size.big,
    },
    inputWithSuffix: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: theme.size.normal,
    },
    inputField: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      flex: 1,
      marginRight: theme.size.small,
    },
    suffixText: { fontSize: theme.fontSize.small },
    actionSheetTextStyle: {
      fontSize: theme.fontSize.normal,
      fontWeight: 'bold',
      color: getThemeColor('indigo700', appearance),
    },
    actionSheetContainerStyle: {
      backgroundColor: 'rgba(255, 255, 255, 0.96)',
      paddingHorizontal: theme.size.big,
      margin: theme.size.medium,
      borderRadius: normalize(10),
    },
    actionSheetSeparatorStyle: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: getThemeColor('disabled', appearance),
    },
    searchKeywordTermBlock: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
      marginHorizontal: theme.size.small,
      // alignItems: 'center',
    },
    searchKeywordTermContainer: {
      marginVertical: theme.size.small,
      // marginLeft: theme.size.big,
      paddingRight: normalize(50),
      // alignItems: 'center',
      width: 'auto',
    },
    disabledInput: { color: getThemeColor('backdrop', appearance) },
    cancelButton: { marginHorizontal: 0, paddingHorizontal: 0 },
    guideText: {
      fontSize: theme.fontSize.medium,
      fontWeight: 'normal',
      color: getThemeColor('placeholder', appearance),
    },
    guideParagraph: {
      marginTop: 0,
      marginBottom: theme.size.small,
    },
    listItem: {
      width: '100%',
      marginVertical: theme.size.small,
      // marginHorizontal: theme.size.big,
      borderColor: getThemeColor('primary', appearance),
      backgroundColor: `${getThemeColor('primary', appearance)}20`,
      borderWidth: 1,
    },
    listFont: {
      color: getThemeColor('primary', appearance),
      fontWeight: '600',
      fontSize: theme.fontSize.medium,
      marginLeft: theme.size.small,
    },
    listItemTitle: { fontWeight: '600', color: getThemeColor('text', appearance) },
    listItemDescription: { fontWeight: 'normal', color: getThemeColor('placeholder', appearance) },
    radioButtonItemm: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' },
    guideContainer: { marginHorizontal: theme.size.small, marginTop: theme.size.small },
  });

export default getCompStyles();
