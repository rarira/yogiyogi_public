import { AddClassHelpCard } from '../../components/addClassHelp/HelpCarousel';
import card1img from '../img/addClassHelperCard/card1.png';
import card2img from '../img/addClassHelperCard/card2.png';
import card3img from '../img/addClassHelperCard/card3.png';
import card1DarkImg from '../img/addClassHelperCard/card1dark.png';
import card2DarkImg from '../img/addClassHelperCard/card2dark.png';
import card3DarkImg from '../img/addClassHelperCard/card3dark.png';
// import getRandomBG from '../../functions/getRandomBG';
import { AppearanceType } from '../../types/store';

const getCardData: (appearance: AppearanceType) => AddClassHelpCard[] = appearance => {
  return [
    {
      title: '클래스 날짜 입력에 주의하세요',
      desc1: `기간을 정하지 않고 오래 일하실 선생님을 구하시면, "장기(종료일 미정)" 을 선택하시고 첫 수업일을 시작일로 선택하세요`,
      desc2: `하루짜리 클래스의 선생님을 구하시면, "단기" 를 선택하시고 달력에서 같은 날짜를 두번 터치하시면 됩니다`,
      img: appearance === AppearanceType.LIGHT ? card1img : card1DarkImg,
    },
    {
      title: '클래스 타임 수와 요일은?',
      desc1: `장기(종료일 미정) 클래스의 경우 "1주당" 총 클래스의 수를 의미합니다. 클래스 요일 역시 1주를 기준으로 하니 유의해 주세요`,
      desc2:
        '하루짜리 클래스의 경우 하루에 맡게 될 총 클래스의 수를, 단기 클래스의 경우 정해진 기간 내의 총 클래스의 수를 의미합니다',
      img: appearance === AppearanceType.LIGHT ? card2img : card2DarkImg,
    },
    {
      title: '클래스 시간은 가장 첫 수업일의 시간!',
      desc1: `클래스 시간은 "최초 수업일" 의 연결된 "첫 수업 시작" 부터 "마지막 수업 종료" 시간까지로 작성하세요.`,
      desc2: `예1) 저녁 7시, 8시, 9시 시작 50분 타임 연강인 경우 : "오후7:00~오후9:50"`,
      desc3: `예2) 오전&오후 전임 "한 명" 을 구하는 경우 : "오전9:00~오후10:00"`,
      desc4: `클래스 시작 시간이 곧 "구인 마감" 시간이 됩니다`,
      desc5: '구체적인 타임 별 시간은 이후 추가 정보 란에 상세하게 기입해 주세요',
      img: appearance === AppearanceType.LIGHT ? card3img : card3DarkImg,
    },
  ];
};

export default getCardData;
