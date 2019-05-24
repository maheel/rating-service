import { expect } from 'chai';
import sinon from 'sinon';

import { updateRating } from '../../src/rating';
import dynamoDBClient from '../../src/lib/aws/dynamoDBClient';

const updateTest = () => {
  const request = require('../fixture/update-rating-request.json');
  let create;
  let update;

  afterEach(() => {
    create.restore();
    update.restore();
  });

  it('update rating successfully', async function () {
    const queryDbResponse = require('../fixture/aws/dynamodb-create-rating-request.json');
    create = sinon
      .stub(dynamoDBClient.prototype, 'create')
      .returns(Promise.resolve(queryDbResponse));

    const queryDbResponse2 = require('../fixture/aws/dynamodb-create-rating-response.json');
    update = sinon
      .stub(dynamoDBClient.prototype, 'update')
      .returns(Promise.resolve(queryDbResponse2));

    const expectedResult = require('../fixture/get-rating-by-content-response.json');

    await updateRating(
      request,
      (err, response) => {
        console.log(response);
        expect(response).to.deep.equal(expectedResult);
        expect(update.callCount).to.equal(1);
      });
  });

  it('does not update when user has yet to create rating', async function () {
    const queryDbResponse = require('../fixture/aws/dynamodb-create-rating-response.json');
    update = sinon
      .stub(dynamoDBClient.prototype, 'update')
      .returns(Promise.resolve(queryDbResponse));

    const expectedResult = 'User has yet to vote for this content';

    await updateRating(
      request,
      (err, response) => {
        console.log(response);
        expect(err.description).to.equal(expectedResult);
        expect(err.code).to.equal(400);
      });
  });
};

export {
  updateTest,
};
