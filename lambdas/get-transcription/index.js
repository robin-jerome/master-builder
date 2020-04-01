var AWS = require('aws-sdk');
var transcribeservice = new AWS.TranscribeService();

exports.handler = (event, context, callback) => {

    var params = {
      TranscriptionJobName: event.JOB_NAME /* required */
    };
    transcribeservice.getTranscriptionJob(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
      event.STATUS = data.TranscriptionJob.TranscriptionJobStatus;
      event.TranscriptFileUri =data.TranscriptionJob.Transcript.TranscriptFileUri;
      callback(null,event);
    });
};
