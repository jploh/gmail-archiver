/*jshint esversion:6 */
const _ = require('lodash');
const commandLineArgs = require('command-line-args');
const fs = require('fs-extra');
const gmailArchiver = require('./gmail-archiver');

const optionDefinitions = [
  { name: 'label', type: String, multiple: true }
];
const args = commandLineArgs(optionDefinitions);

if (typeof args.label == 'undefined' || args.label.length == 0) {
  console.log('No label to archive. Try running with --label Read "Sent Items"');
  process.exit(1);
}

try {
  var googleCredentials = JSON.parse(fs.readFileSync('./.config/google-auth/client_id.json'));
} catch (err) {
  console.log(err.message);
  process.exit();
}

var archiver = new gmailArchiver({
  labels: args.label,
  google: {
    credentials: googleCredentials,
    scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
    // TODO: Make the path below configurable
    tokenPath: './.config/google-auth/gmail-archiver.json'
  }
}).start();

/*
function getLabelThreads (auth) {
  var gmail = google.gmail('v1');
  _.forEach(foundLabels, function (label) {
    gmail.users.threads.list({
      auth: auth,
      'userId': 'me',
      'labelIds': label.id
    }, function (err, response) {
      if (err) {
        console.log('The API returned an error: ' + err);
        return;
      }
      console.log(response.threads);
    });
  });
}
*/
