'use strict';

const GitHubApi = require('github');
let github;
createGithubApi();

// Include authentication methods
const auth = module.exports.auth = require('./auth');

// Include webhook methods
const webhook = module.exports.webhook = require('./webhook');

// Include conditions
const condition = module.exports.condition = require('./condition');

// Init application
function init() {
  auth.init();
  webhook.init();
  condition.init();
}

// Generate new api object (also used to deAuthorization)
function createGithubApi() {
  github = module.exports.github = new GitHubApi({
    version: '3.0.0',
    // debug: true,
    protocol: 'https',
    host: 'api.github.com',
    pathPrefix: '',
    timeout: 5000,
    headers: {
      'user-agent': 'Homey-Github-App' // GitHub is happy with a unique user agent
    }
  });
}

// Get repo's from user and cache the api request result for future requests
let userRepoCache;
function getUserRepos() {
  return new Promise((resolve, reject) => {
    if (userRepoCache) {
      resolve(userRepoCache);
    } else {
      if (!Homey.manager('settings').get('authorized')) {
        reject(new Error('Not able to get userRepos because no user is authorized through the settings'));
      } else {
        Homey.app.github.repos.getAll({}, (err, result) => {
          if (err) {
            reject(err);
          } else {
            userRepoCache = result;
            setTimeout(() => userRepoCache = null, 10000);
            resolve(userRepoCache);
          }
        });
      }
    }
  });
}

// Get generic autocomplete list of all user repo's
function getRepoAutocompleteList(callback, args) {
  getUserRepos().then(repoList => {
    args.query = args.query.toLowerCase();
    repoList = repoList.filter(repo => repo.full_name.toLowerCase().indexOf(args.query) !== -1);

    callback(null, repoList.map(repo => {
      return {
        image: repo.owner.avatar_url,
        name: repo.name,
        description: repo.description,
        user: repo.owner.login,
        id: repo.id
      }
    }))
  }).catch(err => {
    callback(__('flow.please_login'), null);
  });
}

Object.assign(
  module.exports,
  {
    init,
    getUserRepos,
    getRepoAutocompleteList,
    createGithubApi
  }
);