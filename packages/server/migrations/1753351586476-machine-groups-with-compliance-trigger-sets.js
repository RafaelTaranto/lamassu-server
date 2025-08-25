const db = require('./db')

const ALTER_TABLE = `
ALTER TABLE machine_groups
ADD COLUMN compliance_trigger_set_id UUID
  REFERENCES compliance_trigger_sets (id)
  ON DELETE SET NULL
`

const ASSIGN_TRIGGER_SET = `
UPDATE machine_groups
SET compliance_trigger_set_id = trigger_set.id
FROM (SELECT id FROM compliance_trigger_sets LIMIT 1) AS trigger_set
`

exports.up = next => db.runAll([ALTER_TABLE, ASSIGN_TRIGGER_SET], next)

exports.down = next => next()
