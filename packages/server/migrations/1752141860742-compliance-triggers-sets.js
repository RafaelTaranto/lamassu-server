const uuid = require('uuid')

const db = require('./db')

const CREATE_TABLE = `
CREATE TABLE compliance_trigger_sets (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
)
`

const INSERT_DEFAULT =
  "INSERT INTO compliance_trigger_sets (id, name) VALUES ($1, 'Default')"

const ADD_SET_COLUMN = `
ALTER TABLE compliance_triggers
ADD COLUMN compliance_trigger_set_id UUID
  REFERENCES compliance_trigger_sets (id)
  ON DELETE CASCADE
`

const UPDATE_TRIGGERS =
  'UPDATE compliance_triggers SET compliance_trigger_set_id = $1'

const MAKE_SET_COLUMN_NOT_NULL = `
ALTER TABLE compliance_triggers
ALTER COLUMN compliance_trigger_set_id
SET NOT NULL
`

exports.up = next => {
  const defaultUUID = uuid.v4()
  return db
    .tx(async tx => {
      await tx.none(CREATE_TABLE)
      await tx.none(INSERT_DEFAULT, [defaultUUID])
      await tx.none(ADD_SET_COLUMN)
      await tx.none(UPDATE_TRIGGERS, [defaultUUID])
      await tx.none(MAKE_SET_COLUMN_NOT_NULL)
    })
    .then(() => next())
    .catch(err => {
      console.log(err)
      next(err)
    })
}

exports.down = next => next()
