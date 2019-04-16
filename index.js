/*
  ###################################
  ##  USE REFERENCE:               ##
  ##  https://github.com/zeit/arg  ##
  ###################################
*/

const Command = require('./lib/command');

module.exports = (init) => new Command(init);
module.exports.Command = Command;