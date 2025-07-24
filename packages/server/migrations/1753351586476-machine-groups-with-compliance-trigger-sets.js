const db = require('./db')

const ALTER_TABLE = `
ALTER TABLE machine_groups
ADD COLUMN compliance_trigger_set_id UUID
  REFERENCES compliance_trigger_sets (id)
  ON DELETE SET NULL
`

exports.up = next => db.runAll([ALTER_TABLE], next)

exports.down = next => next()
