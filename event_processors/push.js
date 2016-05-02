'use strict';

module.exports.init = () => {
  Homey.manager('flow').on('trigger.push.repo_name.autocomplete', Homey.app.getRepoAutocompleteList);
  Homey.manager('flow').on('trigger.push', checkRepo);
};

function checkRepo(callback, args, state) {
  callback(null, args.repo_name.id === state.body.repository.id);
}

function getPushTokenObject(args) {
  const repository = args.body.repository;

  return {
    branch: args.body.ref.substring(11), //remove refs/heads/ prefix
    repo_name: repository.name,
    user_name: args.body.sender.login,
    commits: args.body.commits.length
  }
}

module.exports.onWebhookMessage = (args) => {
  Homey.manager('flow').trigger('push', getPushTokenObject(args), args);
};

module.exports.events = ['push'];