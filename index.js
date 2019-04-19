/*
  ###################################
  ##  USE REFERENCE:               ##
  ##  https://github.com/zeit/arg  ##
  ###################################
*/

const Command = require('./lib/command');
const { Option, OptionType } = require('./lib/option');

module.exports.command = (init) => new Command(init);
module.exports.Command = Command;
module.exports.Option = Option;
module.exports.OptionType = OptionType;
