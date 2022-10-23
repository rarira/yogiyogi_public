/* Amplify Params - DO NOT EDIT
You can access the following resource attributes as environment variables from your Lambda function
var environment = process.env.ENV
var region = process.env.REGION

Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');
const https = require('https');
AWS.config.update({ region: 'us-east-1' });

const appId = process.env.ONESIGNAL_APP_ID;
const apiKey = process.env.ONESIGNAL_API_KEY;
const URL_PREFIX = process.env.ONESIGNAL_POSTVIEW_NOTI_URL;
// const androidChannelId = process.env.ANDROID_CHANNEL_ID;
const androidGroup = process.env.ANDROID_GROUP;

exports.handler = function(event, context, callback) {
  console.log('Received event:', JSON.stringify(event, null, 2));

  event.Records.forEach(record => {
    let postAuthorId = '';

    const newUnmarshalled = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);

    if (!record.dynamodb.OldImage && newUnmarshalled.postCategory === 'info' && newUnmarshalled.postStatus === 'open') {
      postAuthorId = newUnmarshalled.postAuthorId;
      console.log('new info Post data', newUnmarshalled);
      handleInfoPostOpenNoti(newUnmarshalled);
      sendmail(newUnmarshalled);
    }
  });

  return;
};

const handleInfoPostOpenNoti = postData => {
  const url = `${postData.id}&notification`;
  const message = {
    app_id: appId,
    ios_badgeType: 'Increase',
    ios_badgeCount: 1,
    headings: {
      en: 'Yogiyogi Notifications',
      ko: '요기요기 알림',
    },
    subtitle: {
      en: `There is a new info posting with keyword you'd subscribed`,
      ko:
        '구독한 키워드의 정보 게시물이 새로 등록되었습니다. 더 이상 알람을 받지 않으시려면 마이>설정에서 구독 키워드 알림 설정을 변경하세요',
    },
    contents: { en: `게시물 제목: ${postData.postTitle}`, ko: `게시물 제목: ${postData.postTitle}` },
    content_available: true,
    mutable_content: true,
    data: {
      notiType: 'genPostOpen',
      keywords: postData.postTags,
      postAuthorId: postData.postAuthorId,
      postId: postData.id,
      createdAt: postData.createdAt,
      url: `${URL_PREFIX}${url}`,
    },
    app_url: `${URL_PREFIX}${url}`,
    // android_channel_id: androidChannelId,
    android_group: androidGroup,
    thread_id: 'yogiyogi_post_open',
    summary_arg: 'YogiYogi',
  };

  // TODO: prod에서는 map.이하 삭제 필요
  let keywordArrays = postData.postTags ? postData.postTags.split(',') : [];

  if (keywordArrays.length !== 0) {
    let filters = [];
    let optInFilter = [
      { field: 'tag', key: 'optIn', relation: '!=', value: 'false' },
      { field: 'tag', key: 'optIn', relation: '!=', value: postData.postAuthorId },
    ];
    // let externalUserIDFilter = { field: 'tag', key: 'userId', relation: '!=', value: postData.classHostId };
    let operatorOrFilter = { operator: 'OR' };
    keywordArrays.forEach((keyword, index, array) => {
      if (index !== array.length - 1) {
        filters.push(
          // externalUserIDFilter,
          ...optInFilter,
          { field: 'tag', key: keyword, relation: '=', value: 'subscribed' },
          operatorOrFilter,
        );
      } else {
        filters.push(
          // externalUserIDFilter,
          ...optInFilter,
          {
            field: 'tag',
            key: keyword,
            relation: '=',
            value: 'subscribed',
          },
        );
      }
    });
    // console.log(filters);
    message.filters = filters;
  }

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

const sendmail = postData => {
  const { postLink, postTitle, postContent, thumbnailURL, createdAt } = postData;
  // send mail
  const emailBody = `
    게시자 : ${postAuthorId}
    생성일 : ${createdAt}
    제목: ${postTitle}
    내용: ${postContent}
    링크: ${postLink}
    썸네일: ${thumbnailURL}
    `;

  // Create sendEmail params
  var params = {
    Destination: {
      /* required */
      // CcAddresses: [
      //   'EMAIL_ADDRESS',
      //   /* more items */
      // ],
      ToAddresses: [
        process.env.EMAIL_ADDRESS,
        /* more items */
      ],
    },
    Message: {
      /* required */
      Body: {
        /* required */
        // Html: {
        //   Charset: 'UTF-8',
        //   Data: 'HTML_FORMAT_BODY',
        // },
        Text: {
          Charset: 'UTF-8',
          Data: emailBody,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `[요기요기: 새 정보 게시물] ${postTitle} by ${postAuthorId} 가 게시되었습니다`,
      },
    },
    Source: process.env.EMAIL_ADDRESS,
  };
  var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();

  // Handle promise's fulfilled/rejected states
  sendPromise
    .then(function(data) {
      console.log(data.MessageId);
      context.done(null, 'info post mail successfully sent!');
    })
    .catch(function(err) {
      console.error(err, err.stack);
      context.error(null, 'failed to send info post mail');
    });
};
