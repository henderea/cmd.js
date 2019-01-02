const util = require('./util');
const argsert = util.argsert;
const _ = require('lodash');

function _parse(cmd, args, argv) {
    //parse <= current level options here
    if(args.length > 1) {
        let subcmd = _.find(cmd._commands, c => _.includes(c._names, args[1]));
        if(subcmd) {
            _parse(subcmd, args.slice(1), argv);
            return;
        }
    }
    cmd.emit('command', argv);
}

function parse(cmd, args = process.argv) {
    let rootCmd = cmd._rootCommand;
    args = util.processArgv(args);
    rootCmd._args = args;
    const argv = { __: args };
    _parse(cmd, args, argv);
    return argv;
}

module.exports = parse;