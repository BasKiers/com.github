'use strict';

module.exports.init = () => {
  Homey.manager('flow').on('trigger.repo_forked.repo_name.autocomplete', Homey.app.getRepoAutocompleteList);
  Homey.manager('flow').on('trigger.repo_forked', checkRepo);
};

function checkRepo(callback, args, state) {
  callback(null, args.repo_name.id === state.body.repository.id);
}

function getRepoForkedTokenObject(args) {
  let repository = args.body.repository;
  let forkee = args.body.forkee;

  return {
    repo_name: repository.name,
    user_name: forkee.name
  }
}

module.exports.onWebhookMessage = (args) => {
  Homey.manager('flow').trigger('repo_forked', getRepoForkedTokenObject(args), args);
};

module.exports.events = ['fork'];