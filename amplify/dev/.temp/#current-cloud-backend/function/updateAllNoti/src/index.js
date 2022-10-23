/* Amplify Params - DO NOT EDIT
You can access the following resource attributes as environment variables from your Lambda function
var environment = process.env.ENV
var region = process.env.REGION

Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

exports.handler = async function(event, context) {
  const scanParams = {
    TableName: `Noti-p7nt6t7fgvbw5jnh3yi2cuy3dy-${process.env.ENV}`,
    // Key: { id: 'region-tags', createdAt: '2019-01-01T00:00:00.000Z' },
    ProjectionExpression: '#ID, #NotiType, #createdAt',
    ExpressionAttributeNames: {
      '#ID': 'id',
      '#NotiType': 'notiType',
      '#createdAt': 'createdAt',
    },
  };
  try {
    const scanResult = await docClient.scan(scanParams).promise();

    console.log(scanResult);

    await asyncForEach(scanResult.Items, async noti => {
      const notiKind = noti.notiType === 'message' ? 'message' : 'nonMessage';
      const updateParams = {
        TableName: `Noti-p7nt6t7fgvbw5jnh3yi2cuy3dy-${process.env.ENV}`,
        Key: { id: noti.id, createdAt: noti.createdAt },
        UpdateExpression: 'REMOVE #prop SET notiKind = :value, #newProp = :value2',
        ExpressionAttributeNames: {
          '#prop': 'notiType#createdAt',
          '#newProp': 'notiKind#createdAt',
        },
        ExpressionAttributeValues: {
          ':value': notiKind,
          ':value2': `${notiKind}#${noti.createdAt}`,
        },
      };
      await docClient.update(updateParams).promise();
    });
    return 'success';
  } catch (e) {
    console.log('async error: ___ ', e);
  }
};
