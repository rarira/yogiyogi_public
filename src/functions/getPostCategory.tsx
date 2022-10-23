import { PostCategory } from '../API';

const getPostCategory = (category: PostCategory) => {
  switch (category) {
    case PostCategory.info:
      return '정보';
    case PostCategory.pr:
      return '홍보';
    case PostCategory.misc:
      return '수다';
    case PostCategory.notice:
      return '공지';
    default:
      return '게시물 카테고리 선택';
  }
};

export default getPostCategory;
