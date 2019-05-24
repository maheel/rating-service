import { expect } from 'chai';
import sinon from 'sinon';

import { deleteRating } from '../../src/rating';
import dynamoDBClient from '../../src/lib/aws/dynamoDBClient';

const deleteTest = () => {
  const request = require('../fixture/update-rating-request.json');
  let create;
  let deleteR;

  afterEach(() => {
    create.restore();
    deleteR.restore();
  });

  it('delete rating successfully', async function () {
    const queryDbResponse = require('../fixture/aws/dynamodb-create-rating-request.json');
    create = sinon
      .stub(dynamoDBClient.prototype, 'create')
      .returns(Promise.resolve(queryDbResponse));

    const queryDbResponse2 = require('../fixture/aws/dynamodb-create-rating-response.json');
    deleteR = sinon
      .stub(dynamoDBClient.prototype, 'delete')
      .returns(Promise.resolve(queryDbResponse2));

    const expectedResult = require('../fixture/get-rating-by-content-response.json');

    await deleteRating(
      request,
      (err, response) => {
        console.log(response);
        expect(response).to.deep.equal(expectedResult);
        expect(deleteR.callCount).to.equal(1);
        expect(err.code).to.equal(202);
      });
  });

  it('does not delete when user has yet to create rating', async function () {
    const queryDbResponse = require('../fixture/aws/dynamodb-create-rating-response.json');
    deleteR = sinon
      .stub(dynamoDBClient.prototype, 'update')
      .returns(Promise.resolve(queryDbResponse));

    const expectedResult = 'User has yet to vote for this content';

    await deleteRating(
      request,
      (err, response) => {
        console.log(response);
        expect(err.description).to.equal(expectedResult);
        expect(err.code).to.equal(400);
      });
  });
};

export {
  deleteTest,
};
