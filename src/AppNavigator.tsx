import { CardStyleInterpolators, NavigationStackScreenProps, createStackNavigator } from 'react-navigation-stack';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';

import AddClassHelpScreen from './screens/AddClassHelpScreen';
import AddClassScreen from './screens/AddClassScreen';
import AddPostScreen from './screens/AddPostScreen';
import AllChatListScreen from './screens/AllChatListScreen';
import AuthScreen from './screens/AuthScreen';

import BookmarkListScreen from './screens/BookmarkListScreen';
import ChatListScreen from './screens/ChatListScreen';
import ChatTabIcon from './components/chat/ChatTabIcon';
import ChatViewScreen from './screens/ChatViewScreen';
import ClassChatListScreen from './screens/ClassChatListScreen';
import ClassCompleteScreen from './screens/ClassCompleteScreen';
import ClassListScreen from './screens/ClassListScreen';
import ClassViewScreen from './screens/ClassViewScreen';
import CommScreen from './screens/CommScreen';
import CommentViewScreen from './screens/CommentViewScreen';
import CustomTabBar from './components/CustomTabBar';
import DisableUserScreen from './screens/DisableUserScreen';
import HeartScreen from './screens/HeartScreen';
import HomeScreen from './screens/HomeScreen';
import HostReviewScreen from './screens/HostReviewScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MannersListScreen from './screens/MannersListScreen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MyBlockedListScreen from './screens/MyBlockedListScreen';
import MyCenterScreen from './screens/MyCenterScreen';
import MyPostListScreen from './screens/MyPostListScreen';
import MyScreen from './screens/MyScreen';
import MySettingsScreen from './screens/MySettingsScreen';
import MyStackIcon from './components/My/MyStackIcon';
import MySubsScreen from './screens/MySubsScreen';
import NotiScreen from './screens/NotiScreen';
import PostCommentViewScreen from './screens/PostCommentViewScreen';
import PostViewScreen from './screens/PostViewScreen';
import ProxyReviewScreen from './screens/ProxyReviewScreen';
import React from 'react';
import RegisterCenterScreen from './screens/RegisterCenterScreen';
import ReviewsListScreen from './screens/ReviewsListScreen';
import SearchScreen from './screens/SearchScreen';
import SplashScreen from './screens/SplashScreen';

import UpdateProfileScreen from './screens/UpdateProfileScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import UserReviewScreen from './screens/UserReviewScreen';
import ViewReviewScreen from './screens/ViewReviewScreen';
import WebViewScreen from './screens/WebViewScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import { createBottomTabNavigator } from 'react-navigation-tabs';

// import WelcomeScreen from './screens/WelcomeScreen';

const HomeStack = createStackNavigator(
  {
    Home: {
      screen: HomeScreen,
      navigationOptions: () => ({
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }),
    },
  },
  {
    initialRouteName: 'Home',
    // mode: 'modal',
    // resetOnBlur: false,,
    headerMode: 'none',
    keyboardHandlingEnabled: false,
  },
);

const MyStack = createStackNavigator(
  {
    MyScreen: {
      screen: MyScreen,
      navigationOptions: () => ({
        gestureEnabled: false,
        gestureDirection: 'horizontal',
      }),
    },
  },
  {
    initialRouteName: 'MyScreen',
    // mode: 'modal',
    // resetOnBlur: false,,
    headerMode: 'none',
    keyboardHandlingEnabled: false,
  },
);

const SearchStack = createStackNavigator(
  {
    Search: {
      screen: SearchScreen,
      navigationOptions: () => ({
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }),
    },
  },
  {
    initialRouteName: 'Search',
    // mode: 'modal',
    // resetOnBlur: false,,
    headerMode: 'none',
    keyboardHandlingEnabled: false,
  },
);

const CommStack = createStackNavigator(
  {
    Comm: {
      screen: CommScreen,
      navigationOptions: () => ({
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }),
    },
  },
  {
    initialRouteName: 'Comm',
    headerMode: 'none',
    keyboardHandlingEnabled: false,
  },
);

const ChatStack = createStackNavigator(
  {
    ChatList: {
      screen: ChatListScreen,
      navigationOptions: () => ({
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }),
    },
  },
  {
    initialRouteName: 'ChatList',
    headerMode: 'none',
    keyboardHandlingEnabled: false,
  },
);

const ClassCompleteStack = createStackNavigator(
  {
    ClassComplete: {
      screen: ClassCompleteScreen,
      navigationOptions: () => ({
        gestureEnabled: false,
        gestureDirection: 'horizontal',
      }),
    },
    AllChatList: {
      screen: AllChatListScreen,
      navigationOptions: () => ({
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }),
    },
  },
  {
    initialRouteName: 'ClassComplete',
    headerMode: 'none',
    keyboardHandlingEnabled: false,
  },
);

HomeStack.navigationOptions = () => ({
  tabBarIcon: ({ focused, tintColor }: { focused: boolean; tintColor: string }) => {
    return <MaterialCommunityIcons name="home-outline" color={tintColor} size={focused ? 32 : 25} />;
  },
  tabBarLabel: '홈',
  // tabBarColor: '#2196f3',
});

MyStack.navigationOptions = ({ navigation }: NavigationStackScreenProps) => ({
  tabBarIcon: ({ focused, tintColor }: { focused: boolean; tintColor: string }) => {
    return <MyStackIcon focused={focused} tintColor={tintColor} />;
  },
  tabBarVisible: navigation.state.index < 2,
  tabBarLabel: '마이',
  // gestureEnabled: false,
  gestureDirection: 'horizontal',
});

SearchStack.navigationOptions = ({ navigation }: NavigationStackScreenProps) => ({
  tabBarIcon: ({ focused, tintColor }: { focused: boolean; tintColor: string }) => {
    return <Ionicons name="md-search" color={tintColor} size={focused ? 32 : 25} />;
  },
  tabBarVisible: navigation.state.index === 0,
  tabBarLabel: '클래스',

  // tabBarVisible: false,,
});
ChatStack.navigationOptions = () => ({
  tabBarIcon: ({ focused, tintColor }: { focused: boolean; tintColor: string }) => {
    return <ChatTabIcon focused={focused} tintColor={tintColor} />;
  },
  tabBarLabel: '채팅',

  // tabBarVisible: false,,
});
CommStack.navigationOptions = () => ({
  tabBarIcon: ({ focused, tintColor }: { focused: boolean; tintColor: string }) => {
    return <MaterialCommunityIcons name="coffee-outline" color={tintColor} size={focused ? 32 : 25} />;
  },
  tabBarLabel: '게시판',

  // tabBarVisible: false,,
});

const TabNavigator = createBottomTabNavigator(
  {
    Home: { screen: HomeStack, path: 'home' },

    // Heart: { screen: HeartScreen },
    // New: {
    //   screen: NewScreen,
    // },

    //
    CommStack: { screen: CommStack },
    // SearchStack: SearchStack,
    // ChatStack: { screen: ChatStack },

    My: { screen: MyStack, path: 'my' },
    Null: {
      screen: () => null,
      navigationOptions: {
        tabBarLabel: ' ',
        // tabBarIcon: () => <></>,
        tabBarOnPress: () => {
          return null;
        },
      },
    },
  },
  {
    initialRouteName: 'Home',

    tabBarComponent: props => <CustomTabBar {...props} />,
  },
);

const UserProfileNavigator = createStackNavigator(
  {
    UserProfile: {
      screen: UserProfileScreen,
      navigationOptions: () => ({
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }),
    },
    MannersList: {
      screen: MannersListScreen,
      navigationOptions: () => ({
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }),
    },
    ReviewsList: {
      screen: ReviewsListScreen,
      navigationOptions: () => ({
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }),
    },
    UserReview: {
      screen: UserReviewScreen,
      navigationOptions: () => ({
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }),
    },
  },
  {
    initialRouteName: 'UserProfile',
    // initialRouteName: 'ClassView',
    // mode: 'modal',
    // resetOnBlur: false,,
    headerMode: 'none',
    keyboardHandlingEnabled: false,
  },
);

const MainNavigator = createStackNavigator(
  {
    Tab: {
      screen: TabNavigator,
      path: 'tab',
      navigationOptions: () => ({
        gestureEnabled: false,
        gestureDirection: 'horizontal',
      }),
    },
    DisableUser: {
      screen: DisableUserScreen,
      navigationOptions: () => ({
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }),
    },
    MyCenter: {
      screen: MyCenterScreen,
      // navigationOptions: () => ({
      //   gestureEnabled: false,
      // gestureDirection: 'horizontal',
      // }),
      navigationOptions: () => ({
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }),
    },
    MySettings: {
      screen: MySettingsScreen,
      navigationOptions: () => ({
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }),
    },
    PostView: {
      screen: PostViewScreen,
      path: 'post/:postId&:origin',
      navigationOptions: () => ({
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }),
    },

    PostCommentView: {
      screen: PostCommentViewScreen,
      navigationOptions: () => ({
        gestureEnabled: false,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }),
    },
    CommentView: {
      screen: CommentViewScreen,
      navigationOptions: () => ({
        gestureEnabled: false,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }),
    },
    ClassView: {
      screen: ClassViewScreen,
      path: 'class/:classId&:hostId&:origin',
      navigationOptions: () => ({
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }),
    },
    ClassChatList: {
      screen: ClassChatListScreen,
      navigationOptions: () => ({
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }),
    },

    ChatView: {
      screen: ChatViewScreen,
      path: 'chat/:convId&:classId&:hostId&:origin',
      navigationOptions: () => ({
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }),
    },

    ViewReview: {
      screen: ViewReviewScreen,
      navigationOptions: () => ({
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }),
    },
    ClassList: {
      screen: ClassListScreen,
      path: 'classList/:type&:navIndex&:origin',
      navigationOptions: () => ({
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }),
    },
    Heart: {
      screen: HeartScreen,
      navigationOptions: () => ({
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }),
    },
    BookmarkList: {
      screen: BookmarkListScreen,
      navigationOptions: () => ({
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }),
    },
    MyBlockedList: {
      screen: MyBlockedListScreen,
      navigationOptions: () => ({
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }),
    },
    MyPostList: {
      screen: MyPostListScreen,
      navigationOptions: () => ({
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }),
    },
    Noti: {
      screen: NotiScreen,
      path: 'noti/:tabNo&:origin',
      navigationOptions: () => ({
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }),
    },
  },
  {
    initialRouteName: 'Tab',
    // initialRouteName: 'ClassView',
    // mode: 'modal',
    // resetOnBlur: false,,
    headerMode: 'none',
    keyboardHandlingEnabled: false,
  },
);

const InitNavigator = createSwitchNavigator(
  {
    // Background: {
    //   screen: BackgroundScreen,
    //   navigationOptions: () => ({
    //     gestureEnabled: false
    // gestureDirection: 'horizontal',
    //   }),
    // },
    Welcome: {
      screen: WelcomeScreen,
      navigationOptions: () => ({
        gestureEnabled: false,
        gestureDirection: 'horizontal',
      }),
    },
    Main: {
      screen: MainNavigator,
      path: 'm',
      navigationOptions: () => ({
        gestureEnabled: false,
        gestureDirection: 'horizontal',
      }),
    },
  },
  {
    initialRouteName: 'Welcome',
    // headerMode: 'none',
  },
);

const AddClassStack = createStackNavigator(
  {
    AddClass: {
      screen: AddClassScreen,
      // path: 'addClass',
      navigationOptions: () => ({
        gestureEnabled: false,
        gestureDirection: 'horizontal',
      }),
    },
    AddClassHelp: {
      screen: AddClassHelpScreen,
      // path: 'addClass',
      navigationOptions: () => ({
        gestureEnabled: false,
        gestureDirection: 'horizontal',
      }),
    },
  },
  {
    initialRouteName: 'AddClass',
    mode: 'modal',
    headerMode: 'none',
    keyboardHandlingEnabled: false,
  },
);

const AddPostStack = createStackNavigator(
  {
    AddPost: {
      screen: AddPostScreen,

      navigationOptions: () => ({
        gestureEnabled: false,
        gestureDirection: 'horizontal',
      }),
    },
    // AddPostHelp: {
    //   screen: AddPostHelpScreen,
    //   // path: 'addClass',
    //   navigationOptions: () => ({
    //     gestureEnabled: false,
    // gestureDirection: 'horizontal',
    //   }),
    // },
  },
  {
    initialRouteName: 'AddPost',
    mode: 'modal',
    headerMode: 'none',
    keyboardHandlingEnabled: false,
  },
);

const AppNavigator = createStackNavigator(
  {
    Splash: {
      screen: SplashScreen,
      navigationOptions: () => ({
        gestureEnabled: false,
        gestureDirection: 'horizontal',
      }),
    },

    InitStack: {
      screen: InitNavigator,
      path: 'i',
      navigationOptions: () => ({
        gestureEnabled: false,
        gestureDirection: 'horizontal',
      }),
    },
    WebView: {
      screen: WebViewScreen,
      navigationOptions: () => ({
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }),
    },
    UserProfileStack: {
      screen: UserProfileNavigator,

      navigationOptions: () => ({
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }),
    },
    Auth: {
      screen: AuthScreen,
      navigationOptions: () => ({
        gestureEnabled: false,
        gestureDirection: 'horizontal',
      }),
    },
    AddClassStack: {
      screen: AddClassStack,

      navigationOptions: () => ({
        gestureEnabled: false,
        gestureDirection: 'horizontal',
      }),
    },
    AddPostStack: {
      screen: AddPostStack,

      navigationOptions: () => ({
        gestureEnabled: false,
        gestureDirection: 'horizontal',
      }),
    },

    RegisterCenter: {
      screen: RegisterCenterScreen,
      navigationOptions: () => ({
        gestureEnabled: false,
        gestureDirection: 'horizontal',
      }),
    },
    ClassCompleteStack: {
      screen: ClassCompleteStack,
      navigationOptions: () => ({
        gestureEnabled: false,
        gestureDirection: 'horizontal',
      }),
    },
    ProxyReview: {
      screen: ProxyReviewScreen,
      navigationOptions: () => ({
        gestureEnabled: false,
        gestureDirection: 'horizontal',
      }),
    },
    HostReview: {
      screen: HostReviewScreen,
      navigationOptions: () => ({
        gestureEnabled: false,
        gestureDirection: 'horizontal',
      }),
    },
    MySubs: {
      screen: MySubsScreen,
      navigationOptions: () => ({
        gestureEnabled: false,
        gestureDirection: 'horizontal',
      }),
    },
    UpdateProfile: {
      screen: UpdateProfileScreen,
      navigationOptions: () => ({
        gestureEnabled: false,
        gestureDirection: 'horizontal',
      }),
    },
  },
  {
    initialRouteName: 'Splash',
    mode: 'modal',
    headerMode: 'none',
    keyboardHandlingEnabled: false,
  },
);

export default createAppContainer(AppNavigator);
