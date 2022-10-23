import Storage from '@aws-amplify/storage';

const getUserProfilePicture = async (isMyself: boolean | undefined, key: string, identityId?: string) => {
  try {
    // const key = `${userId}_profilePicture.jpg`;
    const url = await Storage.get(key, {
      level: 'protected',
      ...(!isMyself && { identityId }),
    });

    return url;
  } catch (e) {
    throw e;
  }
};

export default getUserProfilePicture;
