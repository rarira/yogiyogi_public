const AWS = require('aws-sdk');

const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
const ddb = new AWS.DynamoDB({ apiVersion: '2012-10-08' });

AWS.config.update({
  region: 'ap-northeast-2',
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: process.env.IDENTITY_POOL_ID,
  }),
});

exports.handler = function(event, context) {
  console.log(event);
  const params = {
    UserPoolId: process.env.POOL_ID,
    Username: event.arguments.userId,
  };
  cognitoidentityserviceprovider.adminDisableUser(params, (err, data) => {
    if (err) {
      console.log(err, err.stack);
      return 'cognito failed to disable user';
    } else {
      console.log(data);
      const userParams = {
        TableName: `User-wsoqb5adrzggdniumdr33ufgka-${process.env.ENV}`,
        Key: { id: { S: event.arguments.userId } },
        UpdateExpression: 'SET accountStatus = :accStatus',
        ExpressionAttributeValues: {
          ':accStatus': { S: 'disabled' },
        },
        ReturnValues: 'NONE',
      };

      ddb.updateItem(userParams, function(err, data) {
        if (err) {
          console.log('Error', err);
          return 'failed to disable user';
        } else {
          console.log('Successfully updated to dynamodb user table', data);
          return 'successfully disabled user';
        }
      });
    }
  });
};
