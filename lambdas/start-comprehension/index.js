var https = require('https');
let AWS = require('aws-sdk');
var comprehend = new AWS.Comprehend({apiVersion: '2017-11-27'});
exports.handler = function(event, context, callback) {
    var request_url = event.TranscriptFileUri;
    console.log(request_url);
    console.log(JSON.stringify(event));
    console.log(JSON.stringify(context));
    https.get(request_url, (res) => {
      var chunks = [];
	  res.on("data", function (chunk) {
        chunks.push(chunk);
      });
      res.on("end", function () {
        var body = Buffer.concat(chunks);
        var results = JSON.parse(body);
        console.log( body.toString());
        var transcript = results.results.transcripts[0].transcript;
        console.log(transcript)
        var params = {
          LanguageCode: "en",
          Text: transcript + ""
        };
        comprehend.detectSentiment(params, function(err, data) {
          if (err) console.log(err, err.stack); // an error occurred
          else     console.log(data);           // successful response
          callback(null, data);
        });
        callback(null, transcript);      });

	}).on('error', (e) => {
	  console.error(e);
	});
};