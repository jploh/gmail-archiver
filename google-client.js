/*jshint esversion:6 */
const fs = require('fs-extra');
const google = require('googleapis');
const googleAuth = require('google-auth-library');
const readline = require('readline');

function googleClient (options) {
  this.clientSecret = options.credentials.installed.client_secret;
  this.clientId = options.credentials.installed.client_id;
  this.redirectUrl = options.credentials.installed.redirect_uris[0];
  this.scopes = options.scopes;
  this.tokenPath = options.tokenPath;

  var auth = new googleAuth();
  this.oauth2Client = new auth.OAuth2(this.clientId, this.clientSecret, this.redirectUrl);
}

googleClient.prototype.auth = function () {
  var that = this;
  // Check if we have previously stored a token.
  var promise = new Promise(function (resolve, reject) {
    fs.readFile(that.tokenPath, function(err, token) {
      if (err) {
        that.getNewToken(resolve, reject);
      } else {
        that.oauth2Client.credentials = JSON.parse(token);
        resolve(true);
      }
    });
  });
  return promise;
};

googleClient.prototype.getNewToken = function (resolve, reject) {
  var that = this;
  var authUrl = that.oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: that.scopes
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    that.oauth2Client.getToken(code, function(err, token) {
      if (err) {
        //console.log('Error while trying to retrieve access token', err);
        return reject(new Exception(err));
      }
      that.oauth2Client.credentials = token;
      that.storeToken(token, resolve, reject);
    });
  });
};

googleClient.prototype.storeToken = function (token, resolve, reject) {
  var that = this;
  try {
    fs.outputFileSync(that.tokenPath, JSON.stringify(token));
    resolve(true);
  } catch (err) {
    return reject(err.message);
  }
};



module.exports = googleClient;
