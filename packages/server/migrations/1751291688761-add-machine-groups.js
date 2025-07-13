var db = require('./db')
var { defaultMachineGroup } = require('../lib/constants')

exports.up = function (next) {
  const sql = [
    `create table machine_groups (
      id uuid PRIMARY KEY,
      name text UNIQUE NOT NULL
    )`,
    `insert into machine_groups (id, name) VALUES ('${defaultMachineGroup.uuid}','${defaultMachineGroup.name}')`,
    `alter table devices add column machine_group_id uuid references machine_groups (id) DEFAULT '${defaultMachineGroup.uuid}' NOT NULL`,
  ]
  db.runAll(sql, next)
}

exports.down = function (next) {
  next()
}
