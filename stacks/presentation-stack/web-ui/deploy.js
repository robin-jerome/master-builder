'use strict'
const AWS = require('aws-sdk');
const fs = require('fs');
const async = require('async');
const path = require("path");
const readdir = require('recursive-readdir');
const mime = require("mime-types");

if (process.argv.length < 4) {
  console.error(`
    Insufficient arguments, please pass the cloudformation stack name
    Example: 'npm run aws-deploy <presentation-stack-name> <aws-region> <aws-profile-name>'
  `);
}

const awsProfile = process.argv[4] || 'default';
const awsRegion = process.argv[3];
const stackName = process.argv[2];
const UPLOAD_FOLDER_NAME = 'build';
const UPLOAD_FOLDER = `./${UPLOAD_FOLDER_NAME}`;
const rootFolder = path.resolve(__dirname, './');

var credentials = new AWS.SharedIniFileCredentials({ profile: awsProfile });
AWS.config.credentials = credentials;
const cloudformation = new AWS.CloudFormation({ apiVersion: '2010-05-15', region: awsRegion });
const s3 = new AWS.S3({ apiVersion: '2006-03-01', signatureVersion: 'v4' });
console.log(`CloudFormation stack with name '${stackName}' will be described to fetch UI deployment params`);

const findStackOutputValueByKey = (key, outputs) => {
  return outputs.find(o => o.OutputKey === key).OutputValue;
}

function getFiles(dirPath) {
  return fs.existsSync(dirPath) ? readdir(dirPath) : [];
}

async function s3Upload(folder, bucket) {
  const filesToUpload = await getFiles(path.resolve(__dirname, folder));
  return new Promise((resolve, reject) => {
    async.eachOfLimit(filesToUpload, 10, async.asyncify(async (file) => {
      const Key = file.replace(`${rootFolder}/${UPLOAD_FOLDER_NAME}/`, '');
      console.log(`uploading: [${Key}]`);
      return new Promise((res, rej) => {
        s3.upload({
          ACL: 'private',
          Key,
          Bucket: bucket,
          Body: fs.readFileSync(file),
          ContentType: mime.lookup(file) || "application/octet-stream"
        }, (err) => {
          if (err) {
            return rej(new Error(err));
          }
          res({ result: true });
        });
      });
    }), (err) => {
      if (err) {
        return reject(new Error(err));
      }
      resolve({ result: true });
    });
  });
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
      fs.writeFileSync(`${UPLOAD_FOLDER}/settings.js`, fileContent);
      console.log(`Successfully updated settings file in directory - ${UPLOAD_FOLDER}`);
      const bucket = findStackOutputValueByKey('WebUIBucket', outputs);
      return Promise.resolve(s3Upload(UPLOAD_FOLDER, bucket));
    } else {
      console.error(`Stack with name ${stackName} does not exist yet. Operation unsuccessful`);
      return Promise.reject(new Error('Invalid stack name'));
    }
  })