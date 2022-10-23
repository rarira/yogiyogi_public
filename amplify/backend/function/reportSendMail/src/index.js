var AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });

exports.handler = function(event, context) {
  const { reporterId, reportTargetType, targetId, reportCategory, extraInfo } = event.arguments.input;
  // const reporterId = '${event.arguments.input.reporterId}';
  // const reportTargetType = '${event.arguments.input.reportTargetType}';
  // const targetId = '${event.arguments.input.targetId}';
  // const reportCategory = '${event.arguments.input.reportCategory}';
  // const extraInfo = '${event.arguments.input.extraInfo}';

  const emailBody = `
  신고자 아이디 : ${reporterId}
  신고 대상: ${reportTargetType} / ${targetId}
  신고 분류: ${reportCategory}
  추가 정보: ${extraInfo}
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
        Data: `[요기요기: 신고] ${reportTargetType} / ${targetId} 신고입니다`,
      },
    },
    Source: process.env.EMAIL_ADDRESS,
  };

  // Create the promise and SES service object
  var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();

  // Handle promise's fulfilled/rejected states
  sendPromise
    .then(function(data) {
      console.log(data.MessageId);
      context.done(null, 'report mail successfully sent!');
    })
    .catch(function(err) {
      console.error(err, err.stack);
      context.error(null, 'failed to send report mail');
    });
};
