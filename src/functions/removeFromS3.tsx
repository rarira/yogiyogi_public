import Storage from '@aws-amplify/storage';

const removeFromS3 = async (key: string, level: string) => {
  try {
    const result = await Storage.remove(key, {
      level,
    });

    return result;
  } catch (err) {
    console.log(err);
  }
};

export default removeFromS3;
