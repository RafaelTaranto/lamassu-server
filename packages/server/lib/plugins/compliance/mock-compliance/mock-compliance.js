const uuid = require('uuid')

const { APPROVED } = require('../consts')

const CODE = 'mock-compliance'

const createLink = (settings, userId, level) => {
  return Promise.resolve(
    `https://mock-external-compliance.link/?user=${userId}&level=${level}`,
  )
}

const getApplicantStatus = account => {
  return Promise.resolve({
    level: account.applicantLevel,
    answer: APPROVED,
  })
}

const createApplicant = () => {
  return Promise.resolve({
    id: uuid.v4(),
  })
}

module.exports = {
  CODE,
  createApplicant,
  getApplicantStatus,
  createLink,
}
