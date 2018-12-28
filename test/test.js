var assert = require('assert');
const command = require('..');
const Command = command.Command;

describe('Command', function() {
    describe('command()', function() {
        it('should return an instance of class Command', function() {
            assert(command() instanceof Command);
        });
    });
});