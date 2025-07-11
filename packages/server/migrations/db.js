const db = require('../lib/db')

const doAllPromise = async sqls => {
  for (const sql of sqls) await db.none(sql)
}

const runAll = (sqls, cb) => {
  if (cb) {
    doAllPromise(sqls).then(cb).catch(cb)
  } else {
    return doAllPromise(sqls)
  }
}

const edb = Object.create(db)
edb.runAll = runAll
module.exports = edb
