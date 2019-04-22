var expect = require('expect.js');
const CmdError = require('../lib/error');
const { command, Command, Option, OptionType } = require('..');

describe('Command', function() {
    describe('command()', function() {
        it('should return an instance of class Command', function() {
            expect(command()).to.be.a(Command);
        });
    });
    describe('validation', function() {
        describe('#action', function() {
            it('should validate the action method', function() {
                expect(() => command().action()).to.throwException(function(e) {
                    expect(e).to.be.a(CmdError);
                    expect(e.message).to.eql('Not enough arguments provided. Expected 1 but received 0.');
                });
                expect(() => command().action('')).to.throwException(function(e) {
                    expect(e).to.be.a(CmdError);
                    expect(e.message).to.eql('Invalid action argument. Expected function but received string.');
                });
            });
        });
    });
    describe('#parse', function() {
        describe('#action', function() {
            describe('argv', function() {
                it('should set the argv properly', function() {
                    let result = null;
                    let argv = ['script', 'test', 'test2'];
                    command().action(argv => result = argv).parse(argv);
                    expect(result).to.eql({ __: argv.slice(1) });
                });
            });
            describe('#fullName', function() {
                it('should use the parsed argv', function() {
                    let argv = ['script', 'test', 'test2'];
                    let cmd = command();
                    cmd.parse(argv);
                    expect(cmd.fullName).to.eql('script');
                });
            });
            describe('#usage', function() {
                it('should use the command name in place of $0', function() {
                    let argv = ['script', 'test', 'test2'];
                    let cmd = command().usage('Usage: $0 <param> [param2...]');
                    cmd.parse(argv);
                    expect(cmd.usageText).to.eql('Usage: script <param> [param2...]');
                });
                it('should prefix the command name iin the absence of $0', function() {
                    let argv = ['script', 'test', 'test2'];
                    let cmd = command().usage('<param> [param2...]');
                    cmd.parse(argv);
                    expect(cmd.usageText).to.eql('script <param> [param2...]');
                });
            });
            describe('#command', function() {
                it('should take out the global parts of argv for sub-commands', function() {
                    let result = null;
                    let argv = ['script', 'command', 'test', 'test2'];
                    command(cmd => cmd.command(command().def('command').action(argv => result = argv))).parse(argv);
                    expect(result).to.eql({ __: argv.slice(2) });
                });
                it('should support positional arguments', function() {
                    let argv = ['command', '1', '2', '3'];
                    let result = command().def('$0 <arg1> <arg2> <arg3>').parse(argv);
                    expect(result).to.eql({ __: [], arg1: 1, arg2: 2, arg3: 3 });
                });
                it('should support positional arguments with multiple names', function() {
                    let argv = ['command', '1', '2', '3'];
                    let result = command().def('$0 <arg1|argA> <arg2> <arg3>').parse(argv);
                    expect(result).to.eql({ __: [], arg1: 1, argA: 1, arg2: 2, arg3: 3 });
                });
                it('should support positional arguments with varargs', function() {
                    let argv = ['command', '1', '2', '3'];
                    let result = command().def('$0 <arg1> <args...>').parse(argv);
                    expect(result).to.eql({ __: [], arg1: 1, args: [2, 3] });
                });
                it('should support positional arguments with varargs that are not provided', function() {
                    let argv = ['command', '1'];
                    let result = command().def('$0 <arg1> <args...>').parse(argv);
                    expect(result).to.eql({ __: [], arg1: 1, args: [] });
                });
                it('should support provided optional arguments', function() {
                    let argv = ['command', '1', '2', '3'];
                    let result = command().def('$0 <arg1> <arg2> [arg3]').parse(argv);
                    expect(result).to.eql({ __: [], arg1: 1, arg2: 2, arg3: 3 });
                });
                it('should support missing optional arguments', function() {
                    let argv = ['command', '1', '2'];
                    let result = command().def('$0 <arg1> <arg2> [arg3]').parse(argv);
                    expect(result).to.eql({ __: [], arg1: 1, arg2: 2, arg3: undefined });
                });
                describe('#fullName', function() {
                    it('should show the full name of direct sub-commands', function() {
                        let argv = ['script', 'test', 'test2'];
                        let subCommand = command().def('command');
                        command(cmd => cmd.command(subCommand)).parse(argv);
                        expect(subCommand.fullName).to.eql('script command');
                    });
                    it('should show the full name of second-level sub-commands', function() {
                        let argv = ['script', 'test', 'test2'];
                        let subSubCommand = command().def('command2');
                        command(cmd => cmd.command(c => c.def('command').command(subSubCommand))).parse(argv);
                        expect(subSubCommand.fullName).to.eql('script command command2');
                    });
                });
                describe('#usage', function() {
                    it('should use the full name of direct sub-commands in place of $0', function() {
                        let argv = ['script', 'test', 'test2'];
                        let subCommand = command().def('command').usage('Usage: $0 <param> [param2...]');
                        command(cmd => cmd.command(subCommand)).parse(argv);
                        expect(subCommand.usageText).to.eql('Usage: script command <param> [param2...]');
                    });
                    it('should prefix the full name of direct sub-commands in the absence of $0', function() {
                        let argv = ['script', 'test', 'test2'];
                        let subCommand = command().def('command').usage('<param> [param2...]');
                        command(cmd => cmd.command(subCommand)).parse(argv);
                        expect(subCommand.usageText).to.eql('script command <param> [param2...]');
                    });
                    it('should use the full name of second-level sub-commands in place of $0', function() {
                        let argv = ['script', 'test', 'test2'];
                        let subSubCommand = command().def('command2').usage('Usage: $0 <param> [param2...]');
                        command(cmd => cmd.command(c => c.def('command').command(subSubCommand))).parse(argv);
                        expect(subSubCommand.usageText).to.eql('Usage: script command command2 <param> [param2...]');
                    });
                    it('should prefix the full name of second-level sub-commands in the absence of $0', function() {
                        let argv = ['script', 'test', 'test2'];
                        let subSubCommand = command().def('command2').usage('<param> [param2...]');
                        command(cmd => cmd.command(c => c.def('command').command(subSubCommand))).parse(argv);
                        expect(subSubCommand.usageText).to.eql('script command command2 <param> [param2...]');
                    });
                });
            });
        });
    });
});

describe('OptionType', function() {
    it('should have a static property with the possible values', function() {
        expect(OptionType.enumValues).to.be.an(Array);
    });
    it('the static property with the possible values should contain OptionType instances', function() {
        expect(OptionType.enumValues[0]).to.be.an(OptionType);
    });
    it('should have an enum value for boolean', function() {
        expect(OptionType.boolean).to.be.an(OptionType);
    });
    it('should allow getting the enum value from a string', function() {
        expect(OptionType.enumValueOf('boolean')).to.equal(OptionType.boolean);
    });
});

describe('Option', function() {
    describe('validation', function() {
        describe('#type', function() {
            it('should allow valid type parameters', function() {
                let opt = new Option().type('boolean');
                expect(opt._type).to.eql(OptionType.boolean);
            });
            it('should throw on invalid type parameters', function() {
                expect(new Option().type).withArgs('fake').to.throwException(function(e) {
                    expect(e).to.be.a(CmdError);
                    expect(e.message).to.eql(`Invalid type argument. Expected argument to be in ('boolean'), but encountered 'fake'.`);
                });
                expect(new Option().type).withArgs(0).to.throwException(function(e) {
                    expect(e).to.be.a(CmdError);
                    expect(e.message).to.eql(`Invalid type argument. Expected OptionType or string but received number.`);
                });
            });
            it('should throw on missing type parameters', function() {
                expect(new Option().type).withArgs().to.throwException(function(e) {
                    expect(e).to.be.a(CmdError);
                    expect(e.message).to.eql(`Not enough arguments provided. Expected 1 but received 0.`);
                });
            });
        });
        describe('#names', function() {
            it('should allow valid names parameters', function() {
                let opt = new Option().names('hi', 'bye');
                expect(opt._names).to.eql(['hi', 'bye']);
            });
            it('should throw on invalid names parameters', function() {
                expect(new Option().names).withArgs(0).to.throwException(function(e) {
                    expect(e).to.be.a(CmdError);
                    expect(e.message).to.eql(`Invalid names argument. Expected string but received number.`);
                });
            });
            it('should throw on missing names parameters', function() {
                expect(new Option().names).withArgs().to.throwException(function(e) {
                    expect(e).to.be.a(CmdError);
                    expect(e.message).to.eql(`Not enough arguments provided. Expected 1 but received 0.`);
                });
            });
        });
        describe('#nargs', function() {
            it('should allow valid nargs parameters', function() {
                let opt = new Option().nargs(1);
                expect(opt._nargs).to.eql(1);
            });
            it('should throw on invalid nargs parameters', function() {
                expect(new Option().nargs).withArgs('').to.throwException(function(e) {
                    expect(e).to.be.a(CmdError);
                    expect(e.message).to.eql(`Invalid nargs argument. Expected number but received string.`);
                });
                expect(new Option().nargs).withArgs(-1).to.throwException(function(e) {
                    expect(e).to.be.a(CmdError);
                    expect(e.message).to.eql(`Invalid nargs argument. Expected argument to be >= 0, but encountered -1.`);
                });
            });
            it('should throw on missing nargs parameters', function() {
                expect(() => new Option().nargs()).to.throwException(function(e) {
                    expect(e).to.be.a(CmdError);
                    expect(e.message).to.eql(`Not enough arguments provided. Expected 1 but received 0.`);
                });
            });
        });
    });
});
