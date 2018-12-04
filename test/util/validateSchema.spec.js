import { expect } from 'chai';

import validateSchema from '../../src/util/validateSchema';

const schema = 'http://iflix.com/schemas/rating+v1#';

describe('validateRequest', function () {
  it('returns successful valid message upon successful validation', async function () {
    const request = require('./../fixture/create-rating-request-json-object.json').body;

    const actualResult = await validateSchema.validateRequest(schema, request);

    expect(actualResult).to.deep.equal({ valid: true });
  });

  it('returns error message/s upon unsuccessful validation', async function () {
    const request = require('./../fixture/create-rating-invalid-json-object.json').body;

    const actualResult = await validateSchema.validateRequest(schema, request);

    expect(actualResult.valid).to.equal(false);
    expect(actualResult.errors[0].status).to.equal('422');
    expect(actualResult.errors[0]).to.have.property('source');
    expect(actualResult.errors[0]).to.have.property('detail');
  });
});
