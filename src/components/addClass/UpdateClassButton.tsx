import { MySnackbarAction, OPEN_SNACKBAR } from '../MySnackbar';
import React, { memo } from 'react';
import { customGetClass, customUpdateClass } from '../../customGraphqls';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import { CHANGE_ADD_CLASS_STATE } from '../../stores/actionTypes';
import NextProcessButton from '../NextProcessButton';
import format from 'date-fns/format';
import getArrayBeforeAfter from '../../functions/getArrayBeforeAfter';
import getRegionTag from '../../functions/getRegionTag';
import getTime from 'date-fns/get_time';
import gql from 'graphql-tag';
import parse from 'date-fns/parse';
import reportSentry from '../../functions/reportSentry';
import throttle from 'lodash/throttle';
import { updateTagsCounter } from '../../graphql/mutations';
import { useMutation } from '@apollo/react-hooks';

interface Props {
  stringifiedKeywordTags: string;
  cancelVisible: boolean;
  // setVisible: (arg: boolean) => void;
  snackbarDispatch: (arg: MySnackbarAction) => void;
}

const UPDATE_CLASS = gql(customUpdateClass);
const UPDATE_TAGS_COUNTER = gql(updateTagsCounter);

const UpdateClassButton = ({
  cancelVisible,
  stringifiedKeywordTags,
  // setVisible,
  snackbarDispatch,
}: Props) => {
  const { classStore } = useStoreState();
  const storeDispatch = useStoreDispatch();

  const [updateClass, { loading: loading1 }] = useMutation(UPDATE_CLASS);
  const [updateTags, { loading: loading2 }] = useMutation(UPDATE_TAGS_COUNTER);

  const {
    id,
    title,
    dateStart,
    dateEnd,
    timeStart,
    timeEnd,
    numOfClass,
    dayOfWeek,
    center,
    tags,
    originalTags,
    classFee,
    memo,
    summary,
    isLongTerm,
    expiresAt,
    expireType,
  } = classStore;

  const parsedDateStart = parse(dateStart);
  const parsedDateEnd = !isLongTerm && dateEnd ? parse(dateEnd) : undefined;
  const parsedTimeStart = parse(timeStart);
  const parsedTimeEnd = parse(timeEnd);
  const stringifiedRegionTag = getRegionTag(center!.address);
  // 센터 주소를 tag array에 삽입하되 새로운 array 리턴
  const regionAddedTags = tags.concat([stringifiedRegionTag]);

  const { toAdd, toDelete } = getArrayBeforeAfter(originalTags, regionAddedTags);

  const refetchQueries = [
    {
      query: gql(customGetClass),
      variables: {
        id,
      },
    },
  ];

  // console.log('updateButton:', classStore);
  return (
    <NextProcessButton
      mode="contained"
      // containerStyle={compStyles.flex1}
      loading={loading1 || loading2}
      disabled={loading1 || loading2 || cancelVisible}
      onPress={throttle(async () => {
        try {
          const dateStartEpoch = Math.floor(getTime(parsedDateStart) / 1000);
          const timeStartEpoch = Math.floor(getTime(parsedTimeStart) / 1000);
          const timeEndEpoch = Math.floor(getTime(parsedTimeEnd) / 1000);
          await updateClass({
            variables: {
              input: {
                id,
                title,
                dateStart: dateStartEpoch,
                timeStart: timeStartEpoch,
                timeStartString: format(parsedTimeStart, 'HH:mmZ'),
                timeEnd: timeEndEpoch,
                timeEndString: format(parsedTimeEnd, 'HH:mmZ'),
                isLongTerm,
                numOfClass,
                classFee,
                dayOfWeek: JSON.stringify(dayOfWeek),
                classCenterId: center!.id,
                tagSearchable: stringifiedKeywordTags,
                ...(center!.id !== 'admin_default' && { regionSearchable: stringifiedRegionTag }),
                expiresAt,
                expireType,
                dateEnd: isLongTerm ? null : Math.floor(getTime(parsedDateEnd!) / 1000),
                ...(memo && { memo }),
              },
            },
            refetchQueries,
          });

          //toAdd 하나씩 순회하면서 counter 증가

          // console.log(toAdd, toDelete);
          await updateTags({
            variables: {
              type: 'class',
              toAdd,
              toDelete,
            },
          });

          // console.log('make confirmvisible true');

          storeDispatch({ type: CHANGE_ADD_CLASS_STATE, addClassState: 'confirmClass', summary, confirmVisible: true });

          // setVisible(true);
        } catch (e) {
          reportSentry(e);
          // 에러 snackbar 출력
          snackbarDispatch({
            type: OPEN_SNACKBAR,
            message: e.message,
          });
        }
      }, 5000)}
      children="클래스 수정"
    />
  );
};

export default memo(UpdateClassButton);
