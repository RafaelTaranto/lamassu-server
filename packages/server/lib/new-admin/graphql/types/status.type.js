const gql = require('graphql-tag')

const typeDef = gql`
  type ProcessStatus {
    name: String!
    state: String!
    uptime: Int!
  }

  type Query {
    uptime: [ProcessStatus] @auth
    restrictionLevel: Int
  }
`

module.exports = typeDef
