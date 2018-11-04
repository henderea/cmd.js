const path = require('path');
const EventEmitter = require('events').EventEmitter;
const requireDirectory = require('require-directory');
const getCallerFile = require('get-caller-file');
const util = require('./lib/util');
const argsert = util.argsert;
const _ = require('lodash');

class Command extends EventEmitter {
    static getClassName() {
        return 'Command';
    }
    getClassName() {
        return Command.getClassName();
    }
    constructor(init) {
        argsert('[function]', [init], arguments.length);
        super();
        this._commands = [];
        this._options = [];
        this._args = [];
        this._latestCommand = this;
        this._name = '';
        this._parent = null;
        this._files = [];
        this._init(init);
    }

    _init(init) {
        argsert('[function]', [init], arguments.length);
        if(init && typeof init === 'function') {
            this._initMode = true;
            init(this);
            this._initMode = false;
        }
        return this;
    }

    name(name) {
        argsert('<string>', [name], arguments.length);
        this._name = name;
        return this;
    }

    usage(usage) {
        argsert('<string>', [usage], arguments.length);
        this._usage = usage;
        return this;
    }

    command(init) {
        argsert('<function|Command|string>', [init], arguments.length);
        let cmd = null;
        if(typeof init === 'function') {
            cmd = new Command();
            cmd._parent = this;
            cmd._init(init);
        } else if(init instanceof Command) {
            cmd = init;
            cmd._parent = this;
        } else if(typeof init === 'string') {
            cmd = require(path.resolve(path.dirname(getCallerFile()), init));
        }
        if(cmd) {
            this._commands.push(cmd);
            return cmd;
        }
    }

    commandDir(dirName) {
        argsert('<string>', [dirName], arguments.length);
        let rv = requireDirectory({ require, filename: getCallerFile() }, dirName, { extensions: ['js'], recurse: false });
        _.each(_.values(rv), v => {
            if(v instanceof Command) {
                this.command(v);
            }
        });
    }

    parse(argv = process.argv) {
        console.log(argv);
    }
}

module.exports = (init) => new Command(init);
module.exports.Command = Command;