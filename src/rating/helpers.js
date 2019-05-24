import uuid from 'uuid';
import moment from 'moment-timezone';
import math from 'mathjs';

import dynamoDBClient from '../lib/aws/dynamoDBClient';
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
const prepareRatingItem = (item) => {
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
};

/**
 * Get contentId rating by userId
 *
 * @param contentId
 * @param userId
 *
 * @returns {Promise.<boolean>}
 */
const getContentRatingByUser = async (contentId, userId) => {
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
};

/**
 * Check if user has already voted for the same content
 *
 * @param contentId
 * @param userId
 *
 * @returns {Promise.<boolean>}
 */
const hasUserAlreadyVotedForSameContent = async (contentId, userId) => {
  const rating = await getContentRatingByUser(contentId, userId);

  if (rating.Count > 0) {
    throw new customError('User has already voted for this content');
  }

  return true;
};

/**
 * Build rating response
 *
 * @param {object} ratingItems
 *
 * @returns {Promise.<{}>}
 */
const buildRatingResponse = async (ratingItems) => {
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
};


export {
  prepareRatingItem,
  getContentRatingByUser,
  hasUserAlreadyVotedForSameContent,
  buildRatingResponse,
};
