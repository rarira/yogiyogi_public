/* Amplify Params - DO NOT EDIT
You can access the following resource attributes as environment variables from your Lambda function
var environment = process.env.ENV
var region = process.env.REGION

Amplify Params - DO NOT EDIT */
const AWS = require('aws-sdk');
const https = require('https');

const appId = process.env.ONESIGNAL_APP_ID;
const apiKey = process.env.ONESIGNAL_API_KEY;
const URL_PREFIX = process.env.ONESIGNAL_COMM_NOTI_URL;
const androidGroup = process.env.ANDROID_GROUP;

exports.handler = function(event, context, callback) {
  event.Records.forEach(record => {
    const newUnmarshalled = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);

    if (!record.dynamodb.OldImage && newUnmarshalled.commentStatus === 'OPEN') {
      console.log('new comment data', newUnmarshalled);
      if (newUnmarshalled.commentAuthorId !== newUnmarshalled.commentReceiverId) {
        handleNewCommentNoti(newUnmarshalled);
      }
    }

    return;
  });
};

const handleNewCommentNoti = commentData => {
  const url = `2&Home`;
  const isMain = commentData.commentDepth === 'MAIN';

  const message = {
    app_id: appId,
    ios_badgeType: 'Increase',
    ios_badgeCount: 1,
    headings: {
      en: 'Yogiyogi Notifications',
      ko: '요기요기 알림',
    },
    subtitle: {
      en: isMain ? `There is a new comment on your post` : `There is a new reply to your comment`,
      ko: isMain ? `당신의 게시물에 새로운 댓글이 있습니다.` : `당신의 댓글에 새로운 답글이 달렸습니다.`,
    },
    contents: {
      en: isMain
        ? `댓글 작성자: ${commentData.commentAuthorName}, 게시물: "${
            commentData.replyInfo.repliedPostTitle
          }",  댓글 내용: "${commentData.commentContent.slice(0, 10)}..."`
        : `답글 작성자: ${commentData.commentAuthorName}, 게시물: "${
            commentData.replyInfo.repliedPostTitle
          }",  답글 내용: "${commentData.commentContent.slice(0, 10)}..."`,
      ko: isMain
        ? `댓글 작성자: ${commentData.commentAuthorName}, 게시물: "${
            commentData.replyInfo.repliedPostTitle
          }",  댓글 내용: "${commentData.commentContent.slice(0, 10)}..."`
        : `답글 작성자: ${commentData.commentAuthorName}, 게시물: "${
            commentData.replyInfo.repliedPostTitle
          }",  답글 내용: "${commentData.commentContent.slice(0, 10)}..."`,
    },
    content_available: true,
    mutable_content: true,
    data: {
      notiType: 'newComment',
      authorId: commentData.authorId,
      //   authorName: commentData.author.name,
      createdAt: commentData.createdAt,
      repliedToId: commentData.replyInfo.repliedToId,
      addedToId: commentData.addedToId,
      commentType: commentData.commentType,
      url: `${URL_PREFIX}${url}`,
    },
    app_url: `${URL_PREFIX}${url}`,
    // android_channel_id: androidChannelId,
    android_group: androidGroup,
    thread_id: 'yogiyogi_new_comment',
    summary_arg: 'YogiYogi',
    filters: [{ field: 'tag', key: 'commOptIn', relation: '=', value: commentData.commentReceiverId }],
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
