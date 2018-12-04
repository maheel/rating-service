import { expect } from 'chai';
import AWS from 'mock-aws';
import Promise from 'bluebird';

import dynamoDBClient from '../../../src/lib/aws/dynamoDBClient';

describe('dynamoDBClient', function () {
  before(() => {
    const config = {
      apiVersion: '2012-08-10',
      region: 'us-east-1',
    };

    Promise.promisifyAll(new AWS.DynamoDB(config));
  });

  const table = 'rating_table';
  const index = 'content_id_index';

  describe('create', function () {
    it('creates records successfully', async function () {
      const itemTobSaved = {
        id: {
          S: 'eb0be243-b706-48cd-91fb-1c37f7b49f00',
        },
        contentId: {
          N: 1000000,
        },
        userId: {
          N: 10,
        },
      };

      const dynamoDBResponse = {};

      AWS.mock('DynamoDB', 'putItem', dynamoDBResponse);

      const dynamoDB = new dynamoDBClient(table);
      const actualResult = await dynamoDB.create(itemTobSaved);

      expect(actualResult).to.deep.equal(dynamoDBResponse);
    });
  });

  describe('query', function () {
    const dynamoDB = new dynamoDBClient(table, index);
    const params = {
      KeyConditionExpression: 'contentId = :c',
      ExpressionAttributeValues: {
        ':c': {
          N: 1000,
        },
        ':u': {
          N: 2423423,
        },
      },

      FilterExpression: 'userId = :u',
    };

    it('fetches a list of records successfully', async function () {
      const dynamoDBResponse = require('../../fixture/aws/dynamodb-query-item.json');
      AWS.mock('DynamoDB', 'query', dynamoDBResponse);

      const actualResult = await dynamoDB.query(params);

      expect(actualResult).to.deep.equal(dynamoDBResponse);
    });

    it('returns an empty response when items not found', async function () {
      const dynamoDBResponse = {
        Items: [],
        Count: 0,
        ScannedCount: 0,
      };
      AWS.mock('DynamoDB', 'query', dynamoDBResponse);

      const actualResult = await dynamoDB.query(params);

      expect(actualResult).to.deep.equal(dynamoDBResponse);
    });
  });
});
