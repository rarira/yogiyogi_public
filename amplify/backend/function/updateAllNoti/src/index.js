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
    TableName: `Comment-wsoqb5adrzggdniumdr33ufgka-${process.env.ENV}`,
    // Key: { id: 'region-tags', createdAt: '2019-01-01T00:00:00.000Z' },
    ProjectionExpression: '#ID, createdAt',
    ExpressionAttributeNames: {
      '#ID': 'id',
    },
  };

  try {
    const scanResult = await docClient.scan(scanParams).promise();

    console.log(scanResult);

    await asyncForEach(scanResult.Items, async item => {
      // const epoch = Math.round(new Date(item.firstCreatedAt).getTime() / 1000);

      const updateParams = {
        TableName: `Comment-etwthb75qjgtfoxavimw5ywswm-${process.env.ENV}`,
        Key: { id: item.id },
        UpdateExpression: 'SET #field = :value',
        ExpressionAttributeNames: {
          '#field': 'commentNotiStatus#createdAt',
        },
        ExpressionAttributeValues: {
          ':value': `OPEN#${item.createdAt}`,
        },
      };
      await docClient.update(updateParams).promise();
    });
    return 'success';
  } catch (e) {
    console.log('async error: ___ ', e);
  }
};
