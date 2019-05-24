import { expect } from 'chai';
import sinon from 'sinon';

import { getRatingByContent } from '../../src/rating';
import dynamoDBClient from '../../src/lib/aws/dynamoDBClient';

const getRatingByContentTest = () => {
  const request = require('../fixture/get-rating-by-content-request.json');
  let query;

  afterEach(() => {
    query.restore();
  });

  it('get rating successfully', async function () {
    const queryDbResponse = require('../fixture/aws/dynamodb-query-rating-response.json');
    query = sinon
      .stub(dynamoDBClient.prototype, 'query')
      .returns(Promise.resolve(queryDbResponse));

    const expectedResult = require('../fixture/get-rating-by-content-response.json');

    await getRatingByContent(
      request,
      (err, response) => {
        console.log('test response >>>>>>>>', response);
        expect(response).to.deep.equal(expectedResult);
        expect(query.callCount).to.equal(1);
      });
  });

  it('does not return a rating when there is no sufficient rating data', async function () {
    const queryDbResponse = require('../fixture/aws/dynamodb-query-rating-insufficient-response.json');
    query = sinon
      .stub(dynamoDBClient.prototype, 'query')
      .returns(Promise.resolve(queryDbResponse));

    await getRatingByContent(
      request,
      (err, response) => {
        expect(err.description).to.equal('Insufficient total number of ratings to calculate the average');
        expect(err.code).to.equal(400);
      });
  });
};

export {
  getRatingByContentTest,
};
