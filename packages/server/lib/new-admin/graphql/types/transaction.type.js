const gql = require('graphql-tag')

const typeDef = gql`
  type Transaction {
    id: ID!
    txClass: String!
    deviceId: ID!
    toAddress: String
    cryptoAtoms: String!
    cryptoCode: String!
    fiat: String!
    fiatCode: String!
    fee: String
    txHash: String
    phone: String
    error: String
    created: DateTimeISO
    send: Boolean
    sendConfirmed: Boolean
    dispense: Boolean
    timedout: Boolean
    sendTime: DateTimeISO
    errorCode: String
    operatorCompleted: Boolean
    sendPending: Boolean
    fixedFee: String
    minimumTx: Float
    isAnonymous: Boolean
    txVersion: Int!
    termsAccepted: Boolean
    commissionPercentage: String
    rawTickerPrice: String
    isPaperWallet: Boolean
    expired: Boolean
    machineName: String
    discount: Int
    customerId: ID
    customerPhone: String
    customerEmail: String
    customerIdCardData: JSONObject
    customerFrontCameraPath: String
    customerIdCardPhotoPath: String
    txCustomerPhotoPath: String
    txCustomerPhotoAt: DateTimeISO
    batched: Boolean
    batchTime: DateTimeISO
    batchError: String
    walletScore: Int
    profit: String
    swept: Boolean
    status: String
    paginationStats: PaginationStats
  }

  type PaginationStats {
    totalCount: Int
  }

  type Filter {
    type: String
    value: String
    label: String
  }

  type Query {
    transactions(
      from: DateTimeISO
      until: DateTimeISO
      limit: Int
      offset: Int
      txClass: String
      deviceId: String
      customerName: String
      customerId: ID
      fiatCode: String
      cryptoCode: String
      toAddress: String
      status: String
      swept: Boolean
      excludeTestingCustomers: Boolean
    ): [Transaction] @auth
    transactionsCsv(
      from: DateTimeISO
      until: DateTimeISO
      limit: Int
      offset: Int
      txClass: String
      deviceId: String
      customerName: String
      customerId: ID
      fiatCode: String
      cryptoCode: String
      toAddress: String
      status: String
      swept: Boolean
      timezone: String
      excludeTestingCustomers: Boolean
      simplified: Boolean
    ): String @auth
    transactionCsv(id: ID, txClass: String, timezone: String): String @auth
    txAssociatedDataCsv(id: ID, txClass: String, timezone: String): String @auth
    transactionFilters: [Filter] @auth
  }

  type Mutation {
    cancelCashOutTransaction(id: ID): Transaction @auth
    cancelCashInTransaction(id: ID): Transaction @auth
  }
`

module.exports = typeDef
