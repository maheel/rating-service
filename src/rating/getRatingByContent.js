import { buildRatingResponse } from './helpers';

import dynamoDBClient from '../lib/aws/dynamoDBClient';

const ratingTable = process.env.RATING_TABLE;
const contentIdIndex = process.env.RATING_TABLE_INDEX_CONTENT_ID;

/**
 * Get rating by content
 *
 * @param request
 * @param callback
 *
 * @returns {Promise.<*>}
 */
const getRatingByContent = async (request) => {
  try {
    const { contentId } = request.pathParameters;

    const searchParams = {
      ExpressionAttributeValues: {
        ':c': {
          N: contentId,
        },
      },
      KeyConditionExpression: 'contentId = :c',
    };

    const dynamoDB = new dynamoDBClient(ratingTable, contentIdIndex);
    const ratings = await dynamoDB.query(searchParams);

    const response = {
      contentId,
    };

    let ratingResponse;
    if (ratings.Count > 0) {
      ratingResponse = await buildRatingResponse(ratings.Items);
    }

    Object.assign(response, ratingResponse);

    return response;
  } catch (error) {
    console.log('[error]', JSON.stringify(error));
    return error;
  }
};

export {
  getRatingByContent,
};
