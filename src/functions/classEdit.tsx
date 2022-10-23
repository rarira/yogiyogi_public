import { NavigationParams, NavigationRoute, NavigationScreenProp } from 'react-navigation';
import { PREPARE_REPOST_CLASS, PREPARE_UPDATE_CLASS } from '../stores/actionTypes';

import { ClassData } from '../types/apiResults';
import { Dispatch } from 'react';
import { GetClassQuery } from '../API';
import { ExpireType, StoreAction } from '../types/store';
import format from 'date-fns/format';

const classEdit = (
  classItem: Partial<GetClassQuery['getClass']> | ClassData,
  navigation: NavigationScreenProp<NavigationRoute<NavigationParams>, NavigationParams>,
  origin: string,
  storeDispatch: Dispatch<StoreAction>,
  repostMode: boolean,
) => async () => {
  let {
    id: classId,
    title,
    dateStart,
    dateEnd,
    timeStart,
    timeEnd,
    numOfClass,
    dayOfWeek,
    center,
    tagSearchable,
    regionSearchable,
    classFee,
    memo,
    classStatus,
    createdAt,
    isLongTerm,
    expiresAt,
    expireType,
  } = classItem!;

  const tags = tagSearchable ? tagSearchable.split(',') : [];

  const timeProps = repostMode
    ? {}
    : {
        dateStart: format(dateStart! * 1000, 'YYYY-MM-DD'),
        dateEnd: dateEnd ? format(dateEnd * 1000, 'YYYY-MM-DD') : undefined,
        timeStart: new Date(timeStart! * 1000).toISOString(),
        timeEnd: new Date(timeEnd! * 1000).toISOString(),
        dayOfWeek: JSON.parse(dayOfWeek!),
      };

  storeDispatch({
    type: repostMode ? PREPARE_REPOST_CLASS : PREPARE_UPDATE_CLASS,
    id: classId,
    title,
    numOfClass,
    center,
    tags,
    originalTags: tags.concat([regionSearchable!]),
    classFee,
    memo,
    classStatus,
    createdAt,
    expiresAt,
    expireType: expireType || ExpireType.TIMESTART,
    ...timeProps,
    isLongTerm,
  });

  navigation.navigate('AddClass', { origin });
};
export default classEdit;
