import addDays from 'date-fns/add_days';
import compact from 'lodash/compact';
import differenceInCalendarDays from 'date-fns/difference_in_calendar_days';
import format from 'date-fns/format';
import getDay from 'date-fns/get_day';
import parse from 'date-fns/parse';

export interface WeekdayArrayObject {
  local: string;
  value: string;
  date: string[];
  isStart: boolean;
  isEnd: boolean;
}

export const initialWeekdayArray: Array<WeekdayArrayObject> = [
  { local: '일', value: 'sun', date: [], isStart: false, isEnd: false },
  { local: '월', value: 'mon', date: [], isStart: false, isEnd: false },
  { local: '화', value: 'tue', date: [], isStart: false, isEnd: false },
  { local: '수', value: 'wed', date: [], isStart: false, isEnd: false },
  { local: '목', value: 'thu', date: [], isStart: false, isEnd: false },
  { local: '금', value: 'fri', date: [], isStart: false, isEnd: false },
  { local: '토', value: 'sat', date: [], isStart: false, isEnd: false },
];

export const getLocalizedWeekDayString = (dayOfWeek: string) => {
  const tempArray: Array<string | null> = JSON.parse(dayOfWeek);
  const newArray = compact(tempArray);
  return newArray.map((day: string) => {
    return initialWeekdayArray.find(item => item.value === day)!.local;
  });
};

const getWeekdayArray = (dateStart: string, dateEnd: string) => {
  const dateStartParsed = parse(dateStart);
  const dateEndParsed = parse(dateEnd);
  const difference = differenceInCalendarDays(dateEndParsed, dateStartParsed);

  const weekdayArrayUse = initialWeekdayArray.map(obj => {
    const newObj = Object.assign({}, obj);
    newObj.date = [];
    return newObj;
  });

  if (!dateEnd) {
    const weekdayOfDateStart = getDay(dateStartParsed) % 7;
    weekdayArrayUse[weekdayOfDateStart].date.push(format(dateStartParsed, 'YYYY-MM-DD'));
    weekdayArrayUse[weekdayOfDateStart].isStart = true;
  }

  for (let i = 0; i <= difference; i++) {
    const day = addDays(dateStartParsed, i);
    const weekday = getDay(day) % 7;
    weekdayArrayUse[weekday].date.push(format(day, 'YYYY-MM-DD'));
    if (i === 0) {
      weekdayArrayUse[weekday].isStart = true;
    }
    if (i === difference) {
      weekdayArrayUse[weekday].isEnd = true;
    }
  }

  return weekdayArrayUse;
};

export default getWeekdayArray;
