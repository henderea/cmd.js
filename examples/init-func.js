#!/usr/bin/env node
const command = require('..');

command((cmd) => {
    cmd.usage('<subcommand> [args...]');
    let sc = cmd.command('./subcommand');
    cmd.action(argv => {
        console.log(argv);
        console.log(cmd.fullName);
        console.log(sc.fullName);
        console.log(cmd.usageText);
        console.log(sc.usageText);
        console.log(cmd);
    });
}).parse();