import { getContentRatingByUser } from './helpers';

import customError from '../error/customError';
import dynamoDBClient from '../lib/aws/dynamoDBClient';
import validateSchema from '../util/validateSchema';

const ratingTable = process.env.RATING_TABLE;

/**
 * Delete rating
 *
 * @param request
 * @param callback
 *
 * @returns {Promise.<*>}
 */
const deleteRating = async (request) => {
  try {
    const body = JSON.parse(request.body);
    const { contentId, userId } = body;

    const ratingSchema = 'http://iflix.com/schemas/rating+v1#';
    const validationResult = await validateSchema.validateRequest(ratingSchema, body);

    if (validationResult.valid !== true) {
      throw new customError(validationResult.errors, validationResult.errors[0].status);
    }

    const ratingRecord = await getContentRatingByUser(contentId.toString(), userId.toString());

    if (ratingRecord.Count === 0) {
      throw new customError('User has yet to vote for this content');
    }

    const key = {
      id: ratingRecord.Items[0].id,
    };

    console.log('[Info]: Saving in DynamoDB');
    const dynamoDB = new dynamoDBClient(ratingTable);
    await dynamoDB.delete(key);

    return body;
  } catch (error) {
    console.log('[error]', JSON.stringify(error));
    return error;
  }
};

export {
  deleteRating,
};
