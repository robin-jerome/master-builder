const AWS = require('aws-sdk');
const sagemakerruntime = new AWS.SageMakerRuntime({ apiVersion: '2017-05-13', region: 'us-east-2' });
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const sageMakerEp = process.env.SAGEMAKER_ENDPOINT;
const dynamoTable = process.env.DYNAMODB_TABLE;
const PRODUCT_ID = 'Fixed Deposit';
const CUSTOMER_ID = 'robinjer@amazon.com'; // TODO: Read from record information
exports.handler = async (event, context, callback) => {
  console.log(`Received event in SageMaker trigger lambda ${JSON.stringify(event)}`);
  const recordsForInference = event.Records
    .filter(r => {
      if (r.eventName === 'REMOVE') return false;
      if (r.dynamodb && r.dynamodb.NewImage) { // Records with entities and no recommendations
        return r.dynamodb.NewImage.recommendations.L.length === 0 /* && r.dynamodb.NewImage.entities.L.length > 0 */ //TODO: Remove after entities are populated
      }
      return false;
    });
  const inferencePromises = recordsForInference.map(r => {
    const inferenceParams = getInferenceParams(r);
    return sagemakerruntime.invokeEndpoint({
      EndpointName: sageMakerEp,
      ContentType: 'text/csv',
      Accept: 'text/csv',
      Body: inferenceParams
    }).promise();
  });
  return Promise.all(inferencePromises)
    .then(respArray => {
      const recommOut = respArray.map(resp => {
        const body = resp.Body.toString();
        if (body.includes('yes')) { // Add to recommendations
          console.log(`SageMaker thinks that the product can be recommended to the customer`);
          return true;
        } else if (body.includes('no')) { // Do not add to recommendations
          console.log(`SageMaker thinks that the product should not be recommended to the customer`);
          return false;
        }
      });
      const storePromises = [];
      recordsForInference.forEach((r, index) => {
        const isRecommended = recommOut[index];
        // Todo Fetch customer id from 'r'
        storePromises.push(storeInferenceOutputForCustomer(CUSTOMER_ID, PRODUCT_ID, isRecommended));
      });
      return Promise.all(storePromises);
    })
    .catch(err => {
      console.error(`Errow while triggering inference from SageMaker endpoint - ${JSON.stringify(err)}`);
      return Promise.reject(err);
    })
};
const storeInferenceOutputForCustomer = (customerId, productId, isRecommended) => {
  console.log(`Storing product recommendation as '${isRecommended}' for product '${productId}' and customer '${customerId}'`);
  return dynamoDb.update({
    TableName: dynamoTable,
    Key: {
      'customerId': customerId
    },
    UpdateExpression: "set recommendations = list_append(recommendations, :r)",
    ExpressionAttributeValues: {
      ":r": [{ "productId": productId, "isRecommended": isRecommended }]
    },
    ReturnValues: 'UPDATED_NEW'
  }).promise();
}
const getInferenceParams = (record) => {
  // TODO: Fetch from comprehension & DB
  return '31,technician,single,secondary,no,102,yes,no,telephone,17,apr,460,2,345,2,failure'
};