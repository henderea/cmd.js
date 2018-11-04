function CmdError (msg) {
  this.name = 'CmdError'
  this.message = msg || 'cmd.js error'
  Error.captureStackTrace(this, CmdError)
}

CmdError.prototype = Object.create(Error.prototype)
CmdError.prototype.constructor = CmdError

module.exports = CmdError