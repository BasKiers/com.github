'use strict';
const request = require('request');

const client_id = Homey.env.client_id;
const client_secret = Homey.env.client_secret;
const state = Homey.env.state;

module.exports.init = () => {
  this.authWithToken();
};

module.exports.authWithToken = (token) => {
  return new Promise((resolve, reject) => {
    token = token || Homey.manager('settings').get('accessToken');

    if (token) {
      Homey.app.github.authenticate({
        type: 'oauth',
        token: token
      });
      Homey.app.github.user.get({}, (err, result) => {
        if (err) {
          this.removeAccessToken();
          reject(new Error('Token was not accepted by server'));
        } else {
          Homey.manager('settings').set('user', result);
          Homey.manager('settings').set('authorized', true);
          resolve(result);
        }
      })
    } else {
      this.removeAccessToken();
      reject(new Error('no token exists to authenticate with'));
    }

  });
};

module.exports.removeAccessToken = (callback) => {
  const settings = Homey.manager('settings');
  const token = settings.get('accessToken');

  if (token) {
    request.delete(
      `https://${client_id}:${client_secret}@api.github.com/applications/${client_id}/tokens/${token}`,
      {
        headers: {
          'user-agent': 'Homey-Github-App'
        }
      }
    );
  }
  settings.set('accessToken', null);
  settings.set('authorized', false);
  Homey.manager('api').realtime('authorized', false);
  Homey.app.createGithubApi();
  callback(null, true);
};

module.exports.fetchAuthorizationURL = (callback) => {
  Homey.manager('cloud').generateOAuth2Callback(
    `https://github.com/login/oauth/authorize?client_id=${client_id}&state=${state}&scope=repo,repo_hook,user`,

    // Before fetching authorization code
    (err, result) => {

      // Pass needed credentials to front-end
      callback(err, {url: result});
    },

    // After fetching authorization code
    (err, code) => {
      request.post(
        'https://github.com/login/oauth/access_token' +
        `?client_id=${client_id}&client_secret=${client_secret}&code=${code}&state=${state}`,
        {
          json: true,
          headers: {
            'user-agent': 'Homey-Github-App'
          }
        },
        (err, response, body) => {
          if (err) {
            Homey.log(err)
          } else {
            this.authWithToken(body.access_token).then(
              result => {
                if (result) {
                  Homey.manager('settings').set('accessToken', body.access_token);
                  Homey.manager('api').realtime('authorized', true);
                } else {
                  Homey.log(`Could not authenticate (${err.toString()})`);
                  Homey.manager('api').realtime('authorized', false);
                }
              }
            ).catch(
              err => {
                Homey.log(`Could not authenticate (${err.toString()})`);
                Homey.manager('api').realtime('authorized', false);
              }
            )
          }
        }
      );
    }
  );
};