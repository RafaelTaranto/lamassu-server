const gql = require('graphql-tag')

const typeDef = gql`
  type ComplianceTriggerSet {
    id: ID!
    name: String!
  }

  enum TriggerType {
    txAmount
    txVolume
    txVelocity
    consecutiveDays
  }

  enum RequirementType {
    sms
    idCardPhoto
    idCardData
    facephoto
    sanctions
    usSsn
    suspend
    block
    external
    custom
  }

  type ComplianceTrigger {
    id: ID!
    direction: String!
    triggerType: TriggerType!
    requirementType: RequirementType!

    suspensionDays: Float
    threshold: Int
    thresholdDays: Int
    customInfoRequestId: ID
    externalService: String
  }

  input ComplianceTriggerInput {
    id: ID!
    direction: String!
    triggerType: TriggerType!
    requirementType: RequirementType!

    suspensionDays: Float
    threshold: Int
    thresholdDays: Int
    customInfoRequestId: ID
    externalService: String
  }

  type Query {
    complianceTriggerSets: [ComplianceTriggerSet!]! @auth
    complianceTriggerSetById(id: ID!): ComplianceTriggerSet! @auth

    complianceTriggers(complianceTriggerSetId: ID!): [ComplianceTrigger!]! @auth
  }

  type Mutation {
    createComplianceTriggerSet(name: String!): ComplianceTriggerSet @auth
    deleteComplianceTriggerSet(id: ID!): ComplianceTriggerSet @auth
    createComplianceTrigger(
      complianceTriggerSetId: ID!
      trigger: ComplianceTriggerInput!
    ): Boolean! @auth
    deleteComplianceTrigger(id: ID!): Boolean! @auth
  }
`

module.exports = typeDef
