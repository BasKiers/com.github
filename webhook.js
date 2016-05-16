'use strict';

const fs = require('fs');
const path = require('path');

const eventDir = path.join(__dirname, 'event_processors');
const eventProcessors = {};

// Load event processors and put them in the "event_type" => processor map
fs.readdirSync(eventDir).forEach(eventParser => {
  const processor = require(path.join(eventDir, eventParser));
  processor.events.forEach((eventName) => eventProcessors[eventName] = processor);
});

// Register with the athom webhook service with a randomly generated unique ID
module.exports.init = () => {
  let webhookId = Homey.manager('settings').get('webhook_id');
  if (!webhookId) {
    webhookId = require('crypto').randomBytes(36).toString('base64').replace(/\/&=/g, '');
    Homey.manager('settings').set('webhook_id', webhookId);
    Homey.manager('settings').set(
      'webhook_url',
      `https://webhooks.athom.com/webhook/${Homey.env.ROUTER_WEBHOOK_ID}?webhook_id=${webhookId}`
    );
  }

  Homey.manager('cloud').registerWebhook(
    Homey.env.ROUTER_WEBHOOK_ID,
    Homey.env.ROUTER_WEBHOOK_SECRET,
    {webhook_id: webhookId},
    onWebhookMessage,
    (err, result) => {
      if (err || !result) return Homey.error('Registering webhook failed');
      Homey.log('Registering webhook success');
    }
  );

  // If the event processors need initialization, init them.
  Object.keys(eventProcessors).forEach(
    processorKey => eventProcessors[processorKey].init && eventProcessors[processorKey].init()
  );
};

function onWebhookMessage(args) {
  // exception
  if(args.headers && args.headers['x-github-event'] === 'issue_comment' && args.body.issue.pull_request){
    args.headers['x-github-event'] = 'pull_request_issue_comment'
  }
  if (args.headers && eventProcessors[args.headers['x-github-event']]) {
    eventProcessors[args.headers['x-github-event']].onWebhookMessage(args);
  }
}
