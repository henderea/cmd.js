#!/usr/bin/env node
const command = require('..');

command((cmd) => {
    cmd.command('./subcommand');
    console.log(cmd);
}).parse();