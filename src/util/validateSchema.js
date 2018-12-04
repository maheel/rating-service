import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true });

ajv.addSchema(require('../../resource/schema/rating+v1.json'));

/**
 * Validate request through ajv
 *
 * @param {String} schema
 * @param {*} request
 *
 * @returns {*}
 */
async function validate(schema, request) {
  return {
    valid: ajv.validate(schema, request),
    errors: ajv.errors,
  };
}

/**
 * Validate request
 *
 * @param schema
 * @param request
 * @returns {boolean}
 */
async function validateRequest(schema, request) {
  const result = await validate(schema, request);
  const validationResponse = {
    valid: result.valid,
  };

  if (result.errors !== null) {
    const formattedErrors = result.errors.map(async (error) => ({
      status: '422',
      source: {
        pointer: error.dataPath.split('.').join('/'),
      },
      detail: error.message,
      title: 'Invalid Attribute',
    }));

    const errors = await Promise.all(formattedErrors);

    validationResponse.errors = errors;
  }

  return validationResponse;
}

export default {
  validateRequest,
};
