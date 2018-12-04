# Rating Service

This project has been developed as a serverless microservice based on Serverless framework, AWS lambda, API Gateway and the database used is DynamoDB.
Project will be deployed to AWS `us-east-1` region as defined in `serverless.env.yml` and can be changed through environment files
based on the environment. Ex:  `serverless.env.yml.dev` is for development environment.

Core of the project is `serverless.yml` file and it is where all the AWS resources, IAM permissions and environment variables
have been defined.

Ex: Dynamo DB table and index creation, IAM policy for lambda to access resources

**Reasons Behind Choosing the following tech stack.**
1. Microservice - Well focused small service which provides better maintainability, testability and deployability, 
2. Serverless - Zero administration, auto scalling, Pay-per-use
3. DynamoDb - High performing, low latency fully managed NOSQL DB database which seamlessly scalable (serverless). Well fit 
for AWS labmbda functions 

**Assumptions**: 
1. Sample-size - It won't return anything if there is no sufficient number of total ratings. Limit has been defined in 
`src/constant/index.js` and it has been set to 20 currently.

2. Outliers - I assumed that there will be a machine learning model in order to detect outliers and remove / disable from the DB

## Prerequisites

Please follow following steps in order to get the project up and running.

1. Install node.js version 8.10 (AWS Lambda latest supported version)

       nvm install 8.10

2. Register and install Serverless framework globally

       npm install -g serverless
   
   https://serverless.com/framework/docs/providers/aws/guide/quick-start/
   
4. Install Dependencies

       npm install
      
5. Set up an AWS account to generate credentials for Serverless to access resources

   https://www.youtube.com/watch?v=HSd9uYj2LJA
   https://serverless.com/framework/docs/providers/aws/guide/credentials/
   
6. Configure Serverless to use AWS

       serverless config credentials --provider aws --key AKIAIOSFODNN7EXAMPLE --secret wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

   Keys will be stored in `~/.aws/credentials` in your machine
   
7. Install AWS CLI

       pip install awscli --upgrade --user
   
   https://docs.aws.amazon.com/cli/latest/userguide/installing.html

## Development

##### Test End-points Locally

In order to test and debug end-points on your local machine, run the following command on your terminal from the 
project directory and get URLs as displayed.

    sls offline start

##### Run Lint

    npm run lint

##### Run Spec Tests

    npm run test
    
**NOTE**: Keep below command running while you change any test, code as it will watch for 
any change and tests will be run automatically once you hit ctrl+s

    npm run test:watch
    
##### Run Test Coverage

    npm run coverage
    
##### Run Integration Tests - Offline

**NOTE**: When running integration tests on your local machine, keep running `serverless offline start` in one tab, and run the following command
in another one,

    npm run test:integration:offline
    
##### How To Write Integration Tests

https://scotch.io/tutorials/write-api-tests-with-postman-and-newman
https://www.getpostman.com/docs/v6/postman/collection_runs/command_line_integration_with_newman
    
## Deployment

In order to deploy everything to your staging environment in AWS run following command on your terminal from the
project directory. Once deployment finished it will output all the endpoint URLs on the terminal.

    serverless deploy -v
    
Note** : Use this method when you have updated your Function, Event or Resource configuration in serverless.yml 
and you want to deploy that change (or multiple changes at the same time) to AWS.

If you want to deploy only code changes related to a function, use below command, which is faster as it does not touch AWS CloudFormation Stack.

    serverless deploy function --function FunctionName
    
Fetch logs of a specific function

    serverless logs -f FunctionName -t (optionally tail the logs)


## Endpoints

| Method                                       |Description                              |
|----------------------------------------------|-----------------------------------------|
| POST /rating                                 | Create rating                           |
| GET /rating/content/{contentId}              | Get rating by content                   |

#### Common Headers

All the requests should contain following headers.

| Key                | Value                                                               |               
|--------------------|---------------------------------------------------------------------|
|Content-Type        | application/json                                            |                                              
|Accept              | application/json                                            |                                                                

#### Common Errors

| Status code  | Value                                            |               
|--------------|--------------------------------------------------|
|400           | Bad Request                                      |                                             
|403           | Forbidden (incorrect stage, incorrect api key)   | 
|422           | Unprocessable Entity (validation errors )        |                                            
|500           | Internal server error                            | 


#### 1. Create Rating
A user can't rate the same content more than once,

#### POST {url}/rating

##### Request

```
   {
       "userId": 808,
       "contentId": 562135,
       "rating": 4
   }
```

##### Response

| Status code  | Value                                                               |               
|--------------|------------------------------|
|201           | Created                      | 

```
   {
       "userId": 808,
       "contentId": 562135,
       "rating": 4
   }
```

##### Error Response
   
 ```{
        "errors": [
            {
                "status": "400",
                "title": "Bad Request",
                "detail": "User has already voted for this content"
            }
        ]
    }   
 ```
 
#### 2. Get Rating By Content

#### GET {url}/rating/content/{contentId}

##### Response

| Status code  | Value                                                               |               
|--------------|------------------------------|
|200           | OK                           | 

```
  {
      "contentId": "562135",
      "averageRating": 3.9,
      "totalRatingCount": 38,
      "ratingDetails": {
          "1": 3,
          "2": 2,
          "3": 5,
          "4": 13,
          "5": 15
      }
  }
```

##### Error Response
   
 ```{
        "errors": [
            {
                "status": "400",
                "title": "Bad Request",
                "detail": "Insufficient total number of ratings to calculate the average"
            }
        ]
    }   
 ```