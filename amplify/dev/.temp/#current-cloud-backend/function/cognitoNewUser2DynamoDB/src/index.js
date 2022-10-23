const aws = require('aws-sdk');

const ddb = new aws.DynamoDB({ apiVersion: '2012-10-08' });

exports.handler = function(event, context, callback) {
  var d = new Date();

  var params = {
    TableName: `User-p7nt6t7fgvbw5jnh3yi2cuy3dy-${process.env.ENV}`,
    Item: {
      id: { S: event.userName },
      // sub: { S: event.request.userAttributes.sub },
      email: { S: event.request.userAttributes.email },
      createdAt: { S: d.toISOString() },
      profileUpdated: { BOOL: false },
      __typename: { S: 'User' },
      bookmark: {
        M: {
          count: { N: '0' },
          used: { BOOL: false },
        },
      },
      mannerCounter: {
        M: {
          gm01: { N: '0' },
          gm02: { N: '0' },
          gm03: { N: '0' },
          gm04: { N: '0' },
          gm05: { N: '0' },
          gm06: { N: '0' },
          gm07: { N: '0' },
          gm08: { N: '0' },
          gm09: { N: '0' },
          gm10: { N: '0' },
          gm11: { N: '0' },
          gm12: { N: '0' },
          gm13: { N: '0' },
          gm14: { N: '0' },
          gm15: { N: '0' },
          gm16: { N: '0' },
          bm01: { N: '0' },
          bm02: { N: '0' },
          bm03: { N: '0' },
          bm04: { N: '0' },
          bm05: { N: '0' },
          bm06: { N: '0' },
          bm07: { N: '0' },
          bm08: { N: '0' },
          bm09: { N: '0' },
          bm10: { N: '0' },
          bm11: { N: '0' },
          bm12: { N: '0' },
          bm13: { N: '0' },
          bm14: { N: '0' },
          bm15: { N: '0' },
          bm16: { N: '0' },
        },
      },
      ratings: {
        M: {
          completedClassCounter: { N: '0' },
          hostedClassCounter: { N: '0' },
          proxiedClassCounter: { N: '0' },
          cancelledClassCounter: { N: '0' },
          receivedHostReviewCounter: { N: '0' },
          satisfiedHostReviewCounter: { N: '0' },
          receivedProxyReviewCounter: { N: '0' },
          satisfiedProxyReviewCounter: { N: '0' },
        },
      },
      settings: {
        M: {
          privacyResume: { BOOL: true },
          privacyManners: { BOOL: true },
        },
      },
      accountStatus: { S: 'active' },
      // simpleSearchHistory: { SS: [] },
      // detailSearchHistory: { SS: [] },
    },
  };
  if (event.request.userAttributes.picture) {
    if (event.userName.startsWith('Kakao')) {
      params.Item.oauthPicture = {
        S: event.request.userAttributes.picture,
      };
    } else if (event.userName.startsWith('Google')) {
      params.Item.oauthPicture = {
        S: event.request.userAttributes.picture,
      };
    } else if (event.userName.startsWith('Facebook')) {
      const str = event.request.userAttributes.picture;
      const dataObj = JSON.parse(str);

      params.Item.oauthPicture = {
        S: dataObj.data.url,
      };
    }
  }

  if (event.request.userAttributes.name) {
    params.Item.name = {
      S: event.request.userAttributes.name,
    };
  }

  if (event.request.userAttributes.email_verified === 'true' || event.request.userAttributes.verified === 'true') {
    params.Item.verified = {
      BOOL: true,
    };
  }

  ddb.putItem(params, function(err, data) {
    if (err) {
      console.log('Error', err);
      callback(null, event);
    } else {
      console.log('Successfully user added to dynamodb user table', data);
      callback(null, event);
    }
  });
};
