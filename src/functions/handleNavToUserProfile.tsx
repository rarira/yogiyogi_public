import { NavigationScreenProp } from 'react-navigation';

const handleNavToUserProfile = (
  navigation: NavigationScreenProp<any, any>,
  origin: string,
  userId: string,
  userIdentityId?: string | null,
  userName?: string | null,
  type?: string,
) => () => {
  if (origin === 'ReviewsList') {
    navigation.push('UserProfile', { origin, userId, userName, userIdentityId, chatType: type });
  } else {
    navigation.navigate('UserProfile', { origin, userId, userName, userIdentityId, chatType: type });
  }
};

export default handleNavToUserProfile;
