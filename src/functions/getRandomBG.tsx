import BGArray from '../static/img/classBG';

const getRandomBG = () => {
  const randomBG = BGArray[Math.floor(Math.random() * BGArray.length)];
  return randomBG;
};

export default getRandomBG;
