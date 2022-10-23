import { ClassStatusType } from '../API';
import { getThemeColor } from '../configs/theme';
import { AppearanceType } from '../types/store';

const getClassStatus = (status: ClassStatusType, appearance: AppearanceType) => {
  switch (status) {
    case ClassStatusType.open:
      return { text: '구인 중', color: getThemeColor('primary', appearance) };
    case ClassStatusType.reserved:
      return { text: '선생님 예약됨', color: getThemeColor('focus', appearance) };
    case ClassStatusType.closed:
      return { text: '구인 기간 만료', color: getThemeColor('accent', appearance) };
    case ClassStatusType.cancelled:
      return { text: '호스트에 의해 취소됨', color: getThemeColor('error', appearance) };
    case ClassStatusType.completed:
      return { text: '클래스 수행 완료', color: getThemeColor('text', appearance) };
    case ClassStatusType.proxied:
      return { text: '선생님 리뷰 작성 완료', color: getThemeColor('text', appearance) };
    case ClassStatusType.reviewed:
      return { text: '호스트 리뷰 작성 완료', color: getThemeColor('text', appearance) };
    case ClassStatusType.hostDisabled:
      return { text: '호스트 계정 탈퇴', color: getThemeColor('disabled', appearance) };
  }
};

export default getClassStatus;
