import 'source-map-support/register';

import rating from '../src/rating';

/**
 * Format error response
 *
 * @param error
 *
 * @returns {{}}
 */
function formatErrorResponse(error) {
  const finalResponse = {};
  let statusCode = 500;

  if (error.code !== undefined) {
    statusCode = error.code;
    let title;
    if (statusCode.toString() === '400') {
      title = 'Bad Request';
    }

    finalResponse.errors = [
      {
        status: statusCode.toString(),
        title,
        detail: error.description,
      },
    ];
  } else {
    finalResponse.errors = 'Internal server error';
  }

  return finalResponse;
}

module.exports.create = async (event, context, callback) => {
  await rating.createRating(
    event,
    (error, response) => {
      let finalResponse;
      let statusCode;

      if (error !== null) {
        finalResponse = formatErrorResponse(error);
      } else {
        statusCode = 201;
        finalResponse = response;
      }

      return callback(
        null,
        {
          statusCode,
          body: JSON.stringify(finalResponse),
        },
      );
    },
  );
};

module.exports.update = async (event, context, callback) => {
  await rating.updateRating(
    event,
    (error, response) => {
      let finalResponse;
      let statusCode;

      if (error !== null) {
        finalResponse = formatErrorResponse(error);
      } else {
        statusCode = 200;
        finalResponse = response;
      }

      return callback(
        null, {
          statusCode,
          body: JSON.stringify(finalResponse),
        },
      );
    },
  );
};

module.exports.delete = async (event, context, callback) => {
  await rating.deleteRating(
    event,
    (error, response) => {
      let finalResponse;
      let statusCode;

      if (error !== null) {
        finalResponse = formatErrorResponse(error);
      } else {
        statusCode = 200;
        finalResponse = response;
      }

      return callback(
        null, {
          statusCode,
          body: JSON.stringify(finalResponse),
        },
      );
    },
  );
};

module.exports.getRatingByContent = async (event, context, callback) => {
  await rating.getRatingByContent(
    event,
    (error, response) => {
      let finalResponse;
      let statusCode;

      if (error !== null) {
        finalResponse = formatErrorResponse(error);
      } else {
        statusCode = 200;
        finalResponse = response;
      }

      return callback(
        null,
        {
          statusCode,
          body: JSON.stringify(finalResponse),
        },
      );
    },
  );
};
