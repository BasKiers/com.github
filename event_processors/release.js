'use strict';

module.exports.init = () => {
  Homey.manager('flow').on('trigger.release.repo_name.autocomplete', Homey.app.getRepoAutocompleteList);
  Homey.manager('flow').on('trigger.release', checkRepo);
};

function checkRepo(callback, args, state) {
  callback(null, args.repo_name.id === state.body.repository.id);
}

function getReleaseTokenObject(args) {
  const release = args.body.release;

  return {
    release_tag: release.tag_name,
    release_name: release.name,
    release_body: release.body,
    prerelease: release.prerelease,
    user_name: release.author.login
  }
}

module.exports.onWebhookMessage = (args) => {
  Homey.manager('flow').trigger('release', getReleaseTokenObject(args), args);
};

module.exports.events = ['release'];