import Axios from 'axios';

const disconnectKakaoUser = async (accessToken: string) => {
  try {
    const axiosResult = await Axios({
      method: 'post',
      url: 'https://kapi.kakao.com/v1/user/unlink',
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
    });
    // console.log(axiosResult);
  } catch (e) {
    throw e;
  }
};

export default disconnectKakaoUser;
