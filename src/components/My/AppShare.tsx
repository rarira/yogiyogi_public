import { Platform, Share } from 'react-native';

import reportSentry from '../../functions/reportSentry';

const _handleAppShare = async () => {
  const url = 'https://www.yogiyogi.kr/app';

  const shareMessage = `
아직도 요가/필라테스 대강 선생님 구할 때 번거롭게 카톡 이용하시나요? 
대강 클래스 검색 및 알림까지 모바일앱으로 편하게! '요기요기'를 선택하세요.
${Platform.OS === 'android' ? url : ''} 
`;

  try {
    await Share.share(
      { message: shareMessage, url, title: `이제 요가/필라테스 선생님은 '요기요기'에서 찾으세요` },
      {
        dialogTitle: `이제 요가/필라테스 선생님은 '요기요기'에서 찾으세요`,
        subject: `요가/필라테스 대강 선생님 구할 땐 '요기요기'`,
      },
    );
  } catch (error) {
    reportSentry(error);
  }
};

export default _handleAppShare;
