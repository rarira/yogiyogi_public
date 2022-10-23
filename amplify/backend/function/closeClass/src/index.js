const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = function(event, context) {
  //eslint-disable-line
  handleClose('open');
  handleClose('reserved');
};

const handleClose = status => {
  const now = new Date();
  const epochNow = Math.round(now.getTime() / 1000);

  const queryParams = {
    TableName: `Class-wsoqb5adrzggdniumdr33ufgka-${process.env.ENV}`,
    IndexName: 'gsi-ClassStatusExpiresAt',
    ProjectionExpression: '#classStatus, id, expiresAt, classHostId',
    KeyConditionExpression: '#classStatus = :status and expiresAt <= :now',
    ExpressionAttributeNames: {
      '#classStatus': 'classStatus',
    },
    ExpressionAttributeValues: {
      ':status': status,
      ':now': epochNow,
    },
  };
  docClient.query(queryParams, function(err, data) {
    if (err) {
      console.log('Unable to query. Error:', JSON.stringify(err, null, 2));
    } else {
      console.log(now, 'Query succeeded: ', data.Items.length);
      data.Items.forEach(item => {
        const updateParams = {
          TableName: `Class-wsoqb5adrzggdniumdr33ufgka-${process.env.ENV}`,
          Key: { id: item.id },
          UpdateExpression: 'set #classStatus = :status, expiresAt = :newTime',
          ExpressionAttributeNames: {
            '#classStatus': 'classStatus',
          },
          ExpressionAttributeValues: {
            ':status': 'closed',
            ':newTime': 4716639219,
          },
        };
        docClient.update(updateParams, function(err, data) {
          if (err) console.log(err);
          else console.log(data);
        });
      });
    }
  });
};
