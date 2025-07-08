const db = require('./db')
const { loadConfig, removeFromConfig } = require('./settings')

const CREATE_DIRECTION_TYPE = `
CREATE TYPE COMPLIANCE_TRIGGER_DIRECTION AS ENUM(
  'both',
  'cashIn',
  'cashOut'
)
`

const CREATE_TRIGGER_TYPE = `
CREATE TYPE TRIGGER_TYPE AS ENUM(
  'txAmount',
  'txVolume',
  'txVelocity',
  'consecutiveDays'
)
`

const CREATE_REQUIREMENT_TYPE = `
CREATE TYPE REQUIREMENT_TYPE AS ENUM(
  'sms',
  'idCardPhoto',
  'idCardData',
  'facephoto',
  'sanctions',
  'usSsn',
  'suspend',
  'block',
  'external',
  'custom'
)
`

const CREATE_TABLE = `
CREATE TABLE compliance_triggers (
  id UUID PRIMARY KEY,

  direction COMPLIANCE_TRIGGER_DIRECTION NOT NULL,

  trigger_type TRIGGER_TYPE NOT NULL,
  threshold NUMERIC(14, 5) CHECK(
    CASE
      WHEN trigger_type IN ('txAmount', 'txVolume', 'txVelocity')
      THEN threshold IS NOT NULL
      ELSE threshold IS NULL
    END
  ),

  threshold_days NUMERIC(14, 5) CHECK(
    CASE
      WHEN trigger_type IN ('txVolume', 'txVelocity', 'consecutiveDays')
      THEN threshold_days IS NOT NULL
      ELSE threshold_days IS NULL
    END
  ),

  requirement_type REQUIREMENT_TYPE NOT NULL,
  suspension_days NUMERIC(14, 5) CHECK(
    CASE
      WHEN requirement_type = 'suspend'
      THEN suspension_days IS NOT NULL
      ELSE suspension_days IS NULL
    END
  ),

  external_service TEXT CHECK(
    CASE
      WHEN requirement_type = 'external'
      THEN external_service IS NOT NULL
      ELSE external_service IS NULL
    END
  ),

  custom_info_request_id UUID REFERENCES custom_info_requests(id) CHECK(
    CASE
      WHEN requirement_type = 'custom'
      THEN custom_info_request_id IS NOT NULL
      ELSE custom_info_request_id IS NULL
    END
  )
)
`

const INSERT_TRIGGER = `
INSERT INTO compliance_triggers (
  id,
  direction,
  trigger_type,
  threshold,
  threshold_days,
  requirement_type,
  suspension_days,
  external_service,
  custom_info_request_id
) VALUES (
  \${id},
  \${direction},
  \${triggerType},
  \${threshold},
  \${thresholdDays},
  \${requirement},
  \${suspensionDays},
  \${externalService},
  \${customInfoRequestId}
)`

const insertTriggers = config =>
  Promise.all(
    (config?.triggers ?? []).map(trigger => {
      trigger.externalService ||= null // saved as empty string in JSON...
      return db.none(INSERT_TRIGGER, trigger)
    }),
  )

exports.up = next =>
  db
    .runAll([
      CREATE_DIRECTION_TYPE,
      CREATE_TRIGGER_TYPE,
      CREATE_REQUIREMENT_TYPE,
      CREATE_TABLE,
    ])
    .then(loadConfig)
    .then(insertTriggers)
    .then(() => removeFromConfig(['triggers']))
    .then(next)
    .catch(err => {
      console.log(err)
      next(err)
    })

exports.down = next => next()
