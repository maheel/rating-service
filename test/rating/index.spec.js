import { expect } from 'chai';
import sinon from 'sinon';

import rating from '../../src/rating';
import dynamoDBClient from '../../src/lib/aws/dynamoDBClient';
import validateSchema from '../../src/util/validateSchema';

describe('rating', function () {
  describe('createRating', function () {
    let request = require('../fixture/create-rating-request.json');
    let validateRequest;
    let query;
    let create;

    afterEach(() => {
      validateRequest.restore();
      query.restore();
      create.restore();
    });

    it('creates rating successfully', async function () {
      validateRequest = sinon
        .stub(validateSchema, 'validateRequest')
        .returns(Promise.resolve({ valid: true }));

      query = sinon
        .stub(dynamoDBClient.prototype, 'query')
        .returns(Promise.resolve({ Items: [], Count: 0, ScannedCount: 32 }));

      create = sinon
        .stub(dynamoDBClient.prototype, 'create')
        .returns(Promise.resolve({}));

      const expectedResult = JSON.parse(request.body);

      await rating.createRating(
        request,
        (err, response) => {
          console.log(response);
          expect(response).to.deep.equal(expectedResult);
          expect(validateRequest.callCount).to.equal(1);
          expect(create.callCount).to.equal(1);
        });
    });

    it('does not crete rating when validation is not successful', async function () {
      request = require('../fixture/create-rating-invalid-request.json');
      const validationResponse = {
        valid: false,
        errors: [
          {
            status: '422',
            source: {
              pointer: '/rating',
            },
            detail: 'should be <= 5',
            title: 'Invalid Attribute',
          },
        ],
      };

      validateRequest = sinon
        .stub(validateSchema, 'validateRequest')
        .returns(Promise.resolve(validationResponse));

      query = sinon.spy(dynamoDBClient.prototype, 'query');
      create = sinon.spy(dynamoDBClient.prototype, 'create');

      await rating.createRating(
        request,
        (err, response) => {
          expect(err.code).to.equal(parseInt(validationResponse.errors[0].status, 10));
          expect(err.description).to.deep.equal(validationResponse.errors);
          expect(query.callCount).to.equal(0);
          expect(create.callCount).to.equal(0);
        });
    });

    it('does not crete rating when user has already rated the content', async function () {
      validateRequest = sinon
        .stub(validateSchema, 'validateRequest')
        .returns(Promise.resolve({ valid: true }));

      const searchResponse = require('../fixture/aws/dynamodb-query-item.json');

      query = sinon
        .stub(dynamoDBClient.prototype, 'query')
        .returns(Promise.resolve(searchResponse));

      create = sinon.spy(dynamoDBClient.prototype, 'create');

      await rating.createRating(
        request,
        (err, response) => {
          expect(err.description).to.equal('User has already voted for this content');
          expect(err.code).to.equal(400);
          expect(create.callCount).to.equal(0);
        });
    });
  });

  describe('getRatingByContent', function () {
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

      await rating.getRatingByContent(
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

      await rating.getRatingByContent(
        request,
        (err, response) => {
          expect(err.description).to.equal('Insufficient total number of ratings to calculate the average');
          expect(err.code).to.equal(400);
        });
    });
  });
});
