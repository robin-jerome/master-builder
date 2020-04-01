const AWS = require('aws-sdk');
const transcribeservice = new AWS.TranscribeService();

exports.handler = (event, context, callback) => {
    var parts = event.JOB_NAME.split("/");
    var params = {
      LanguageCode: 'en-US',
      Media: { /* required */
        MediaFileUri: event.s3URL + ""
      },
      MediaFormat: 'wav',
      TranscriptionJobName: parts[parts.length - 1]
    };
    transcribeservice.startTranscriptionJob(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     {
      console.log(data);           // successful response
      event.wait_time = 10;
      event.JOB_NAME = data.TranscriptionJob.TranscriptionJobName;
      callback(null, event);
      }
    });

};