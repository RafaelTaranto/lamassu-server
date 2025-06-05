const authentication = require('../modules/userManagement')
const anonymous = require('../../../constants').anonymousCustomer
const customers = require('../../../customers')
const customerNotes = require('../../../customer-notes')
const machineLoader = require('../../../machine-loader')
const {
  customers: { searchCustomers },
} = require('typesafe-db')

const addLastUsedMachineName = customer =>
  (customer.lastUsedMachine
    ? machineLoader.getMachineName(customer.lastUsedMachine)
    : Promise.resolve(null)
  ).then(lastUsedMachineName =>
    Object.assign(customer, { lastUsedMachineName }),
  )

const resolvers = {
  Customer: {
    isAnonymous: parent => parent.customerId === anonymous.uuid,
  },
  Query: {
    customers: () => customers.getCustomersList(),
    customer: (...[, { customerId }]) =>
      customers.getCustomerById(customerId).then(addLastUsedMachineName),
    searchCustomers: (...[, { searchTerm, limit = 20 }]) =>
      searchCustomers(searchTerm, limit),
  },
  Mutation: {
    setCustomer: (root, { customerId, customerInput }, context) => {
      const token = authentication.getToken(context)
      if (customerId === anonymous.uuid)
        return customers.getCustomerById(customerId)
      return customers.updateCustomer(customerId, customerInput, token)
    },
    addCustomField: (...[, { customerId, label, value }]) =>
      customers.addCustomField(customerId, label, value),
    saveCustomField: (...[, { customerId, fieldId, value }]) =>
      customers.saveCustomField(customerId, fieldId, value),
    removeCustomField: (...[, [{ customerId, fieldId }]]) =>
      customers.removeCustomField(customerId, fieldId),
    editCustomer: async (root, { customerId, customerEdit }, context) => {
      const token = authentication.getToken(context)
      const editedData = await customerEdit
      return customers.edit(customerId, editedData, token)
    },
    replacePhoto: async (
      root,
      { customerId, photoType, newPhoto },
      context,
    ) => {
      const token = authentication.getToken(context)
      const { file } = newPhoto
      const photo = await file
      if (!photo) return customers.getCustomerById(customerId)
      return customers
        .updateEditedPhoto(customerId, photo, photoType)
        .then(newPatch => customers.edit(customerId, newPatch, token))
    },
    deleteEditedData: (root, { customerId }) => {
      // TODO: NOT IMPLEMENTING THIS FEATURE FOR THE CURRENT VERSION
      return customers.getCustomerById(customerId)
    },
    createCustomerNote: (...[, { customerId, title, content }, context]) => {
      const token = authentication.getToken(context)
      return customerNotes.createCustomerNote(customerId, token, title, content)
    },
    editCustomerNote: (...[, { noteId, newContent }, context]) => {
      const token = authentication.getToken(context)
      return customerNotes.updateCustomerNote(noteId, token, newContent)
    },
    deleteCustomerNote: (...[, { noteId }]) => {
      return customerNotes.deleteCustomerNote(noteId)
    },
    createCustomer: (...[, { phoneNumber }]) =>
      customers.add({ phone: phoneNumber }),
    enableTestCustomer: (...[, { customerId }]) =>
      customers.enableTestCustomer(customerId),
    disableTestCustomer: (...[, { customerId }]) =>
      customers.disableTestCustomer(customerId),
  },
}

module.exports = resolvers
