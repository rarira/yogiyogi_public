/* Amplify Params - DO NOT EDIT
You can access the following resource attributes as environment variables from your Lambda function
var environment = process.env.ENV
var region = process.env.REGION
var apiYogiyogiGraphQLAPIIdOutput = process.env.API_YOGIYOGI_GRAPHQLAPIIDOUTPUT
var apiYogiyogiGraphQLAPIEndpointOutput = process.env.API_YOGIYOGI_GRAPHQLAPIENDPOINTOUTPUT

Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB({ apiVersion: '2012-10-08' });

exports.handler = (event, context, callback) => {
  // TODO implement

  const now = Math.floor(new Date().getTime() / 1000);
  const ddbId = process.env.ENV === 'master' ? 'wsoqb5adrzggdniumdr33ufgka' : 'etwthb75qjgtfoxavimw5ywswm';

  const userParams = {
    TableName: `User-${ddbId}-${process.env.ENV}`,
    Key: { id: { S: event.userName } },
    UpdateExpression: 'SET lastLoginAt = :now',
    ExpressionAttributeValues: {
      ':now': { N: `${now}` },
    },
    ReturnValues: 'NONE',
  };

  ddb.updateItem(userParams, function(err, data) {
    if (err) {
      console.log('Error', err);
    } else {
      console.log('Successfully updated to dynamodb user table', data);
    }
  });
  callback(null, event);
};
