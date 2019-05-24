import moment from 'moment-timezone';
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

  describe('update', function () {
    it('update records successfully', async function () {
      const itemTobSaved = {
        id: {
          S: 'bdf4c5fe-c717-4a62-986d-e0e2b5d153ce',
        },
        contentId: {
          N: '562135',
        },
        userId: {
          N: '4134346',
        },
        rating: {
          N: '10',
        },
      };

      const now = moment().format();
      const key = {
        id: itemTobSaved.id,
      };
      const expression = 'set rating = :r, updatedAt = :u';
      const value = {
        ':r': {
          N: '1',
        },
        ':u': {
          S: now,
        },
      };

      const dynamoDBResponse = require('../../fixture/aws/dynamodb-create-rating-response');

      AWS.mock('DynamoDB', 'updateItem', dynamoDBResponse);

      const dynamoDB = new dynamoDBClient(table);
      await dynamoDB.create(itemTobSaved);
      const actualResult = await dynamoDB.update(key, expression, value);

      expect(actualResult).to.deep.equal(dynamoDBResponse);
    });
  });

  describe('delete', function () {
    it('delete records successfully', async function () {
      const itemTobSaved = {
        id: {
          S: 'bdf4c5fe-c717-4a62-986d-e0e2b5d153ce',
        },
        contentId: {
          N: '562135',
        },
        userId: {
          N: '4134346',
        },
        rating: {
          N: '10',
        },
      };

      const key = {
        id: itemTobSaved.id,
      };

      const dynamoDBResponse = require('../../fixture/aws/dynamodb-create-rating-response');

      AWS.mock('DynamoDB', 'deleteItem', dynamoDBResponse);

      const dynamoDB = new dynamoDBClient(table);
      await dynamoDB.create(itemTobSaved);
      const actualResult = await dynamoDB.delete(key);
      
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
