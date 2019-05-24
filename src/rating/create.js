import { prepareRatingItem, hasUserAlreadyVotedForSameContent } from './helpers';

import customError from '../error/customError';
import dynamoDBClient from '../lib/aws/dynamoDBClient';
import validateSchema from '../util/validateSchema';

const ratingTable = process.env.RATING_TABLE;

/**
 * Create rating
 *
 * @param request
 * @param callback
 *
 * @returns {Promise.<*>}
 */
const createRating = async (request) => {
  try {
    const body = JSON.parse(request.body);

    const ratingSchema = 'http://iflix.com/schemas/rating+v1#';
    const validationResult = await validateSchema.validateRequest(ratingSchema, body);

    if (validationResult.valid !== true) {
      throw new customError(validationResult.errors, validationResult.errors[0].status);
    }

    await hasUserAlreadyVotedForSameContent((body.contentId).toString(), (body.userId).toString());

    const itemTobeSaved = await prepareRatingItem(body);

    console.log('[Info]: Saving in DynamoDB');
    const dynamoDB = new dynamoDBClient(ratingTable);
    await dynamoDB.create(itemTobeSaved);

    return body;
  } catch (error) {
    console.log('[error]', JSON.stringify(error));
    return error;
  }
};

export {
  createRating,
};
