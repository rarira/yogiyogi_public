import Storage from '@aws-amplify/storage';

const uploadToS3 = async (pathToFile: string, key: string, level: string, mimeType: string) => {
  try {
    const response = await fetch(pathToFile);

    const blob = await response.blob();

    const result = await Storage.put(key, blob, {
      level,
      contentType: mimeType,
    });

    return result;
  } catch (err) {
    console.log(err);
  }
};

export default uploadToS3;
