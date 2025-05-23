const db = require('../db')
const cashInTx = require('../cash-in/cash-in-tx')
const { CASH_OUT_TRANSACTION_STATES } = require('../cash-out/cash-out-helper')

function transaction() {
  const sql = `SELECT DISTINCT * FROM (
    SELECT 'type' AS type, NULL AS label, 'Cash In' AS value UNION
    SELECT 'type' AS type, NULL AS label, 'Cash Out' AS value UNION
    SELECT 'machine' AS type, name AS label, d.device_id AS value FROM devices d INNER JOIN cash_in_txs t ON d.device_id = t.device_id UNION
    SELECT 'machine' AS type, name AS label, d.device_id AS value FROM devices d INNER JOIN cash_out_txs t ON d.device_id = t.device_id UNION
    SELECT 'customer' AS type, NULL AS label, concat(id_card_data::json->>'firstName', ' ', id_card_data::json->>'lastName') AS value
    FROM customers c INNER JOIN cash_in_txs t ON c.id = t.customer_id
    WHERE c.id_card_data::json->>'firstName' IS NOT NULL or c.id_card_data::json->>'lastName' IS NOT NULL UNION
    SELECT 'customer' AS type, NULL AS label, concat(id_card_data::json->>'firstName', ' ', id_card_data::json->>'lastName') AS value
    FROM customers c INNER JOIN cash_out_txs t ON c.id = t.customer_id
    WHERE c.id_card_data::json->>'firstName' IS NOT NULL or c.id_card_data::json->>'lastName' IS NOT NULL UNION
    SELECT 'fiat' AS type, NULL AS label, fiat_code AS value FROM cash_in_txs UNION
    SELECT 'fiat' AS type, NULL AS label, fiat_code AS value FROM cash_out_txs UNION
    SELECT 'crypto' AS type, NULL AS label, crypto_code AS value FROM cash_in_txs UNION
    SELECT 'crypto' AS type, NULL AS label, crypto_code AS value FROM cash_out_txs UNION
    SELECT 'address' AS type, NULL AS label, to_address AS value FROM cash_in_txs UNION
    SELECT 'address' AS type, NULL AS label, to_address AS value FROM cash_out_txs UNION
    SELECT 'status' AS type, NULL AS label, ${cashInTx.TRANSACTION_STATES} AS value FROM cash_in_txs UNION
    SELECT 'status' AS type, NULL AS label, ${CASH_OUT_TRANSACTION_STATES} AS value FROM cash_out_txs UNION
    SELECT 'sweep status' AS type, NULL AS label, CASE WHEN swept THEN 'Swept' WHEN NOT swept THEN 'Unswept' END AS value FROM cash_out_txs
  ) f`

  return db.any(sql)
}

module.exports = { transaction }
