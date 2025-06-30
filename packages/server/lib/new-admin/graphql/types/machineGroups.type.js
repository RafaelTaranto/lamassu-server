const gql = require('graphql-tag')

const typeDef = gql`
  type MachineGroup {
    id: ID!
    name: String!
    deviceCount: Int
  }

  type Query {
    machineGroups: [MachineGroup!]! @auth
  }

  type Mutation {
    createMachineGroup(name: String!): MachineGroup! @auth
    deleteMachineGroup(id: ID!): MachineGroup @auth
  }
`

module.exports = typeDef
