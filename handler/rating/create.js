import formatErrorResponse from '../../utils/formatError';
import { createRating } from '../../src/rating';

module.exports.process = async (event) => {
  try {
    const statusCode = 201;
    const response = await createRating(event);

    return {
      statusCode,
      body: JSON.stringify(response),
    };
  } catch (err) {
    const response = formatErrorResponse(err);
    return {
      body: JSON.stringify(response),
    };
  }
};
