import { describe, it, expect } from 'vitest'
import { getAuthorizedStatus } from './helper'

describe('getAuthorizedStatus', () => {
  const mockTriggers = {
    automation: 'automatic',
    overrides: [],
  }

  const mockCustomRequests = [{ id: 'custom-req-1' }, { id: 'custom-req-2' }]

  it('should return blocked status when authorizedOverride is blocked', () => {
    const customer = {
      authorizedOverride: 'blocked',
    }

    const result = getAuthorizedStatus(
      customer,
      mockTriggers,
      mockCustomRequests,
    )

    expect(result).toEqual({
      label: 'Blocked',
      type: 'error',
    })
  })

  it('should return suspension status when customer is suspended with days > 0', () => {
    const customer = {
      authorizedOverride: null,
      isSuspended: true,
      daysSuspended: 5,
    }

    const result = getAuthorizedStatus(
      customer,
      mockTriggers,
      mockCustomRequests,
    )

    expect(result).toEqual({
      label: '5 day suspension',
      type: 'warning',
    })
  })

  it('should return short suspension status when customer is suspended with days <= 0', () => {
    const customer = {
      authorizedOverride: null,
      isSuspended: true,
      daysSuspended: 0,
    }

    const result = getAuthorizedStatus(
      customer,
      mockTriggers,
      mockCustomRequests,
    )

    expect(result).toEqual({
      label: '< 1 day suspension',
      type: 'warning',
    })
  })

  it('should return rejected status when any field has blocked override', () => {
    const customer = {
      authorizedOverride: null,
      isSuspended: false,
      emailOverride: 'blocked',
      email: 'test@example.com',
    }

    const triggers = {
      automation: 'manual',
      overrides: [],
    }

    const result = getAuthorizedStatus(customer, triggers, mockCustomRequests)

    expect(result).toEqual({
      label: 'Rejected',
      type: 'error',
    })
  })

  it('should return pending status when any field has automatic override', () => {
    const customer = {
      authorizedOverride: null,
      isSuspended: false,
      emailOverride: 'automatic',
      email: 'test@example.com',
    }

    const triggers = {
      automation: 'manual',
      overrides: [],
    }

    const result = getAuthorizedStatus(customer, triggers, mockCustomRequests)

    expect(result).toEqual({
      label: 'Pending',
      type: 'warning',
    })
  })

  it('should return authorized status when no blocking conditions exist', () => {
    const customer = {
      authorizedOverride: null,
      isSuspended: false,
    }

    const result = getAuthorizedStatus(
      customer,
      mockTriggers,
      mockCustomRequests,
    )

    expect(result).toEqual({
      label: 'Authorized',
      type: 'success',
    })
  })

  it('should handle customers with idCardData', () => {
    const customer = {
      authorizedOverride: null,
      isSuspended: false,
      idCardData: { firstName: 'John', lastName: 'Doe' },
      idCardDataOverride: 'automatic',
    }

    const triggers = {
      automation: 'manual',
      overrides: [],
    }

    const result = getAuthorizedStatus(customer, triggers, mockCustomRequests)

    expect(result).toEqual({
      label: 'Pending',
      type: 'warning',
    })
  })

  it('should handle customers with photo fields using path suffix', () => {
    const customer = {
      authorizedOverride: null,
      isSuspended: false,
      frontCameraPath: '/path/to/photo.jpg',
      frontCameraOverride: 'blocked',
    }

    const triggers = {
      automation: 'manual',
      overrides: [],
    }

    const result = getAuthorizedStatus(customer, triggers, mockCustomRequests)

    expect(result).toEqual({
      label: 'Rejected',
      type: 'error',
    })
  })

  it('should handle custom info requests with UUID validation', () => {
    const customer = {
      authorizedOverride: null,
      isSuspended: false,
      customInfoRequests: [
        {
          infoRequestId: '550e8400-e29b-41d4-a716-446655440000',
          override: 'automatic',
        },
      ],
    }

    const triggers = {
      automation: 'manual',
      overrides: [],
    }

    const customRequests = [{ id: '550e8400-e29b-41d4-a716-446655440000' }]

    const result = getAuthorizedStatus(customer, triggers, customRequests)

    expect(result).toEqual({
      label: 'Pending',
      type: 'warning',
    })
  })

  it('should handle manual overrides for specific requirements', () => {
    const customer = {
      authorizedOverride: null,
      isSuspended: false,
      frontCameraPath: '/path/to/photo.jpg',
      frontCameraOverride: 'automatic',
    }

    const triggers = {
      automation: 'automatic',
      overrides: [
        {
          requirement: 'facephoto',
          automation: 'manual',
        },
      ],
    }

    const result = getAuthorizedStatus(customer, triggers, mockCustomRequests)

    expect(result).toEqual({
      label: 'Pending',
      type: 'warning',
    })
  })

  it('should handle null or undefined triggers gracefully', () => {
    const customer = {
      authorizedOverride: null,
      isSuspended: false,
    }

    const triggers = {
      automation: 'automatic',
      overrides: [],
    }

    const result = getAuthorizedStatus(customer, triggers, mockCustomRequests)

    expect(result).toEqual({
      label: 'Authorized',
      type: 'success',
    })
  })

  it('should handle empty custom requests array', () => {
    const customer = {
      authorizedOverride: null,
      isSuspended: false,
    }

    const result = getAuthorizedStatus(customer, mockTriggers, [])

    expect(result).toEqual({
      label: 'Authorized',
      type: 'success',
    })
  })

  it('should prioritize blocked status over suspension', () => {
    const customer = {
      authorizedOverride: 'blocked',
      isSuspended: true,
      daysSuspended: 5,
    }

    const result = getAuthorizedStatus(
      customer,
      mockTriggers,
      mockCustomRequests,
    )

    expect(result).toEqual({
      label: 'Blocked',
      type: 'error',
    })
  })

  it('should prioritize rejection over pending status', () => {
    const customer = {
      authorizedOverride: null,
      isSuspended: false,
      emailOverride: 'blocked',
      email: 'test@example.com',
      usSsnOverride: 'automatic',
      usSsn: '123-45-6789',
    }

    const triggers = {
      automation: 'manual',
      overrides: [],
    }

    const result = getAuthorizedStatus(customer, triggers, mockCustomRequests)

    expect(result).toEqual({
      label: 'Rejected',
      type: 'error',
    })
  })

  it('should return rejected status for blocked custom info request', () => {
    const customer = {
      authorizedOverride: null,
      isSuspended: false,
      customInfoRequests: [
        {
          infoRequestId: '550e8400-e29b-41d4-a716-446655440000',
          override: 'blocked',
        },
      ],
    }

    const triggers = {
      automation: 'manual',
      overrides: [],
    }

    const customRequests = [{ id: '550e8400-e29b-41d4-a716-446655440000' }]

    const result = getAuthorizedStatus(customer, triggers, customRequests)

    expect(result).toEqual({
      label: 'Rejected',
      type: 'error',
    })
  })
})
