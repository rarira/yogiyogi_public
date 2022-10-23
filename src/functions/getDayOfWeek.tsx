import getDay from 'date-fns/get_day';
import { initialWeekdayArray } from './getWeekdayArray';

export const getDayOfWeek = (date: Date) => {
  const num = getDay(date);
  let tempArray = Array(7).fill(undefined);
  tempArray[num] = initialWeekdayArray[num].value;
  return tempArray;
};
