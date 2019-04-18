var expect = require('expect.js');
const command = require('..');
const Command = command.Command;

describe('Command', function() {
    describe('command()', function() {
        it('should return an instance of class Command', function() {
            expect(command()).to.be.a(Command);
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