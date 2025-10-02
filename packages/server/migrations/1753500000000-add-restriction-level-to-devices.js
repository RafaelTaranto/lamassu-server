const db = require('./db')

const ALTER_TABLE = `
ALTER TABLE devices
ADD COLUMN restriction_level INTEGER NOT NULL DEFAULT 0
`

exports.up = next => db.runAll([ALTER_TABLE], next)

exports.down = next => next()
