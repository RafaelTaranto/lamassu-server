const gql = require('graphql-tag')

const typeDef = gql`
  type Query {
    accounts: JSONObject @auth
    configWithAllTriggers: JSONObject
      @auth
      @deprecated(reason: "use config instead")
    config: JSONObject @auth
  }

  type Mutation {
    saveAccounts(accounts: JSONObject): JSONObject @auth
    saveConfig(config: JSONObject): JSONObject @auth
  }
`

module.exports = typeDef
