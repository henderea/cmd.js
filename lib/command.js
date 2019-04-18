const path = require('path');
const EventEmitter = require('events').EventEmitter;
const requireDirectory = require('require-directory');
const getCallerFile = require('get-caller-file');
const util = require('./util');
const parse = require('./parser');
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
        this._args = util.processArgv(process.argv);
        this._latestCommand = this;
        this._names = ['$0'];
        this._def = null;
        this._parent = null;
        this._files = [];
        this._description = '';
        this._init(init);
    }

    get __def() { return this._def; }

    get _subCommands() {
        return this._commands;
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

    def(...defs) {
        argsert('<string...>', [defs], arguments.length);
        if(!_.isArray(defs)) {
            defs = [defs];
        }
        let d = _.map(defs, util.parseCommand);
        this._def = d[0];
        this._names = _.map(d, d => d.cmd);
        return this;
    }

    desc(desc) {
        argsert('<string>', [desc], arguments.length);
        this._description = desc;
        return this;
    }

    get _fullName() {
        return _.concat([], this._parent ? this._parent._fullName : [], [this._names.map(v => v == '$0' ? util.getExec(this._args, true) : v)]);
    }

    get _rootCommand() {
        return this._parent ? this._parent._rootCommand : this;
    }

    get fullName() {
        return this._fullName.map(v => v.join(',')).join(' ');
    }

    get usageText() {
        if(this._usage) {
            if(this._usage.indexOf('$0') >= 0) {
                return this._usage.replace(/\$0/g, this.fullName);
            }
            return `${this.fullName} ${this._usage}`;
        }
        return this.fullName;
    }

    action(action) {
        this.on('command', action);
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
            cmd._parent = this;
        }
        if(cmd) {
            this._commands.push(cmd);
            this._latestCommand = cmd;
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

    parse(args = process.argv) {
        return parse(this, args);
    }

    get argv() {
        return this.parse();
    }
}

module.exports = Command;