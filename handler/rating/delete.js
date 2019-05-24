import formatErrorResponse from '../../utils/formatError';
import { deleteRating } from '../../src/rating';

module.exports.process = async (event) => {
  try {
    const statusCode = 202;
    const response = await deleteRating(event);

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
