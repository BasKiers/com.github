'use strict';

const fs = require('fs');
const path = require('path');

const eventDir = path.join(__dirname, 'condition_processors');
const conditionProcessors = {};

// Load event processors and put them in the "event_type" => processor map
fs.readdirSync(eventDir).forEach(eventParser => {
  conditionProcessors[eventParser.replace('.js', '')] = require(path.join(eventDir, eventParser));
});

module.exports.init = () => {
  Object.keys(conditionProcessors).forEach(
    processorKey => conditionProcessors[processorKey].init && conditionProcessors[processorKey].init()
  );
};
