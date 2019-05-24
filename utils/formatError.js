/**
 * Format error response
 *
 * @param error
 *
 * @returns {{}}
 */
export default function formatErrorResponse(error) {
  const finalResponse = {};
  let statusCode = 500;

  if (error.code !== undefined) {
    statusCode = error.code;
    let title;
    if (statusCode.toString() === '400') {
      title = 'Bad Request';
    }

    finalResponse.errors = [{
      status: statusCode.toString(),
      title,
      detail: error.description,
    }];
  } else {
    finalResponse.errors = 'Internal server error';
  }

  return finalResponse;
}
