const path = require('path');
const EventEmitter = require('events').EventEmitter;
const requireDirectory = require('require-directory');
const getCallerFile = require('get-caller-file');
const util = require('./lib/util');
const argsert = util.argsert;
const _ = require('lodash');
const Command = require('./lib/command');

module.exports = (init) => new Command(init);
module.exports.Command = Command;