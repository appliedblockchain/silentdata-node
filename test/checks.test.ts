import cbor from 'cbor'
import nacl from 'tweetnacl'
import { baseUrl, checkResponse, errorHandlers, server } from './mocks/server'
import { VerifyCheckError, VerifyCheckErrorCode } from '../src/Error'
import { DEFAULT_ERROR_MESSAGE } from '../src/constants'
import { httpClient } from '../src/http-client'
import {
  CheckBlockchain,
  CheckCountry,
  CheckCreateRequest,
  CheckCreateRequestData,
  checks,
  CheckType,
  getCheck,
  getCreateData,
} from '../src/checks'

const commonCreateData: CheckCreateRequestData = {
  blockchain: CheckBlockchain.algorand,
  walletAddress: 'FD5WHZBQOYNSELF5LNLXNR3MMHUMXFCVKTWZ7HLVCOWXIKB7ZCA7J44HAI',
  redirectUrl: 'http://redirect-url-dummy.com/',
  webhookUrl: 'http://webhook-url-dummy.com/',
}

const httpClnt = httpClient({
  baseUrl,
  headers: { 'x-client-id': 'dummy-client-id', 'x-api-key': 'dummy-api-key' },
})

const defaults = {
  redirectUrl: 'http://dummy-redirect-url.com/',
  webhookUrl: 'http://dummy-webhook-url.com/',
}

const checksWithoutDefaults = checks(httpClnt)
const checksWithDefaults = checks(httpClnt, defaults)

describe('checks', () => {
  it('Should return an object with methods', () => {
    expect(typeof checksWithoutDefaults).toBe('object')
    expect(typeof checksWithDefaults).toBe('object')

    expect('create' in checksWithoutDefaults).toBe(true)
    expect(typeof checksWithoutDefaults.create).toBe('function')
    expect('create' in checksWithDefaults).toBe(true)
    expect(typeof checksWithDefaults.create).toBe('function')

    expect('read' in checksWithoutDefaults).toBe(true)
    expect(typeof checksWithoutDefaults.read).toBe('function')
    expect('read' in checksWithDefaults).toBe(true)
    expect(typeof checksWithDefaults.read).toBe('function')

    expect('readById' in checksWithoutDefaults).toBe(true)
    expect(typeof checksWithoutDefaults.readById).toBe('function')
    expect('readById' in checksWithDefaults).toBe(true)
    expect(typeof checksWithDefaults.readById).toBe('function')

    expect('delete' in checksWithoutDefaults).toBe(true)
    expect(typeof checksWithoutDefaults.delete).toBe('function')
    expect('delete' in checksWithDefaults).toBe(true)
    expect(typeof checksWithDefaults.delete).toBe('function')
  })

  Object.keys(CheckType).forEach((type) => {
    describe('create', () => {
      it(`Should be able to create a new '${type}' check`, async () => {
        const data = getDataForCreateRequest(type)

        const response1 = await checksWithoutDefaults.create(data)

        expect(response1.data).toMatchObject({
          id: expect.any(String),
          url: expect.any(String),
        })

        const response2 = await checksWithDefaults.create(data)

        expect(response2.data).toMatchObject({
          id: expect.any(String),
          url: expect.any(String),
        })
      })

      it(`Should be able to handle errors when creating a new '${type}' check`, async () => {
        server.use(...errorHandlers)

        const data = getDataForCreateRequest(type)

        const response1 = await checksWithoutDefaults.create(data).catch((e: Error) => e)

        expect(response1 instanceof Error).toBe(true)
        expect((response1 as Error).message).toBe(DEFAULT_ERROR_MESSAGE)

        const response2 = await checksWithDefaults.create(data).catch((e: Error) => e)

        expect(response2 instanceof Error).toBe(true)
        expect((response2 as Error).message).toBe(DEFAULT_ERROR_MESSAGE)
      })
    })
  })

  describe('read', () => {
    Object.keys(CheckType).forEach((type) => {
      it(`Should be able to read '${type}' checks`, async () => {
        const response1 = await checksWithoutDefaults.read({
          type: type as CheckType,
          limit: 10,
          offset: 1,
        })

        expect(response1.data.checks).toMatchObject([
          {
            data: expect.any(Object),
            isCancelled: expect.any(Function),
            isCompleted: expect.any(Function),
            isError: expect.any(Function),
            isPending: expect.any(Function),
            isInProgress: expect.any(Function),
            isCertified: expect.any(Function),
            getCertificateDataAsJSON: expect.any(Function),
          },
        ])

        const response2 = await checksWithDefaults.read({
          type: type as CheckType,
          limit: 10,
          offset: 1,
        })

        expect(response2.data.checks).toMatchObject([
          {
            data: expect.any(Object),
            isCancelled: expect.any(Function),
            isCompleted: expect.any(Function),
            isError: expect.any(Function),
            isPending: expect.any(Function),
            isInProgress: expect.any(Function),
            isCertified: expect.any(Function),
            getCertificateDataAsJSON: expect.any(Function),
          },
        ])
      })

      it(`Should be able to handle errors when reading '${type}' checks`, async () => {
        server.use(...errorHandlers)

        const response1 = await checksWithoutDefaults
          .read({
            type: type as CheckType,
            limit: 10,
            offset: 1,
          })
          .catch((e: Error) => e)

        expect(response1 instanceof Error).toBe(true)
        expect((response1 as Error).message).toBe(DEFAULT_ERROR_MESSAGE)

        const response2 = await checksWithDefaults
          .read({
            type: type as CheckType,
            limit: 10,
            offset: 1,
          })
          .catch((e: Error) => e)

        expect(response2 instanceof Error).toBe(true)
        expect((response2 as Error).message).toBe(DEFAULT_ERROR_MESSAGE)
      })
    })
  })

  describe('readById', () => {
    Object.keys(CheckType).forEach((type) => {
      it(`Should be able to read by id a '${type}' check`, async () => {
        const response1 = await checksWithoutDefaults.readById({
          type: type as CheckType,
          id: 'dummy-id',
        })

        expect(response1.data.check).toMatchObject({
          data: expect.any(Object),
          isCancelled: expect.any(Function),
          isCompleted: expect.any(Function),
          isError: expect.any(Function),
          isPending: expect.any(Function),
          isInProgress: expect.any(Function),
          isCertified: expect.any(Function),
          getCertificateDataAsJSON: expect.any(Function),
        })

        const response2 = await checksWithDefaults.readById({
          type: type as CheckType,
          id: 'dummy-id',
        })

        expect(response2.data.check).toMatchObject({
          data: expect.any(Object),
          isCancelled: expect.any(Function),
          isCompleted: expect.any(Function),
          isError: expect.any(Function),
          isPending: expect.any(Function),
          isInProgress: expect.any(Function),
          isCertified: expect.any(Function),
          getCertificateDataAsJSON: expect.any(Function),
        })
      })

      it(`Should be able to handle errors when reading by id a '${type}' check`, async () => {
        server.use(...errorHandlers)

        const response1 = await checksWithoutDefaults
          .readById({
            type: type as CheckType,
            id: 'dummy-id',
          })
          .catch((e: Error) => e)

        expect(response1 instanceof Error).toBe(true)
        expect((response1 as Error).message).toBe(DEFAULT_ERROR_MESSAGE)

        const response2 = await checksWithDefaults
          .readById({
            type: type as CheckType,
            id: 'dummy-id',
          })
          .catch((e: Error) => e)

        expect(response2 instanceof Error).toBe(true)
        expect((response2 as Error).message).toBe(DEFAULT_ERROR_MESSAGE)
      })
    })
  })

  describe('delete', () => {
    Object.keys(CheckType).forEach((type) => {
      it(`Should be able to delete a '${type}' check`, async () => {
        const response1 = await checksWithoutDefaults.delete({
          type: type as CheckType,
          id: 'dummy-id',
        })

        expect(response1.data).toBe(true)

        const response2 = await checksWithDefaults.delete({
          type: type as CheckType,
          id: 'dummy-id',
        })

        expect(response2.data).toBe(true)
      })

      it(`Should be able to handle errors when deleting a '${type}' check`, async () => {
        server.use(...errorHandlers)

        const response1 = await checksWithoutDefaults
          .delete({
            type: type as CheckType,
            id: 'dummy-id',
          })
          .catch((e: Error) => e)

        expect(response1 instanceof Error).toBe(true)
        expect((response1 as Error).message).toBe(DEFAULT_ERROR_MESSAGE)

        const response2 = await checksWithDefaults
          .delete({
            type: type as CheckType,
            id: 'dummy-id',
          })
          .catch((e: Error) => e)

        expect(response2 instanceof Error).toBe(true)
        expect((response2 as Error).message).toBe(DEFAULT_ERROR_MESSAGE)
      })
    })
  })
})

describe('getCreateData', () => {
  it('Should return create data object without defaults', () => {
    const data = getCreateData(commonCreateData)

    expect(data.blockchain).toBe(commonCreateData.blockchain)
    expect(data.walletAddress).toBe(commonCreateData.walletAddress)
    expect(data.redirectUrl).toBe(commonCreateData.redirectUrl)
    expect(data.webhookUrl).toBe(commonCreateData.webhookUrl)
  })

  it('Should return create data object and override defaults', () => {
    const data = getCreateData(commonCreateData, defaults)

    expect(data.blockchain).toBe(commonCreateData.blockchain)
    expect(data.walletAddress).toBe(commonCreateData.walletAddress)
    expect(data.redirectUrl).toBe(commonCreateData.redirectUrl)
    expect(data.webhookUrl).toBe(commonCreateData.webhookUrl)
  })

  it('Should return create data object with defaults', () => {
    const data = getCreateData(
      { blockchain: commonCreateData.blockchain, walletAddress: commonCreateData.walletAddress },
      defaults,
    )

    expect(data.blockchain).toBe(commonCreateData.blockchain)
    expect(data.walletAddress).toBe(commonCreateData.walletAddress)
    expect(data.redirectUrl).toBe(defaults.redirectUrl)
    expect(data.webhookUrl).toBe(defaults.webhookUrl)
  })

  it('Should return create data object with undefined defaults', () => {
    const data = getCreateData({
      blockchain: commonCreateData.blockchain,
      walletAddress: commonCreateData.walletAddress,
    })

    expect(data.blockchain).toBe(commonCreateData.blockchain)
    expect(data.walletAddress).toBe(commonCreateData.walletAddress)
    expect(data.redirectUrl).toBe(undefined)
    expect(data.webhookUrl).toBe(undefined)
  })
})

describe('getCheck', () => {
  it('Should return a check resource', () => {
    const check = getCheck(checkResponse)

    expect(check).toMatchObject({
      data: expect.any(Object),
      isCancelled: expect.any(Function),
      isCompleted: expect.any(Function),
      isError: expect.any(Function),
      isPending: expect.any(Function),
      isInProgress: expect.any(Function),
      isCertified: expect.any(Function),
      getCertificateDataAsJSON: expect.any(Function),
    })
  })

  describe('isCancelled', () => {
    it('Should return true when status is "CANCELLED"', () => {
      const check = getCheck({ ...checkResponse, status: 'CANCELLED' })

      expect(check.isCancelled()).toBe(true)
    })

    it('Should return false when status is not "CANCELLED"', () => {
      const check = getCheck({ ...checkResponse, status: 'dummy-status' })

      expect(check.isCancelled()).toBe(false)
    })
  })

  describe('isCompleted', () => {
    it('Should return true when status is "COMPLETE"', () => {
      const check = getCheck({ ...checkResponse, status: 'COMPLETE' })

      expect(check.isCompleted()).toBe(true)
    })

    it('Should return false when status is not "COMPLETE"', () => {
      const check = getCheck({ ...checkResponse, status: 'dummy-status' })

      expect(check.isCompleted()).toBe(false)
    })
  })

  describe('isError', () => {
    it('Should return true when status is "ERROR"', () => {
      const check = getCheck({ ...checkResponse, status: 'ERROR' })

      expect(check.isError()).toBe(true)
    })

    it('Should return false when status is not "ERROR"', () => {
      const check = getCheck({ ...checkResponse, status: 'dummy-status' })

      expect(check.isError()).toBe(false)
    })
  })

  describe('isPending', () => {
    it('Should return true when status is "PENDING"', () => {
      const check = getCheck({ ...checkResponse, status: 'PENDING' })

      expect(check.isPending()).toBe(true)
    })

    it('Should return false when status is not "PENDING"', () => {
      const check = getCheck({ ...checkResponse, status: 'dummy-status' })

      expect(check.isPending()).toBe(false)
    })
  })

  describe('isInProgress', () => {
    it('Should return true when status is "IN_PROGRESS"', () => {
      const check = getCheck({ ...checkResponse, status: 'IN_PROGRESS' })

      expect(check.isInProgress()).toBe(true)
    })

    it('Should return false when status is not "IN_PROGRESS"', () => {
      const check = getCheck({ ...checkResponse, status: 'dummy-status' })

      expect(check.isInProgress()).toBe(false)
    })
  })

  describe('isCertified', () => {
    it('Should return true when success is true', () => {
      const check = getCheck({ ...checkResponse, success: true })

      expect(check.isCertified()).toBe(true)
    })

    it('Should return false when success is false', () => {
      const check = getCheck({ ...checkResponse, success: false })

      expect(check.isCertified()).toBe(false)
    })

    it('Should return false when success is undefined', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const check = getCheck({ ...checkResponse, success: undefined as any })

      expect(check.isCertified()).toBe(false)
    })
  })

  describe('verify', () => {
    it('Should throw a VerifyCheckError when rawData is undefined', () => {
      const check = getCheck({ ...checkResponse, rawData: undefined })

      expect(() => check.verify()).toThrow(
        new VerifyCheckError(VerifyCheckErrorCode.invalid_input, 'Invalid or missing inputs'),
      )
    })

    it('Should throw a VerifyCheckError when rawData is null', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const check = getCheck({ ...checkResponse, rawData: null as any })

      expect(() => check.verify()).toThrow(
        new VerifyCheckError(VerifyCheckErrorCode.invalid_input, 'Invalid or missing inputs'),
      )
    })

    it('Should throw a VerifyCheckError when rawData is not a string', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const check = getCheck({ ...checkResponse, rawData: 123 as any })

      expect(() => check.verify()).toThrow(new VerifyCheckError(VerifyCheckErrorCode.default, DEFAULT_ERROR_MESSAGE))
    })

    it('Should throw a VerifyCheckError when rawData is empty', () => {
      const check = getCheck({ ...checkResponse, rawData: '' })

      expect(() => check.verify()).toThrow(
        new VerifyCheckError(VerifyCheckErrorCode.invalid_input, 'Invalid or missing inputs'),
      )
    })

    it('Should throw a VerifyCheckError when signature is undefined', () => {
      const check = getCheck({ ...checkResponse, signature: undefined })

      expect(() => check.verify()).toThrow(
        new VerifyCheckError(VerifyCheckErrorCode.invalid_input, 'Invalid or missing inputs'),
      )
    })

    it('Should throw a VerifyCheckError when signature is null', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const check = getCheck({ ...checkResponse, signature: null as any })

      expect(() => check.verify()).toThrow(
        new VerifyCheckError(VerifyCheckErrorCode.invalid_input, 'Invalid or missing inputs'),
      )
    })

    it('Should throw a VerifyCheckError when signature is not a string', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const check = getCheck({ ...checkResponse, signature: 123 as any })

      expect(() => check.verify()).toThrow(new VerifyCheckError(VerifyCheckErrorCode.default, DEFAULT_ERROR_MESSAGE))
    })

    it('Should throw a VerifyCheckError when signature is empty', () => {
      const check = getCheck({ ...checkResponse, signature: '' })

      expect(() => check.verify()).toThrow(
        new VerifyCheckError(VerifyCheckErrorCode.invalid_input, 'Invalid or missing inputs'),
      )
    })

    it('Should throw a VerifyCheckError when signingKey is undefined', () => {
      const check = getCheck({ ...checkResponse, signingKey: undefined })

      expect(() => check.verify()).toThrow(
        new VerifyCheckError(VerifyCheckErrorCode.invalid_input, 'Invalid or missing inputs'),
      )
    })

    it('Should throw a VerifyCheckError when signingKey is null', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const check = getCheck({ ...checkResponse, signingKey: null as any })

      expect(() => check.verify()).toThrow(
        new VerifyCheckError(VerifyCheckErrorCode.invalid_input, 'Invalid or missing inputs'),
      )
    })

    it('Should throw a VerifyCheckError when signingKey is not a string', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const check = getCheck({ ...checkResponse, signingKey: 123 as any })

      expect(() => check.verify()).toThrow(new VerifyCheckError(VerifyCheckErrorCode.default, DEFAULT_ERROR_MESSAGE))
    })

    it('Should throw a VerifyCheckError when signingKey is empty', () => {
      const check = getCheck({ ...checkResponse, signingKey: '' })

      expect(() => check.verify()).toThrow(
        new VerifyCheckError(VerifyCheckErrorCode.invalid_input, 'Invalid or missing inputs'),
      )
    })

    it('Should throw a VerifyCheckError when verify signature fails', () => {
      const keys = generateKeyPair()
      const otherKeys = generateKeyPair()
      const rawData = cbor.encode({
        'dummy-key': 'dummy-value',
      })
      const signature = nacl.sign.detached(rawData, keys.secretKey)

      const check = getCheck({
        ...checkResponse,
        rawData: Buffer.from(rawData).toString('hex'),
        signature: Buffer.from(signature).toString('hex'),
        signingKey: Buffer.from(otherKeys.publicKey).toString('hex'),
      })

      expect(() => check.verify()).toThrow(
        new VerifyCheckError(VerifyCheckErrorCode.invalid_signature, 'Invalid signature'),
      )
    })

    it('Should return nothing for a verified signature', () => {
      const keys = generateKeyPair()
      const rawData = cbor.encode({
        'dummy-key': 'dummy-value',
      })
      const signature = nacl.sign.detached(rawData, keys.secretKey)

      const check = getCheck({
        ...checkResponse,
        rawData: Buffer.from(rawData).toString('hex'),
        signature: Buffer.from(signature).toString('hex'),
        signingKey: Buffer.from(keys.publicKey).toString('hex'),
      })

      expect(check.verify()).toBe(undefined)
    })
  })

  describe('getCertificateDataAsJSON', () => {
    it('Should return null when rawData is undefined', () => {
      const check = getCheck({ ...checkResponse, rawData: undefined })

      expect(check.getCertificateDataAsJSON()).toBe(null)
    })

    it('Should return null when rawData is null', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const check = getCheck({ ...checkResponse, rawData: null as any })

      expect(check.getCertificateDataAsJSON()).toBe(null)
    })

    it('Should return an object with decoded CBOR data', () => {
      const check = getCheck(checkResponse)

      expect(check.getCertificateDataAsJSON()).toMatchObject({})
    })
  })
})

function getDataForCreateRequest(type: string): CheckCreateRequest {
  if (type === 'balance') {
    return {
      type: CheckType[type],
      data: {
        ...commonCreateData,
        country: CheckCountry.gb,
        minimumBalance: 500,
      },
    }
  } else if (type === 'income') {
    return {
      type: CheckType[type],
      data: {
        ...commonCreateData,
        country: CheckCountry.gb,
        minimumIncome: 500,
      },
    }
  } else if (type === 'instagram') {
    return {
      type: CheckType[type],
      data: commonCreateData,
    }
  } else if (type === 'kyc') {
    return {
      type: CheckType[type],
      data: commonCreateData,
    }
  }
  throw new Error('Unhandled check type')
}

function generateKeyPair(): nacl.SignKeyPair {
  const randomArray = Array.from({ length: 64 + 1 }, () => Math.floor(Math.random() * 10))
  const seed = Buffer.from(randomArray.join(''), 'hex')
  const keyPair = nacl.sign.keyPair.fromSeed(seed)
  return keyPair
}
