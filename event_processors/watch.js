'use strict';

module.exports.init = () => {
  Homey.manager('flow').on('trigger.watch.repo_name.autocomplete', Homey.app.getRepoAutocompleteList);
  Homey.manager('flow').on('trigger.watch', checkRepo);
};

function checkRepo(callback, args, state) {
  callback(null, args.repo_name.id === state.body.repository.id);
}

function getStatusTokenObject(args) {
  const repository = args.body.repository;

  return {
    user_name: args.body.sender.login,
    repo_name: repository.name
  }
}

module.exports.onWebhookMessage = (args) => {
  Homey.manager('flow').trigger('watch', getStatusTokenObject(args), args);
};

module.exports.events = ['watch'];