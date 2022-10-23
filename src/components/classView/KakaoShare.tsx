import { APP_PREFIX, KAKAO_SHARE_IMG_URL, UNIV_LINK_PREFIX } from '../../configs/variables';
import { AppearanceType, PostData, PostNumbers } from '../../types/store';
import { getDateDurationString, getTimeString } from '../../functions/getScheduleString';

import { ActionSheetOptions } from '@expo/react-native-action-sheet';
import { GetClassQuery } from '../../API';
import { NativeModules } from 'react-native';
import { Share } from 'react-native';
import { getLocalizedWeekDayString } from '../../functions/getWeekdayArray';
import getPostCategory from '../../functions/getPostCategory';
import getTagString from '../../functions/getTagString';
import openClassShareActionSheet from '../../functions/openClassShareActionSheet';
import reportSentry from '../../functions/reportSentry';

const numeral = require('numeral');
const RariraKakaoLink = NativeModules.RariraKakaoLink;

export const handleClassShare = (
  classItem: Partial<GetClassQuery['getClass']>,
  showActionSheetWithOptions: (options: ActionSheetOptions, callback: (i: number) => void) => void,
  appearance: AppearanceType,
) => () => {
  const {
    id,
    dateStart,
    dateEnd,
    title,
    timeStart,
    timeEnd,
    host,
    center,
    regionSearchable,
    tagSearchable,
    numOfClass,
    classFee,
    dayOfWeek,
    extraInfo,
  } = classItem!;

  const urlPrefix = `${UNIV_LINK_PREFIX}i/m/`;
  const url1 = `${urlPrefix}class/${id}&${host!.id}&notification`;
  const url2 = `${APP_PREFIX}i/m/class/${id}&${host!.id}&notification`;
  const appLink = `link=/i/m/class/${id}&${host!.id}&notification`;

  const shareMessage = `
요가/필라테스 전문 구인 앱 "요기요기"에서 선생님을 찾습니다!

제목: ${title}
키워드: ${getTagString(tagSearchable)}
지역: ${getTagString(regionSearchable)} 
날짜: ${getDateDurationString(dateStart, dateEnd)}
시간: ${getTimeString(timeStart!)} ~ ${getTimeString(timeEnd!)} (복수 클래스일 경우 첫 클래스 시간)
기타: ${getLocalizedWeekDayString(dayOfWeek!).toString()}/ 총 ${numOfClass} 타임 / 타임당 ${numeral(classFee).format(
    0,
    0,
  )}원 

자세한 내용 및 문의는 앱스토어에서 '요기요기' 설치하신 후 아래 링크 터치
${url2}
`;

  const simpleShare = async () => {
    try {
      await Share.share(
        { message: shareMessage, url: url1, title: `요기요기에서 선생님을 찾습니다: ${title}` },
        {
          dialogTitle: `요기요기 구인 클래스 공유`,
          subject: `요기요기에서 선생님을 찾습니다: ${title}`,
        },
      );
      // console.log(result);
      // if (result.action) {
      //   // handleClose();
      // }
    } catch (error) {
      reportSentry(error);
    }
  };

  // console.log(url1);
  // console.log(url2);

  const kakaoLinkShare = () => {
    const kakaoDesc = `${getDateDurationString(dateStart, dateEnd)} / ${getTimeString(timeStart!)} ~ ${getTimeString(
      timeEnd!,
    )} @ ${getTagString(regionSearchable)}, 키워드 정보: ${getTagString(tagSearchable)}`;
    const kakaoCenterName = host!.id !== 'admin' ? center!.name : extraInfo?.centerName;
    const kakaoCenterAddress = host!.id !== 'admin' ? center!.address : extraInfo?.centerAddress;

    RariraKakaoLink.link(
      title,
      kakaoDesc,
      KAKAO_SHARE_IMG_URL,
      url2,
      appLink,
      kakaoCenterAddress,
      kakaoCenterName,
      (result: any) => console.log(result),
    );
  };

  openClassShareActionSheet({ simpleShare, kakaoLinkShare, showActionSheetWithOptions, appearance })();
};

export const handlePostShare = (
  postItem: PostData,
  showActionSheetWithOptions: (options: ActionSheetOptions, callback: (i: number) => void) => void,
  imageURL: string,
  postNumbers: PostNumbers,
  appearance: AppearanceType,
) => () => {
  const { id, postTitle, postCategory, postContent } = postItem!;
  const { numOfLikes, numOfComments } = postNumbers;

  const urlPrefix = `${UNIV_LINK_PREFIX}i/m/`;
  const url1 = `${urlPrefix}post/${id}&Comm`;
  const url2 = `${APP_PREFIX}i/m/post/${id}&Comm`;
  const appLink = `link=/i/m/post/${id}&Comm`;
  const categoryText = getPostCategory(postCategory);
  const summary = postContent.slice(0, 40);
  const shareMessage = `
요가/필라테스 전문 구인 앱 "요기요기"의 게시물을 공유합니다

제목: ${postTitle}
카테고리: ${categoryText}
내용: ${summary}...

자세한 내용 및 문의는 앱스토어에서 '요기요기' 설치하신 후 아래 링크 터치
${url2}
`;

  const simpleShare = async () => {
    try {
      await Share.share(
        { message: shareMessage, url: url1, title: `요기요기 게시물 공유: ${postTitle}` },
        {
          dialogTitle: `요기요기 게시물 공유`,
          subject: `요기요기의 좋은 게시물을 공유합니다: ${postTitle}`,
        },
      );
      // console.log(result);
      // if (result.action) {
      //   // handleClose();
      // }
    } catch (error) {
      reportSentry(error);
    }
  };

  // console.log(url1);
  // console.log(url2);

  const kakaoLinkShare = () => {
    RariraKakaoLink.feed(postTitle, summary, imageURL, url2, appLink, numOfLikes, numOfComments, (result: any) =>
      console.log(result),
    );
  };

  openClassShareActionSheet({ simpleShare, kakaoLinkShare, showActionSheetWithOptions, appearance })();
};

// export default _handleMoreShare;
