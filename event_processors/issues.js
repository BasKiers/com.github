'use strict';

const actionTypes = ['issue_opened', 'issue_closed', 'issue_commented'];

module.exports.init = () => {
  actionTypes.forEach(
    type => {
      Homey.manager('flow').on(`trigger.${type}.repo_name.autocomplete`, Homey.app.getRepoAutocompleteList);
      Homey.manager('flow').on(`trigger.${type}`, checkRepo);
    }
  );
};

function checkRepo(callback, args, state) {
  callback(null, args.repo_name.id === state.body.repository.id);
}

function getIssueTokenObject(args) {
  const repository = args.body.repository;
  const issue = args.body.issue;

  return {
    issue_title: issue.title,
    issue_body: issue.body,
    user_name: args.body.sender.login,
    repo_name: repository.name
  }
}

function getIssueCommentTokenObject(args) {
  const repository = args.body.repository;
  const issue = args.body.issue;
  const comment = args.body.comment;

  return {
    issue_title: issue.title,
    issue_state: issue.state,
    comment_body: comment.body,
    user_name: comment.user.login,
    repo_name: repository.name
  }
}

module.exports.onWebhookMessage = (args) => {
  if (args.body.action === 'opened' || args.body.action === 'reopened') {
    Homey.manager('flow').trigger('issue_opened', getIssueTokenObject(args), args);
  } else if (args.body.action === 'closed') {
    Homey.manager('flow').trigger('issue_closed', getIssueTokenObject(args), args);
  } else if (args.body.action === 'created') { //created is only for issue_comment events.
    Homey.manager('flow').trigger('issue_commented', getIssueCommentTokenObject(args), args);
  }
};

module.exports.events = ['issues', 'issue_comment'];