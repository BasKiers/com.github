'use strict';

const conditionTypes = ['pr_open', 'pr_closed'];

module.exports.init = () => {
  conditionTypes.forEach(
    type => {
      Homey.manager('flow').on(`condition.${type}.repo_name.autocomplete`, Homey.app.getRepoAutocompleteList);
      Homey.manager('flow').on(`condition.${type}`, checkPullRequestCount.bind({type}));
    }
  );
};

function checkPullRequestCount(callback, args) {
  Homey.app.github.pullRequests.getAll(
    {
      user: args.repo_name.user,
      repo: args.repo_name.name,
      state: this.type.substring(3)
    },
    (err, result) => {
      if (err) {
        callback(__('error.condition.pr_count'));
      } else {
        callback(null, result.length > args.amount)
      }
    }
  );
}