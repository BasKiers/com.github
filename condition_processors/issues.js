'use strict';

const conditionTypes = ['issue_open', 'issue_closed'];

module.exports.init = () => {
  conditionTypes.forEach(
    type => {
      Homey.manager('flow').on(`condition.${type}.repo_name.autocomplete`, Homey.app.getRepoAutocompleteList);
      Homey.manager('flow').on(`condition.${type}`, checkIssueCount.bind({type}));
    }
  );
};

function checkIssueCount(callback, args) {
  Homey.app.github.issues.repoIssues(
    {
      user: args.repo_name.user,
      repo: args.repo_name.name,
      state: this.type.substring(6)
    },
    (err, result) => {
      if (err) {
        callback(__('error.condition.issue_count'));
      } else {
        callback(null, result.filter(issue => !issue.pull_request).length > args.amount)
      }
    }
  );
}