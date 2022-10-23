import { PostCategory } from '../API';
import { getThemeColor } from '../configs/theme';
import { AppearanceType } from '../types/store';

const getPostCategoryColor = (category: PostCategory, appearance: AppearanceType) => {
  switch (category) {
    case PostCategory.info:
      return getThemeColor('primary', appearance);
    case PostCategory.pr:
      return getThemeColor('iosBlue', appearance);
    case PostCategory.misc:
      return getThemeColor('focus', appearance);
    case PostCategory.notice:
      return getThemeColor('accent', appearance);
    default:
      return getThemeColor('backdrop', appearance);
  }
};

export default getPostCategoryColor;
