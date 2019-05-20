import AWS from 'aws-sdk';
import Promise from 'bluebird';

/**
 * DynamoDB client
 */
export default class dynamoDBClient {
  /**
   * Class constructor
   */
  constructor(table, index = null) {
    this.region = process.env.SERVERLESS_REGION;
    this.tableName = table;
    this.index = index;

    this.config = {
      apiVersion: '2012-08-10',
      region: this.region,
    };

    this.dynamoDB = Promise.promisifyAll(new AWS.DynamoDB(this.config));
  }

  /**
   * Create a record
   *
   * @param object item
   *
   * @returns {Promise.<*>}
   */
  async create(item) {
    const params = {
      TableName: this.tableName,
      Item: item,
      ReturnValues: 'ALL_OLD',
    };

    const response = await this.dynamoDB.putItemAsync(params);

    return response;
  }

  /**
     * Update a record
     *
     * @param object item
     *
     * @returns {Promise.<*>}
     */
  async update(key, expression, value) {
    const params = {
      TableName: this.tableName,
      Key: key,
      UpdateExpression: expression,
      ExpressionAttributeValues: value,
      ReturnValues: 'UPDATED_NEW',
    };

    const response = await this.dynamoDB.updateItemAsync(params);

    return response;
  }

  /**
     * Delete a record by key
     *
     * @param object item
     *
     * @returns {Promise.<*>}
     */
  async delete(key) {
    const params = {
      TableName: this.tableName,
      Key: key,
    };

    const response = await this.dynamoDB.deleteItemAsync(params);

    return response;
  }

  /**
   * Query an index
   *
   * @param id
   * @param params
   *
   * @returns {Promise.<*>}
   */
  async query(params) {
    params.TableName = this.tableName;
    params.IndexName = this.index;

    const response = await this.dynamoDB.queryAsync(params);

    return response;
  }
}
