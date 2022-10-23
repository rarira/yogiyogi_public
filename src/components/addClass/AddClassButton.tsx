import { MySnackbarAction, OPEN_SNACKBAR } from '../MySnackbar';
import React, { memo } from 'react';
import { useStoreDispatch, useStoreState } from '../../stores/initStore';

import { CHANGE_ADD_CLASS_STATE } from '../../stores/actionTypes';
import { ClassStatusType } from '../../API';
import NextProcessButton from '../NextProcessButton';
import { customCreateClass } from '../../customGraphqls';
import debounce from 'lodash/debounce';
import format from 'date-fns/format';
import getRegionTag from '../../functions/getRegionTag';
import getTime from 'date-fns/get_time';
import gql from 'graphql-tag';
import parse from 'date-fns/parse';
import reportSentry from '../../functions/reportSentry';
import { updateTagsCounter } from '../../graphql/mutations';
import { useMutation } from '@apollo/react-hooks';
import uuidv4 from 'uuid/v4';

interface Props {
  stringifiedKeywordTags: string;
  cancelVisible: boolean;
  // setVisible: (arg: boolean) => void;
  snackbarDispatch: (arg: MySnackbarAction) => void;
}

// const CREATE_CLASS_AND_NOTI = gql(customCreateClassAndNoti);
const CREATE_CLASS = gql(customCreateClass);
const UPDATE_TAGS_COUNTER = gql(updateTagsCounter);

const AddClassButton = ({
  stringifiedKeywordTags,
  //  setVisible,
  snackbarDispatch,
}: Props) => {
  const {
    classStore,
    authStore: {
      user: { username },
    },
  } = useStoreState();
  const storeDispatch = useStoreDispatch();
  // const [createClassAndNoti, { loading: loading1 }] = useMutation(CREATE_CLASS_AND_NOTI);
  const [createClass, { loading: ccLoading }] = useMutation(CREATE_CLASS);
  const [updateTags, { loading: utLoading }] = useMutation(UPDATE_TAGS_COUNTER);
  const {
    title,
    dateStart,
    dateEnd,
    timeStart,
    timeEnd,
    numOfClass,
    dayOfWeek,
    center,
    tags,
    classFee,
    memo,
    summary,
    isLongTerm,
    expiresAt,
    expireType,
  } = classStore;

  const parsedDateStart = parse(dateStart);
  const parsedDateEnd = dateEnd ? parse(dateEnd) : undefined;
  const parsedTimeStart = parse(timeStart);
  const parsedTimeEnd = parse(timeEnd);

  const stringifiedRegionTag = getRegionTag(center!.address);
  // 센터 주소를 tag array에 삽입하되 새로운 array 리턴
  const regionAddedTags = tags.concat([stringifiedRegionTag]);

  const classId = uuidv4();
  const createdAt = new Date().toISOString();
  const createdAtEpoch = Math.floor(getTime(createdAt) / 1000);
  const dateStartEpoch = Math.floor(getTime(parsedDateStart) / 1000);
  const timeStartEpoch = Math.floor(getTime(parsedTimeStart) / 1000);
  const timeEndEpoch = Math.floor(getTime(parsedTimeEnd) / 1000);
  const classInput = {
    id: classId,
    title,
    dateStart: dateStartEpoch,
    timeStart: timeStartEpoch,
    timeStartString: format(parsedTimeStart, 'HH:mmZ'),
    timeEnd: timeEndEpoch,
    timeEndString: format(parsedTimeEnd, 'HH:mmZ'),
    isLongTerm,
    numOfClass,
    classFee,
    createdAt,
    createdAtEpoch,
    firstCreatedAt: createdAt,
    firstCreatedAtEpoch: createdAtEpoch,
    classHostId: username,
    dayOfWeek: JSON.stringify(dayOfWeek),
    classStatus: ClassStatusType.open,
    classCenterId: center!.id,
    tagSearchable: stringifiedKeywordTags,
    regionSearchable: stringifiedRegionTag,
    expiresAt,
    expireType,
    ...(parsedDateEnd && { dateEnd: Math.floor(getTime(parsedDateEnd) / 1000) }),
    ...(memo && { memo }),
    updateCounter: 0,
  };

  const _handleCreate = debounce(
    async () => {
      try {
        await createClass({
          variables: {
            input: classInput,
          },
        });

        await updateTags({
          variables: {
            type: 'class',
            toAdd: regionAddedTags,
          },
        });

        storeDispatch({
          type: CHANGE_ADD_CLASS_STATE,
          addClassState: 'confirmClass',
          summary,
          id: classId,
          confirmVisible: true,
        });
        // setVisible(true);
      } catch (e) {
        reportSentry(e);

        // 에러 snackbar 출력
        snackbarDispatch({
          type: OPEN_SNACKBAR,
          message: e.message,
        });
      }
    },
    5000,
    { leading: true, trailing: false },
  );

  return (
    <NextProcessButton
      loading={ccLoading || utLoading}
      disabled={ccLoading || utLoading}
      mode="contained"
      // containerStyle={compStyles.flex1}
      onPress={_handleCreate}
      children="클래스 등록"
    />
  );
};

export default memo(AddClassButton);
