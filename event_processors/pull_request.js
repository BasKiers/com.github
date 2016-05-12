'use strict';

const actionTypes = ['pr_opened', 'pr_edited', 'pr_merged', 'pr_closed', 'pr_commented'];

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

function getPullRequestTokenObject(args) {
  const pr = args.body.pull_request;

  return {
    pr_from_name: pr.head.repo.name,
    pr_from_branch: pr.base.ref,
    pr_from_owner: pr.head.repo.owner.login,
    pr_to_branch: pr.head.ref,
    pr_title: pr.title,
    pr_body: pr.body,
    pr_state: pr.state,
    user_name: pr.head.user.login
  }
}

function getPullRequestCommentTokenObject(args) {
  const pr = args.body.pull_request;
  const comment = args.body.comment;

  return {
    pr_title: pr.title,
    pr_body: pr.body,
    pr_state: pr.state,
    comment_body: comment.body,
    comment_user_name: comment.user.login,
    pr_from_name: pr.head.repo.name,
    pr_from_branch: pr.base.ref,
    pr_from_owner: pr.head.repo.owner.login,
    pr_to_branch: pr.head.ref
  }
}

module.exports.onWebhookMessage = (args) => {
  if (args.body.action === 'opened' || args.body.action === 'reopened') {
    Homey.manager('flow').trigger('pr_opened', getPullRequestTokenObject(args), args);
  } else if (args.body.action === 'edited') {
    Homey.manager('flow').trigger('pr_edited', getPullRequestTokenObject(args), args);
  } else if (args.body.action === 'closed') {
    if (args.body.pull_request.merged) {
      Homey.manager('flow').trigger('pr_merged', getPullRequestTokenObject(args), args);
    } else {
      Homey.manager('flow').trigger('pr_closed', getPullRequestTokenObject(args), args);
    }
  } else if (args.body.action === 'created') {
    Homey.manager('flow').trigger('pr_commented', getPullRequestCommentTokenObject(args), args);
  }
};

module.exports.events = ['pull_request', 'pull_request_review_comment'];