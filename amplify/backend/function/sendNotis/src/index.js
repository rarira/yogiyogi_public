const AWS = require('aws-sdk');
const https = require('https');

const appId = process.env.ONESIGNAL_APP_ID;
const apiKey = process.env.ONESIGNAL_API_KEY;
const URL_PREFIX = process.env.URL_PREFIX;
// const chatChannelID = process.env.CHAT_CHAN_ID;
// const genChannelID = process.env.GEN_CHAN_ID;
const androidGroup = process.env.ANDROID_GROUP;

exports.handler = function(event, context) {
  event.Records.forEach(record => {
    var d = new Date();

    if (record.eventName == 'INSERT') {
      const newUnmarshalled = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
      console.log(newUnmarshalled, 'will be sent');
      if (newUnmarshalled.extraInfo !== 'exit') {
        handlePushNoti(newUnmarshalled);
      }
    }
  });

  return;
};

const handlePushNoti = notiData => {
  const {
    id,
    notiType,
    notiReceiverId,
    content,
    extraInfo,
    notiConvId,
    senderName,
    notiSenderId,
    createdAt,
  } = notiData;
  let subtitle = { en: '', ko: '' };
  let contents = { en: '', ko: '' };
  let url = '';
  let data = {
    id,
    notiType,
    notiSenderId,
    notiReceiverId,
    hostId: null,
    classId: null,
    createdAt: createdAt,
    url: null,
  };
  let tagKey = '';
  // let android_channel_id = '';
  let thread_id = '';
  let classId = null;
  let hostId = null;
  let android_visibility = 0;
  let collapse_id = undefined;

  switch (notiType) {
    case 'message':
      classId = notiConvId.split('_')[0];
      hostId = extraInfo;
      subtitle.en = 'There is a new chat message';
      subtitle.ko = '새로운 채팅방 메시지가 도착하였습니다';
      contents.en = `${senderName}님의 메시지 : ${content}`;
      contents.ko = `${senderName}님의 메시지 : ${content}`;
      url = `chat/${notiConvId}&${classId}&${hostId}&ChatList`;
      data.hostId = hostId;
      data.classId = classId;
      data.notiConvId = notiConvId;
      data.url = `${URL_PREFIX}${url}`;
      tagKey = 'messageOptIn';
      // android_channel_id = chatChannelID;
      thread_id = 'yogiyogi_chat';
      android_visibility = 0;
      collapse_id = notiConvId;
      break;

    case 'genToHost':
      classId = extraInfo.split('/')[0];
      hostId = extraInfo.split('/')[1];
      subtitle.en = 'There is a class waiting for your review';
      subtitle.ko = '구인 기간이 만료된 클래스가 있습니다';
      contents.en = `"${content}" 클래스의 구인 기간이 만료되었습니다. 클래스 수행을 완료하고 선생님 리뷰를 작성하세요`;
      contents.ko = `"${content}" 클래스의 구인 기간이 만료되었습니다. 클래스 수행을 완료하고 선생님 리뷰를 작성하세요`;
      url = 'classList/toReview&0&Noti';
      data.hostId = hostId;
      data.classId = classId;
      data.url = `${URL_PREFIX}${url}`;
      tagKey = 'reviewOptIn';
      // android_channel_id = genChannelID;
      thread_id = 'yogiyogi_notis';
      android_visibility = 1;
      collapse_id = 'genToHost';

      break;

    case 'genToProxy':
      classId = extraInfo.split('/')[0];
      hostId = extraInfo.split('/')[1];
      subtitle.en = 'There is a class waiting for your review';
      subtitle.ko = '선생님으로 수행 완료한 클래스가 있습니다';
      contents.en = `선생님을 담당한 "${content}" 클래스가 완료되었습니다. 호스트 리뷰를 작성하세요`;
      contents.ko = `선생님을 담당한 "${content}" 클래스가 완료되었습니다. 호스트 리뷰를 작성하세요`;
      url = 'classList/toReview&1&Noti';
      data.hostId = hostId;
      data.classId = classId;
      data.url = `${URL_PREFIX}${url}`;
      tagKey = 'reviewOptIn';
      // android_channel_id = genChannelID;
      thread_id = 'yogiyogi_notis';
      android_visibility = 1;
      collapse_id = 'genToProxy';

      break;

    default:
      break;
  }

  const message = {
    app_id: appId,
    ios_badgeType: 'Increase',
    ios_badgeCount: 1,
    // include_external_user_ids: [notiReceiverId],
    headings: {
      en: 'Yogiyogi Notifications',
      ko: '요기요기 알림',
    },
    subtitle,
    contents,
    content_available: true,
    mutable_content: true,
    data,
    // android_channel_id,
    android_group: androidGroup,
    thread_id,
    collapse_id,
    // priority: 10,
    android_visibility,
    summary_arg: 'YogiYogi',
    app_url: data.url,
    filters: [
      // { field: 'tag', key: 'userId', relation: '=', value: notiReceiverId },
      { field: 'tag', key: tagKey, relation: '=', value: notiReceiverId },
    ],
  };

  sendNotification(message);
};

const sendNotification = data => {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    Authorization: `Basic ${apiKey}`,
  };

  const options = {
    host: 'onesignal.com',
    port: 443,
    path: '/api/v1/notifications',
    method: 'POST',
    headers,
  };

  const req = https.request(options, res => {
    res.on('data', data2 => {
      console.log('Response:');
      console.log(JSON.parse(data2));
    });
  });

  req.on('error', e => {
    console.log('ERROR:');
    console.log(e);
  });

  req.write(JSON.stringify(data));
  req.end();
};
