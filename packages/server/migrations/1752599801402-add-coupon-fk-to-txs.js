var db = require('./db')

exports.up = function (next) {
  const sql = [
    'ALTER TABLE cash_in_txs ADD COLUMN coupon_id uuid REFERENCES coupons(id)',
    'ALTER TABLE cash_out_txs ADD COLUMN coupon_id uuid REFERENCES coupons(id)',
    'CREATE INDEX idx_cash_in_txs_coupon_id ON cash_in_txs(coupon_id)',
    'CREATE INDEX idx_cash_out_txs_coupon_id ON cash_out_txs(coupon_id)',
  ]
  db.runAll(sql, next)
}

exports.down = function (next) {
  next()
}
