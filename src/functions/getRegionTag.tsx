const getRegionTag = (address: string) => {
  if (address.startsWith('세종특별자치시')) {
    return '지역_세종';
  }
  if (address.startsWith('제주특별자치도 제주시')) {
    return '지역_제주 제주시';
  }
  if (address.startsWith('제주특별자치도 서귀포시')) {
    return '지역_제주 서귀포시';
  }

  const index = Math.max(address.indexOf('군 '), address.indexOf('시 '), address.indexOf('구 '));
  return `지역_${address.substr(0, index + 1)}`;
};

export default getRegionTag;
