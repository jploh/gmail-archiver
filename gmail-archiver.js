/*jshint esversion:6 */
const _ = require('lodash');
const fs = require('fs-extra');
const google = require('googleapis');
const googleClient = require('./google-client.js');

/* High Level Archiving Process
 *   1. Auth
 *   2. Resolve labels
 *   3. Process labels
 *     3.1. Get threads of a label
 *     3.2. Process first 10 threads
 *        3.2.1. Create directory
 *        3.2.2. Get messages
 *        3.2.3. Add done label
 *     3.3. Process next 10 threads until done
 * Note: https://developers.google.com/gmail/api/v1/reference/quota#per-method_quota_usage
 * 1 billion quota units per day
 * labels.list = 1
 * threads.list = 10
 * threads.get = 10
 */

function gmailArchiver (options) {
  this.labels = options.labels;
  this.google = new googleClient(options.google);
  this.foundLabels = [];
  this.started = false;
}

gmailArchiver.prototype.resolveLabels = function (success) {
  var that = this;
  var promise = new Promise(function (resolve, reject) {
    var gmail = google.gmail('v1');
    gmail.users.labels.list({
      auth: that.google.oauth2Client,
      userId: 'me'
    }, function (err, response) {
      if (err) {
        //console.log('The API returned an error: ' + err);
        return reject(err);
      }
      var labels = response.labels;
      if (labels.length == 0) {
        console.log('No labels found.');
      } else {
        for (var i = 0; i < labels.length; i++) {
          var label = labels[i];
          if (_.includes(that.labels, label.name.toLowerCase())) {
            that.foundLabels.push(label);
          }
        }
      }
      resolve(true);
    });
  });
  return promise;
};

gmailArchiver.prototype.dispatchLabelWorkers = function () {
  var that = this;
  var promise = new Promise(function (resolve, reject) {
    console.log(that.foundLabels);
    resolve(true);
  });
  return promise;
};

gmailArchiver.prototype.start = function () {
  this.started = true;
  try {
    this.google.auth()
      .then(this.resolveLabels.bind(this))
      .then(this.dispatchLabelWorkers.bind(this))
      .catch(function (err) {
        throw err;
      });
  } catch (err) {
    console.log(err);
    process.exit();
  }
};

module.exports = gmailArchiver;
