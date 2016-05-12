'use strict';

module.exports.init = () => {
  Homey.manager('flow').on('trigger.fork.repo_name.autocomplete', Homey.app.getRepoAutocompleteList);
  Homey.manager('flow').on('trigger.fork', checkRepo);
};

function checkRepo(callback, args, state) {
  callback(null, args.repo_name.id === state.body.repository.id);
}

function getRepoForkedTokenObject(args) {
  return {
    user_name: args.body.sender.login
  }
}

module.exports.onWebhookMessage = (args) => {
  Homey.manager('flow').trigger('fork', getRepoForkedTokenObject(args), args);
};

module.exports.events = ['fork'];