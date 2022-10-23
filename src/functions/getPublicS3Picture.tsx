import Storage from '@aws-amplify/storage';

const getPublicS3Picture = async (key: string) => {
  try {
    const url = await Storage.get(key, {
      level: 'public',
    });

    return url;
  } catch (e) {
    throw e;
  }
};

export default getPublicS3Picture;
