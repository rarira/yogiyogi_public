import differenceInCalendarDays from 'date-fns/difference_in_calendar_days';
import differenceInMinutes from 'date-fns/difference_in_minutes';
import format from 'date-fns/format';

import koLocale from 'date-fns/locale/ko';

export const getTimeString = (time: number) => format(time * 1000, 'A hh:mm', { locale: koLocale });

export const getDateString = (date: number) => format(date * 1000, 'YYYY-MM-DD');

export const getDateDurationString = (dateStart?: number, dateEnd?: number | null) => {
  const dateEndValue = !dateEnd ? ` ~ 종료일 미정` : dateStart === dateEnd ? '(하루)' : ` ~ ${getDateString(dateEnd)}`;
  return `${getDateString(dateStart!)}${dateEndValue}`;
};

export const getDateGapString = (dateStart?: number, dateEnd?: number | null) => {
  if (!dateEnd) return '장기';
  if (dateStart === dateEnd) return '하루';
  return `${differenceInCalendarDays(dateEnd * 1000, dateStart! * 1000) + 1}일`;
};

export const getTimeGapString = (timeStart?: number, timeEnd?: number) =>
  `${differenceInMinutes(timeEnd! * 1000, timeStart! * 1000)}분`;

export const getCountdownTimer = (timeStart: number, timeNow: Date) => {
  const timeNowEpoch = timeNow.getTime() / 1000;
  const distance = timeStart - timeNowEpoch;
  if (distance <= 0) return '이미 종료된 클래스';
  if (distance < 60) return '1분 이하';

  const days = Math.floor(distance / (60 * 60 * 24));
  const hours = Math.floor((distance % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((distance % (60 * 60)) / 60);

  const daysString = days === 0 ? '' : `${days}일 `;
  const hoursString = hours === 0 ? '' : `${hours}시 `;
  const minutesString = minutes === 0 ? '' : `${minutes}분`;

  return daysString + hoursString + minutesString;
};
