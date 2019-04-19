const { Enum } = require('enumify');
const util = require('./util');
const CmdError = require('./error');
const argsert = util.argsert;
const _ = require('lodash');

class OptionType extends Enum {
    static getClassName() {
        return 'OptionType';
    }
    getClassName() {
        return OptionType.getClassName();
    }
}

OptionType.initEnum(['boolean']);

class Option {
    static getClassName() {
        return 'Option';
    }
    getClassName() {
        return Option.getClassName();
    }

    constructor(init) {
        argsert('[function]', [init], ['init'], arguments.length);
        this._type = null;
        this._names = [];
        this._nargs = 0;
        this._description = '';
    }

    get __def() { return this._def; }

    _init(init) {
        argsert('[function]', [init], ['init'], arguments.length);
        if(init && typeof init === 'function') {
            this._initMode = true;
            init(this);
            this._initMode = false;
        }
        return this;
    }

    type(type) {
        argsert('<OptionType|string>', [type], ['type'], arguments.length);
        if(_.isString(type)) {
            let origType = type;
            type = OptionType.enumValueOf(type);
            if(!type) {
                throw new CmdError(`Invalid type argument. Expected argument to be in ('${_.join(_.map(OptionType.enumValues, v => v.name), "', '")}'), but encountered '${origType}'.`)
            }
        }
        this._type = type;
        return this;
    }

    names(...names) {
        argsert('<string...>', [...names], ['names'], arguments.length);
        this._names = names;
        return this;
    }

    nargs(nargs) {
        argsert('<number>', [nargs], ['nargs'], arguments.length);
        if(nargs < 0) {
            throw new CmdError(`Invalid nargs argument. Expected argument to be >= 0, but encountered ${nargs}.`);
        }
        this._nargs = nargs;
        return this;
    }
}

module.exports = { Option, OptionType };
