const getThirdPartyName = (username: string): string => {
  if (username.startsWith('Kakao_')) {
    return '카카오';
  } else if (username.startsWith('Apple_')) {
    return '애플';
  }
  return '서드파티';
};

export default getThirdPartyName;
