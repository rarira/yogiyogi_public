const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

exports.handler = async function(event, context) {
  try {
    const { toAdd, toDelete, type } = event.arguments;

    let regionExpression = 'add ';
    let regionNames = { '#target': type === 'user' ? 'subscriberCounter' : 'taggedClassCounter' };
    let regionValues = {};
    let regionCounter = 1;

    let nonRegionExpression = 'add ';
    let nonRegionNames = { '#target': type === 'user' ? 'subscriberCounter' : 'taggedClassCounter' };
    let nonRegionValues = {};
    let nonRegionCounter = 1;

    if (toAdd) {
      await asyncForEach(toAdd, tag => {
        const isRegionTag = tag.startsWith('지역');
        const split = tag.split('_');

        const depth1 = isRegionTag ? tag : split[0];
        const depth2 = isRegionTag ? '' : split[1];

        if (isRegionTag) {
          regionExpression = regionExpression.concat(`extraData.#addDepth${regionCounter}.#target :increment, `);
          regionNames[`#addDepth${regionCounter}`] = depth1;
          regionValues[':increment'] = 1;
          regionCounter++;
        } else {
          nonRegionExpression = nonRegionExpression.concat(
            `extraData.#addNonDepth1${nonRegionCounter}.#addNonDepth2${nonRegionCounter}.#target  :increment, `,
          );
          nonRegionNames[`#addNonDepth1${nonRegionCounter}`] = depth1;
          nonRegionNames[`#addNonDepth2${nonRegionCounter}`] = depth2;
          nonRegionValues[':increment'] = 1;
          nonRegionCounter++;
        }
      });
    }

    if (toDelete) {
      await asyncForEach(toDelete, tag => {
        const isRegionTag = tag.startsWith('지역');
        const split = tag.split('_');

        const depth1 = isRegionTag ? tag : split[0];
        const depth2 = isRegionTag ? '' : split[1];

        if (isRegionTag) {
          regionExpression = regionExpression.concat(`extraData.#delDepth${regionCounter}.#target :decrement, `);
          regionNames[`#delDepth${regionCounter}`] = depth1;
          regionValues[':decrement'] = -1;
          regionCounter++;
        } else {
          nonRegionExpression = nonRegionExpression.concat(
            `extraData.#delNonDepth1${nonRegionCounter}.#delNonDepth2${nonRegionCounter}.#target :decrement, `,
          );
          nonRegionNames[`#delNonDepth1${nonRegionCounter}`] = depth1;
          nonRegionNames[`#delNonDepth2${nonRegionCounter}`] = depth2;
          nonRegionValues[':decrement'] = -1;
          nonRegionCounter++;
        }
      });
    }

    if (regionExpression.length > 4) {
      const finalRegionExpression = regionExpression.slice(0, -2);
      const regionParams = {
        TableName: `News-p7nt6t7fgvbw5jnh3yi2cuy3dy-${process.env.ENV}`,
        Key: { id: 'region-tags', createdAt: '2019-01-01T00:00:00.000Z' },
        UpdateExpression: finalRegionExpression,
        ExpressionAttributeNames: regionNames,
        ExpressionAttributeValues: regionValues,
      };

      const regionResult = await docClient.update(regionParams).promise();
    }

    if (nonRegionExpression.length > 4) {
      const finalNonRegionExpression = nonRegionExpression.slice(0, -2);
      const nonRegionParams = {
        TableName: `News-p7nt6t7fgvbw5jnh3yi2cuy3dy-${process.env.ENV}`,
        Key: { id: 'non-region-tags', createdAt: '2019-01-01T00:00:00.000Z' },
        UpdateExpression: finalNonRegionExpression,
        ExpressionAttributeNames: nonRegionNames,
        ExpressionAttributeValues: nonRegionValues,
      };

      const nonRegionResult = await docClient.update(nonRegionParams).promise();
    }
    return 'success';
  } catch (e) {
    console.log('async error: ___ ', e);
  }
};
