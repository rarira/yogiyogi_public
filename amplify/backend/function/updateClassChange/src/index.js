/* Amplify Params - DO NOT EDIT
You can access the following resource attributes as environment variables from your Lambda function
var environment = process.env.ENV
var region = process.env.REGION

Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');
const https = require('https');
const uuidv4 = require('uuid/v4');

const ddb = new AWS.DynamoDB({ apiVersion: '2012-10-08' });

const appId = process.env.ONESIGNAL_APP_ID;
const apiKey = process.env.ONESIGNAL_API_KEY;
const URL_PREFIX = process.env.ONESIGNAL_CLASSVIEW_NOTI_URL;
// const androidChannelId = process.env.ANDROID_CHANNEL_ID;
const androidGroup = process.env.ANDROID_GROUP;

Date.prototype.addMonths = function(months) {
  var date = new Date(this.valueOf());
  date.setMonth(date.getMonth() + months);
  return date;
};

exports.handler = function(event, context, callback) {
  console.log('Received event:', JSON.stringify(event, null, 2));

  event.Records.forEach(record => {
    var d = new Date();

    let classStatus = '';
    let classProxyId = '';
    let hostId = '';

    const oldUnmarshalled = record.dynamodb.OldImage
      ? AWS.DynamoDB.Converter.unmarshall(record.dynamodb.OldImage)
      : null;
    const newUnmarshalled = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);

    if (record.dynamodb.OldImage) {
      classStatus = oldUnmarshalled.classStatus;
      classProxyId = oldUnmarshalled.classProxyId;
      hostId = oldUnmarshalled.classHostId;
    }

    if (!record.dynamodb.OldImage) {
      hostId = newUnmarshalled.classHostId;
      console.log('new class data', newUnmarshalled);
      handleClassOpenNoti(newUnmarshalled);
    }

    let hostedClassCounter = 0;

    let completedClassCounter = 0;
    let proxiedClassCounter = 0;
    let cancelledClassCounter = 0;

    if (newUnmarshalled.classStatus !== classStatus) {
      if (newUnmarshalled.classStatus === 'open') {
        if (oldUnmarshalled && oldUnmarshalled.classStatus === 'cancelled') {
          cancelledClassCounter -= 1;
        } else {
          hostedClassCounter += 1;
        }
      } else if (newUnmarshalled.classStatus === 'closed') {
        handlePutNoti(newUnmarshalled, 'closed', d);
      } else if (newUnmarshalled.classStatus === 'cancelled') {
        cancelledClassCounter += 1;
      } else if (newUnmarshalled.classStatus === 'completed') {
        completedClassCounter += 1;
      } else if (newUnmarshalled.classStatus === 'proxied') {
        completedClassCounter += 1;
        proxiedClassCounter += 1;
        handlePutNoti(newUnmarshalled, 'proxied', d);
      }
    }

    const hostParams = {
      TableName: `User-wsoqb5adrzggdniumdr33ufgka-${process.env.ENV}`,
      Key: { id: { S: hostId } },
      UpdateExpression:
        'ADD ratings.hostedClassCounter :hosted, ratings.completedClassCounter :completed, ratings.cancelledClassCounter :cancelled',
      ExpressionAttributeValues: {
        ':hosted': { N: String(hostedClassCounter) },
        ':completed': { N: String(completedClassCounter) },
        ':cancelled': { N: String(cancelledClassCounter) },
      },
      ReturnValues: 'NONE',
    };

    ddb.updateItem(hostParams, function(err, data) {
      if (err) {
        console.log('Error', err);
        callback(null, event);
      } else {
        console.log('Successfully updated to dynamodb user table', data);
        callback(null, event);
      }
    });

    if (classStatus !== 'completed' && newUnmarshalled.classStatus === 'completed') {
      const proxyParams = {
        TableName: `User-wsoqb5adrzggdniumdr33ufgka-${process.env.ENV}`,
        Key: { id: { S: classProxyId } },
        UpdateExpression: 'ADD ratings.proxiedClassCounter :proxied',
        ExpressionAttributeValues: {
          ':proxied': { N: String(proxiedClassCounter) },
        },
        ReturnValues: 'NONE',
      };
      ddb.updateItem(proxyParams, function(err, data) {
        if (err) {
          console.log('Error', err);
          callback(null, event);
        } else {
          console.log('Successfully updated to dynamodb user table', data);
          callback(null, event);
        }
      });
    }
  });

  return;
};

const handleClassOpenNoti = classData => {
  const url = `${classData.id}&${classData.classHostId}&notification`;
  const message = {
    app_id: appId,
    ios_badgeType: 'Increase',
    ios_badgeCount: 1,
    headings: {
      en: 'Yogiyogi Notifications',
      ko: '요기요기 알림',
    },
    subtitle: {
      en: `There is a new class with keyword you'd subscribed`,
      ko:
        '구독한 키워드의 클래스가 신규 등록되었습니다. 더 이상 알람을 받지 않으시려면 마이>설정에서 구독 키워드 알림 설정을 변경하세요',
    },
    contents: { en: `클래스 제목: ${classData.title}`, ko: `클래스 제목: ${classData.title}` },
    content_available: true,
    mutable_content: true,
    data: {
      notiType: 'genClassOpen',
      keywords: classData.tagSearchable,
      region: classData.regionSearchable,
      hostId: classData.classHostId,
      classId: classData.id,
      createdAt: classData.firstCreatedAt,
      url: `${URL_PREFIX}${url}`,
    },
    app_url: `${URL_PREFIX}${url}`,
    // android_channel_id: androidChannelId,
    android_group: androidGroup,
    thread_id: 'yogiyogi_class_open',
    summary_arg: 'YogiYogi',
  };

  // TODO: prod에서는 map.이하 삭제 필요
  let keywordArrays = classData.tagSearchable
    ? classData.tagSearchable.split(',')
    : // .map(tag => {
      //     return tag.split('_')[1];
      //   })
      [];
  keywordArrays.push(
    classData.regionSearchable,
    // .split('_')[1]
  );

  if (keywordArrays.length !== 0) {
    let filters = [];
    let optInFilter = [
      { field: 'tag', key: 'optIn', relation: '!=', value: 'false' },
      { field: 'tag', key: 'optIn', relation: '!=', value: classData.classHostId },
    ];
    // let externalUserIDFilter = { field: 'tag', key: 'userId', relation: '!=', value: classData.classHostId };
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

const handlePutNoti = (classData, type, now) => {
  const id = uuidv4();
  const isoNow = now.toISOString();
  const expiresAt = Math.round(now.addMonths(2).getTime() / 1000);
  const notiType = type === 'closed' ? 'genToHost' : 'genToProxy';

  const notiReceiverId = type === 'closed' ? classData.classHostId : classData.classProxyId;

  const params = {
    TableName: `Noti-wsoqb5adrzggdniumdr33ufgka-${process.env.ENV}`,
    Item: {
      id: { S: id },
      notiType: { S: notiType },
      notiReceiverId: { S: notiReceiverId },

      targetType: { S: 'reviewTarget' },
      targetId: { S: classData.id },
      content: { S: classData.title },
      extraInfo: { S: `${classData.id}/${classData.classHostId}` },
      createdAt: { S: isoNow },
      expiresAt: { N: String(expiresAt) },
      notiKind: { S: 'nonMessage' },
      'notiKind#createdAt': { S: `nonMessage#${isoNow}` },
    },
  };

  ddb.putItem(params, (err, data) => {
    if (err) console.log(err, err.stack);
    else console.log('successfully created notiId: ', id); // successful response
  });
};
