import format from 'date-fns/format';
import koLocale from 'date-fns/locale/ko';

const getYearMonthDate = (date: string | Date) => {
  return format(date, 'YYYY[년] MMM Do A hh:mm', { locale: koLocale });
};

export default getYearMonthDate;
