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
                    expect(result).to.eql(argv);
                });
            });
            describe('#command', function() {
                it('should take out the global parts of argv for sub-commands', function() {
                    let result = null;
                    let argv = ['script', 'command', 'test', 'test2'];
                    command(cmd => cmd.command(command().name('command').action(argv => result = argv))).parse(argv);
                    expect(result).to.eql(argv.slice(1));
                });
            });
        });
    });
});