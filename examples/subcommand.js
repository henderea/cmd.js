const command = require('..');

module.exports = command().name('subcommand', 'sc', 'scmd').usage('Usage: $0 <param> [param2...]').action(argv => { console.log(argv); });