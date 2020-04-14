var zlib = require('zlib'),
  fs = require('fs'),
  AWS = require('aws-sdk'),
  tar = require('tar'),
  zlib = require('zlib');

exports.handler = async (event) => {
  var s3 = new AWS.S3({ apiVersion: '2006-03-01' });
  var params = { Bucket: 'octank-comprehend-output-bucket', Key: '197234178237-NER-ad08db22cd45712bae2929c76e2156e4/output/output.tar.gz' };
  const s3Stream = s3.getObject(params).createReadStream()
    .on('error', function(err) {
      reject('Unable to open tarball ' + err)
    })
    .pipe(zlib.createUnzip())
    .on('error', function(err) {
      reject('Error during unzip for ' + err)
    })
    .pipe(tar.Extract(extractOpts))
    .on('error', function(err) {
      reject('Error during untar for ' + err)
    })
    .on('end', function(result) {
      resolve(result)
    })

  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
  return response;
};

const unpackTgz = (packageTgz, unpackTarget) => {
  const extractOpts = { type: 'Directory', path: unpackTarget, strip: 1 }

  return new Promise((resolve, reject) => {
    fs.createReadStream(packageTgz)
      .on('error', function(err) {
        reject('Unable to open tarball ' + packageTgz + ': ' + err)
      })
      .pipe(zlib.createUnzip())
      .on('error', function(err) {
        reject('Error during unzip for ' + packageTgz + ': ' + err)
      })
      .pipe(tar.Extract(extractOpts))
      .on('error', function(err) {
        reject('Error during untar for ' + packageTgz + ': ' + err)
      })
      .on('end', function(result) {
        resolve(result)
      })
  })
}