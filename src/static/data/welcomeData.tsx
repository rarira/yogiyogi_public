import { AddClassHelpCard } from '../../components/addClassHelp/HelpCarousel';
import img1 from '../img/welcomeCard/Yoga.png';
import img2 from '../img/welcomeCard/alarm.png';
import img3 from '../img/welcomeCard/adress-bar.png';
import img4 from '../img/welcomeCard/bad-review.png';
import img5 from '../img/welcomeCard/promise.png';

const welcomeData: AddClassHelpCard[] = [
  {
    title: '나마스테! 요기요기에요',
    desc1: `요기요기는 요가,필라테스 전문 구인,구직 앱입니다`,
    desc2: '원타임 대강, 단기 대강, 정규 강사 부터 PT 선생님까지',
    img: img1,
  },
  {
    title: '오픈채팅방의 깨톡 알림, 이젠 그만!',
    desc1: `요기요기는 자신이 관심있는 지역, 종목을 구독해 두면 해당 클래스 등록시 선택적으로 알림 수신이 가능합니다`,
    img: img2,
  },
  {
    title: '클래스 검색도 간편하게 ♥',
    desc1: `구독 중이지 않은 클래스도 다양한 방법으로 검색할 수 있습니다`,
    desc2: '많이 검색되기 위한 클래스 등록도 어렵지 않아요',
    img: img3,
  },
  {
    title: '매너 없는 선생님, 호스트는 싫어요!!',
    desc1: '클래스가 완료되면 선생님, 호스트에 대한 리뷰를 남길 수 있고 평가는 누적됩니다',
    desc2: '이상한 사람들은 요기요기에 발붙일 수 없어요',
    img: img4,
  },
  {
    title: '요기요기 이제 시작할까요?',
    desc1: '이렇게 좋은 요기요기 여러 사람이 함께 하면 얼마나 좋게요~ ',
    desc2: '주변에 추천하기 약속!',
    img: img5,
  },
];

export default welcomeData;
