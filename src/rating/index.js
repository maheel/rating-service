import uuid from 'uuid';
import moment from 'moment-timezone';
import math from 'mathjs';

import dynamoDBClient from '../lib/aws/dynamoDBClient';
import validateSchema from '../util/validateSchema';
import customError from '../error/customError';
import ratingConst from '../constant';

const ratingTable = process.env.RATING_TABLE;
const contentIdIndex = process.env.RATING_TABLE_INDEX_CONTENT_ID;

/**
 * Prepare rating item to be saved in DynamboDB
 *
 * @param {object} item
 *
 * @returns {Promise.<{}>}
 */
async function prepareRatingItem(item) {
  const ratingItem = {
    id: {
      S: uuid.v4(),
    },
    userId: {
      N: (item.userId).toString(),
    },
    contentId: {
      N: (item.contentId).toString(),
    },
    rating: {
      N: (item.rating).toString(),
    },
    createdAt: {
      S: moment().format(),
    },
  };

  return ratingItem;
}

/**
 * Get contentId rating by userId
 *
 * @param contentId
 * @param userId
 *
 * @returns {Promise.<boolean>}
 */
async function getContentRatingByUser(contentId, userId) {
  const searchParams = {
    KeyConditionExpression: 'contentId = :c',
    ExpressionAttributeValues: {
      ':c': {
        N: contentId,
      },
      ':u': {
        N: userId,
      },
    },

    FilterExpression: 'userId = :u',
  };

  const dynamoDB = new dynamoDBClient(ratingTable, contentIdIndex);
  const response = await dynamoDB.query(searchParams);

  return response;
}


/**
 * Check if user has already voted for the same content
 *
 * @param contentId
 * @param userId
 *
 * @returns {Promise.<boolean>}
 */
async function hasUserAlreadyVotedForSameContent(contentId, userId) {
  const rating = await getContentRatingByUser(contentId, userId);

  if (rating.Count > 0) {
    throw new customError('User has already voted for this content');
  }

  return true;
}

/**
 * Create rating
 *
 * @param request
 * @param callback
 *
 * @returns {Promise.<*>}
 */
async function createRating(request) {
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
}

/**
 * Update rating
 *
 * @param request
 * @param callback
 *
 * @returns {Promise.<*>}
 */
async function updateRating(request) {
  try {
    const body = JSON.parse(request.body);
    const { contentId, userId, rating } = body;

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
    const expression = 'set rating = :r, updatedAt = :u';
    const value = {
      ':r': {
        N: rating.toString(),
      },
      ':u': {
        S: moment().format(),
      },
    };

    console.log('[Info]: Saving in DynamoDB');
    const dynamoDB = new dynamoDBClient(ratingTable);
    await dynamoDB.update(key, expression, value);

    return body;
  } catch (error) {
    console.log('[error]', JSON.stringify(error));
    return error;
  }
}

/**
 * Update rating
 *
 * @param request
 * @param callback
 *
 * @returns {Promise.<*>}
 */
async function deleteRating(request) {
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
}

/**
 * Build rating response
 *
 * @param {object} ratingItems
 *
 * @returns {Promise.<{}>}
 */
async function buildRatingResponse(ratingItems) {
  let totalRating = 0;
  const ratingDetails = {};
  const totalRatingCount = ratingItems.length;

  if (totalRatingCount < ratingConst.minimumRatingTotalLimit) {
    throw new customError('Insufficient total number of ratings to calculate the average');
  }

  ratingItems.forEach((ratingItem) => {
    const rating = Number.parseInt(ratingItem.rating.N, 10);
    totalRating = math.add(totalRating, rating);

    if (Object.prototype.hasOwnProperty.call(ratingDetails, rating.toString())) {
      ratingDetails[rating] = math.add(ratingDetails[rating], 1);
    } else {
      ratingDetails[rating] = 1;
    }
  });

  const averageRating = math.round(math.divide(totalRating, totalRatingCount), 1);

  return {
    averageRating,
    totalRatingCount,
    ratingDetails,
  };
}

/**
 * Get rating by content
 *
 * @param request
 * @param callback
 *
 * @returns {Promise.<*>}
 */
async function getRatingByContent(request) {
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
}

export default {
  createRating,
  updateRating,
  deleteRating,
  getRatingByContent,
};
