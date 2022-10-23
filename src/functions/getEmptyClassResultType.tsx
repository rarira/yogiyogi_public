const getEmptyClassResultType = (tabLabel?: string) => {
  switch (tabLabel) {
    case undefined:
      return '조건에 맞는 클래스가';
    case '완료됨':
      return '완료된 클래스가';
    case '취소됨':
      return '취소된 클래스가';
    case '호스트 리뷰 완료':
      return '호스트 리뷰를 완료한 클래스가';

    default:
      return `${tabLabel}인 클래스가`;
  }
};

export default getEmptyClassResultType;
