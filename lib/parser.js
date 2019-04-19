const util = require('./util');
const argsert = util.argsert;
const _ = require('lodash');

function _parse(cmd, args, argv) {
    //parse <= current level options here
    args = args.slice(1);
    if(args.length > 0) {
        let subcmd = _.find(cmd._commands, c => _.includes(c._names, args[0]));
        if(subcmd) {
            _parse(subcmd, args, argv);
            return;
        }
    }
    let d = cmd._def;
    if(d) {
        if(d.demanded.length > 0) {
            _.each(d.demanded, p => {
                let n = p.cmd[0];
                if(p.variadic) {
                    argv[n] = args.slice(0);
                    _.each(p.cmd.slice(1), c => argv[c] = argv[n].slice(0))
                    args = [];
                } else {
                    argv[n] = args.shift();
                    _.each(p.cmd.slice(1), c => argv[c] = argv[n])
                }
            });
        }
        if(d.optional.length > 0) {
            _.each(d.optional, p => {
                let n = p.cmd[0];
                if(p.variadic) {
                    argv[n] = args.slice(0);
                    _.each(p.cmd.slice(1), c => argv[c] = argv[n].slice(0))
                    args = [];
                } else {
                    argv[n] = args.shift();
                    _.each(p.cmd.slice(1), c => argv[c] = argv[n])
                }
            });
        }
    }
    argv.__ = args;
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