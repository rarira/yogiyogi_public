const getEmptyReviewsResultType = (type: string) => {
  switch (type) {
    case 'allComments':
      return '리뷰 코멘트가';
    case 'hostComments':
      return '호스트 리뷰 코멘트가';
    case 'proxyComments':
      return '선생님 리뷰 코멘트가';
    case 'mannersComments':
      return '사용자 리뷰 코멘트가';
    default:
      return `${type}인 클래스가`;
  }
};

export default getEmptyReviewsResultType;
