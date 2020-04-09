'use strict'
const AWS = require('aws-sdk');
const fs = require('fs');

if (process.argv.length < 4) {
  console.error(`
    Insufficient arguments, please pass the cloudformation stack name
    Example: 'npm run aws-deploy <presentation-stack-name> <aws-region> <aws-profile-name>'
  `);
}

const awsProfile = process.argv[4] || 'default';
const awsRegion = process.argv[3];
const stackName = process.argv[2];

var credentials = new AWS.SharedIniFileCredentials({ profile: awsProfile });
AWS.config.credentials = credentials;
const cloudformation = new AWS.CloudFormation({ apiVersion: '2010-05-15', region: awsRegion });
console.log(`CloudFormation stack with name '${stackName}' will be described to fetch UI deployment params`);
const findStackOutputValueByKey = (key, outputs) => {
  return outputs.find(o => o.OutputKey === key).OutputValue;
}

return cloudformation.describeStacks({ StackName: stackName }).promise()
  .then(resp => {
    if (resp.Stacks && resp.Stacks.length > 0) {
      const outputs = resp.Stacks[0].Outputs;
      const fileContent = `window.apiGwSettings = ${JSON.stringify({
        cognitoIdentityPool: findStackOutputValueByKey('CognitoIdentityPoolId', outputs),
        cognitoUserPoolId: findStackOutputValueByKey('CognitoUserPoolId', outputs),
        cognitoUserPoolClientId: findStackOutputValueByKey('CognitoUserPoolClientId', outputs),
        region: findStackOutputValueByKey('Region', outputs),
        apiGwEndpoint: findStackOutputValueByKey('ApiGateway', outputs)
      }, null, 2)};`
      fs.writeFileSync('./build/settings.js', fileContent);
      console.log('Successfully updated settings file in build directory');
    } else {
      console.error(`Stack with name ${stackName} does not exist yet. Operation unsuccessful`);
      return Promise.reject(new Error('Invalid stack name'));
    }
  })