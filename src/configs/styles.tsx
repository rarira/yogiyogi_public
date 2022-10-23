import { ColorSchemeName, StyleSheet } from 'react-native';
import theme, { getThemeColor } from './theme';

import { AppearanceType } from '../types/store';

// import getDimensions from '../functions/getDimensions';

// const { SCREEN_WIDTH } = getDimensions();
export const getStyles = (appearance?: AppearanceType | ColorSchemeName) =>
  StyleSheet.create({
    switchScreenContainerView: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-start',
      backgroundColor: getThemeColor('background', appearance),
    },

    contentContainerView: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-start',
      backgroundColor: getThemeColor('background', appearance),
    },
    welcomeContainer: { flex: 1, backgroundColor: getThemeColor('primary', appearance) },
    welcomeSafeAreaView: { justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
    modalContentContainerView: {
      borderTopLeftRadius: theme.size.medium,
      borderTopRightRadius: theme.size.medium,
    },
    categoryContainer: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      marginVertical: theme.size.medium,
      marginHorizontal: theme.size.big,
    },
    columnCenterView: {
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginVertical: theme.size.small,
      marginHorizontal: theme.size.big,
    },
    screenMarginHorizontal: { marginHorizontal: theme.size.big },
    screenPaddingHorizontal: { paddingHorizontal: theme.size.big },
    flex1: { flex: 1 },
    flexGrow1: { flexGrow: 1 },
    opacity01: { opacity: 0.1 },
    parallaxHeaderOpacity: {
      position: 'absolute',
      top: 0,
      backgroundColor: 'rgba(0,0,0,.3)',
    },
    backgroundColor: { backgroundColor: getThemeColor('background', appearance) },
    darkBackgroundColor: { backgroundColor: getThemeColor('grey200', appearance) },
    containerBorder: {
      borderBottomColor: getThemeColor('borderColor', appearance),
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    uiBackground: { backgroundColor: getThemeColor('uiBackground', appearance) },
    containerMarginVertical: { marginVertical: theme.size.normal },
    containerMarginTop: { marginTop: theme.size.normal },
    containerPaddingTop: { paddingTop: theme.size.normal },
    containerPaddingBottom: { paddingBottom: theme.size.normal },
    containerBottomRadius: {
      borderBottomLeftRadius: theme.size.medium,
      borderBottomRightRadius: theme.size.medium,
    },
    searchBar: { flexDirection: 'row', alignItems: 'center', marginVertical: theme.size.small },
    paddingMediumVertical: { paddingVertical: theme.size.medium },
    paddingBottomVertical: { paddingTop: theme.size.small, paddingBottom: theme.size.xl },
    classViewContentContainer: {
      flexDirection: 'column',
      backgroundColor: getThemeColor('uiBackground', appearance),
    },
    overflowHidden: { overflow: 'hidden', flex: 1 },
    tabBarStyle: {
      backgroundColor: getThemeColor('background', appearance),
      marginHorizontal: theme.size.normal,
      elevation: 0,
      shadowOpacity: 0,
      borderColor: getThemeColor('disabled', appearance),
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    tabBarIndicatorStyle: { backgroundColor: getThemeColor('primary', appearance) },
    listIcon: { margin: 0, alignSelf: 'center', padding: 0 },
    listItem: {
      width: '100%',
      paddingHorizontal: theme.size.medium,
      // marginVertical: theme.size.xs,
    },
    categoryListItem: {
      width: '100%',
      padding: 0,
    },
    fontSmall: { fontSize: theme.fontSize.small, color: getThemeColor('placeholder', appearance) },
    fontMedium: { fontSize: theme.fontSize.medium, color: getThemeColor('text', appearance) },
    fontDisabled: { color: getThemeColor('backdrop', appearance) },
    weightedFont: { fontWeight: '600', marginHorizontal: theme.size.small },
    spaceBetweenView: { justifyContent: 'space-between' },
    fullWidth: { width: '100%' },
    smallVerticalMargin: { marginVertical: theme.size.small },
    listItemTitle: { fontWeight: '600', color: getThemeColor('text', appearance) },
    listItemDescription: { fontWeight: 'normal', color: getThemeColor('placeholder', appearance) },
    accentListItemTitle: {
      fontWeight: '600',
      color: getThemeColor('accent', appearance),
      fontSize: theme.fontSize.medium,
    },
    listRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: theme.size.normal },
    dialogContentWarningText: { fontWeight: 'bold', color: getThemeColor('error', appearance) },
    justifyContentFlexStart: { flex: 1, justifyContent: 'flex-start' },
    uiWindow: { flex: 1, backgroundColor: getThemeColor('uiBackground', appearance) },
    classCarouselContainer: { flex: 1, marginVertical: theme.size.normal },
    contentsColumnCenterContainer: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    columnCenterContainer: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },

    backgroundVideo: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      opacity: 0.3,
    },
    guideText: { fontSize: theme.fontSize.medium, color: getThemeColor('placeholder', appearance) },
    focusText: {
      fontSize: theme.fontSize.medium,
      color: getThemeColor('primary', appearance),
      fontWeight: '600',
    },
    guideParagraph: { flex: 1, marginRight: theme.size.small },
    rowWithSort: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      // flexWrap: 'wrap',
      marginBottom: theme.size.small,
    },
    postFlatListContainer: {
      paddingTop: theme.size.normal,
      paddingBottom: theme.size.big,
    },
    safeAreaViewContainger: { backgroundColor: getThemeColor('background', appearance) },
  });

export default getStyles();
