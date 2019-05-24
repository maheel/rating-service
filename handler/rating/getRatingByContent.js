import formatErrorResponse from '../../utils/formatError';
import { getRatingByContent } from '../../src/rating';

module.exports.process = async (event) => {
  try {
    const statusCode = 201;
    const response = await getRatingByContent(event);

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
