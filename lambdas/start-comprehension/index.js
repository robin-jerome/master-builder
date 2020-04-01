const https = require('https');
const AWS = require('aws-sdk');
const comprehend = new AWS.Comprehend({ apiVersion: '2017-11-27' });
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
  var requestUrl = event.TranscriptFileUri;
  console.log(`Transcript file will be fetched from ${requestUrl}`);
  console.log(`Received event in lambda ${JSON.stringify(event)}`);
  https.get(requestUrl, (res) => {
    var chunks = [];
    res.on("data", function(chunk) {
      chunks.push(chunk);
    });
    res.on("end", function() {
      var body = Buffer.concat(chunks);
      var results = JSON.parse(body);
      var transcript = results.results.transcripts[0].transcript;
      console.log(`Transcribed text "${transcript}"`);
      var params = {
        LanguageCode: "en",
        Text: transcript + ""
      };
      Promise.all([
          comprehend.detectEntities(params).promise(),
          comprehend.detectSentiment(params).promise()
        ]).then(([entities, sentiments]) => {
          console.log(`Detected entities: ${JSON.stringify(entities)}`);
          console.log(`Detected sentiments: ${JSON.stringify(sentiments)}`);
          return storeToDynamoDB('asdfg', entities, sentiments);
        })
        .then(() => {
          callback(null, {});
        })
        .catch(err => {
          console.log(err, err.stack);
        });
    });

  }).on('error', (e) => {
    console.error(e);
  });
};

const storeToDynamoDB = (customerId, entities, sentiments) => {
  const timestamp = new Date().getTime();
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      customerId: customerId,
      entities: entities,
      sentiments: sentiments,
      recommendations: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    }
  }
  return dynamoDb.put(params).promise()
    .then(data => {
      console.log(`Stored entities and sentiments in DynamoDB for customer: ${customerId}`);
      return Promise.resolve(data);
    })
    .catch(err => {
      console.error(`Failed to store entities and sentiments in DynamoDB for customer: ${customerId}, error : ${JSON.stringify(err)}`);
      return Promise.reject(err);
    })
};