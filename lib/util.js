const CmdError = require('./error');

function parseCommand(cmd) {
  const extraSpacesStrippedCommand = cmd.replace(/\s{2,}/g, ' ');
  const splitCommand = extraSpacesStrippedCommand.split(/\s+(?![^[]*]|[^<]*>)/);
  const bregex = /\.*[\][<>]/g;
  const parsedCommand = {
    cmd: (splitCommand.shift()).replace(bregex, ''),
    demanded: [],
    optional: []
  };
  splitCommand.forEach((cmd, i) => {
    let variadic = false;
    cmd = cmd.replace(/\s/g, '');
    if(/\.+[\]>]/.test(cmd) && i === splitCommand.length - 1) { variadic = true; }
    if(/^\[/.test(cmd)) {
      parsedCommand.optional.push({
        cmd: cmd.replace(bregex, '').split('|'),
        variadic
      });
    } else {
      parsedCommand.demanded.push({
        cmd: cmd.replace(bregex, '').split('|'),
        variadic
      });
    }
  });
  return parsedCommand;
}

function positionName(pos) {
  let s = `${pos}`;
  s = s.slice(s.length - 1);
  if(s == '1') { return `${pos}st`; }
  if(s == '2') { return `${pos}nd`; }
  if(s == '3') { return `${pos}rd`; }
  return `${pos}th`;
}

function argsert(expected, callerArguments, length) {
  try {
    // preface the argument description with "cmd", so
    // that we can run it through yargs' command parser.
    let position = 0;
    let parsed = { demanded: [], optional: [] };
    if(typeof expected === 'object') {
      length = callerArguments;
      callerArguments = expected;
    } else {
      parsed = parseCommand(`cmd ${expected}`);
    }
    const args = [].slice.call(callerArguments);

    while(args.length && args[args.length - 1] === undefined) { args.pop(); }
    length = length || args.length;

    if(length < parsed.demanded.length) {
      throw new CmdError(`Not enough arguments provided. Expected ${parsed.demanded.length} but received ${args.length}.`);
    }

    const totalCommands = parsed.demanded.length + parsed.optional.length;
    if(length > totalCommands) {
      throw new CmdError(`Too many arguments provided. Expected max ${totalCommands} but received ${length}.`);
    }

    parsed.demanded.forEach((demanded) => {
      const arg = args.shift();
      const observedType = guessType(arg);
      const matchingTypes = demanded.cmd.filter(type => type === observedType || type === '*');
      if(matchingTypes.length === 0) { argumentTypeError(observedType, demanded.cmd, position, false); }
      position += 1;
    })

    parsed.optional.forEach((optional) => {
      if(args.length === 0) { return; }
      const arg = args.shift();
      const observedType = guessType(arg);
      const matchingTypes = optional.cmd.filter(type => type === observedType || type === '*');
      if(matchingTypes.length === 0) { argumentTypeError(observedType, optional.cmd, position, true); }
      position += 1;
    })
  } catch(err) {
    console.warn(err.stack);
  }
}

function guessType(arg) {
  if(Array.isArray(arg)) {
    return 'array';
  } else if(arg === null) {
    return 'null';
  } else if(arg instanceof Object && typeof arg.getClassName === 'function') {
    return arg.getClassName();
  }
  return typeof arg;
}

function argumentTypeError(observedType, allowedTypes, position, optional) {
  throw new CmdError(`Invalid ${positionName(position)} argument. Expected ${allowedTypes.join(' or ')} but received ${observedType}.`);
}

module.exports = { parseCommand, positionName, argsert };