import fs from 'fs'
import path from 'path'
import { baseUrl, enclaveResponse, errorHandlers, server } from './mocks/server'
import { VerifyEnclaveError, VerifyEnclaveErrorCode } from '../src/Error'
import {
  ADVISORY_ID_LVI,
  ADVISORY_ID_MMIO,
  DEFAULT_ERROR_MESSAGE,
  ENCLAVE_QUOTE_STATUS_SW_HARDENING_NEEDED,
  MRENCLAVES,
  MRSIGNER,
} from '../src/constants'
import { httpClient } from '../src/http-client'
import * as sgx from '../src/utils/sgx'
import {
  EnclaveResource,
  EnclavePublicKeyAlgorithm,
  EnclavePublicKeyUsage,
  enclaves,
  getEnclave,
} from '../src/enclaves'

const httpClnt = httpClient({
  baseUrl,
  headers: { 'x-client-id': 'dummy-client-id', 'x-api-key': 'dummy-api-key' },
})

const enclvs = enclaves(httpClnt)

describe('enclaves', () => {
  it('Should return an object with methods', () => {
    expect(typeof enclvs).toBe('object')

    expect('read' in enclvs).toBe(true)
    expect(typeof enclvs.read).toBe('function')
  })

  describe('read', () => {
    it('Should be able to read an enclave by signingKey', async () => {
      const response = await enclvs.read({
        signingKey: 'dummy-signing-key',
      })

      expect(response.data.enclave).toMatchObject({
        data: expect.any(Object),
        isActive: expect.any(Function),
        isRevoked: expect.any(Function),
        isRetired: expect.any(Function),
        verify: expect.any(Function),
      })
    })

    it('Should be able to handle errors when reading an enclave by signingKey', async () => {
      server.use(...errorHandlers)

      const response = await enclvs
        .read({
          signingKey: 'dummy-signing-key',
        })
        .catch((e: Error) => e)

      expect(response instanceof Error).toBe(true)
      expect((response as Error).message).toBe(DEFAULT_ERROR_MESSAGE)
    })
  })
})

describe('getEnclave', () => {
  it('Should return an enclave resource', () => {
    const enclave = getEnclave(enclaveResponse)

    expect(enclave).toMatchObject({
      data: expect.any(Object),
      isActive: expect.any(Function),
      isRevoked: expect.any(Function),
      isRetired: expect.any(Function),
      verify: expect.any(Function),
    })
  })

  describe('isActive', () => {
    it('Should return true when status is "ACTIVE"', () => {
      const enclave = getEnclave({ ...enclaveResponse, status: 'ACTIVE' })

      expect(enclave.isActive()).toBe(true)
    })

    it('Should return false when status is not "ACTIVE"', () => {
      const enclave = getEnclave({ ...enclaveResponse, status: 'dummy-status' })

      expect(enclave.isActive()).toBe(false)
    })
  })

  describe('isRevoked', () => {
    it('Should return true when status is "REVOKED"', () => {
      const enclave = getEnclave({ ...enclaveResponse, status: 'REVOKED' })

      expect(enclave.isRevoked()).toBe(true)
    })

    it('Should return false when status is not "REVOKED"', () => {
      const enclave = getEnclave({ ...enclaveResponse, status: 'dummy-status' })

      expect(enclave.isRevoked()).toBe(false)
    })
  })

  describe('isRetired', () => {
    it('Should return true when status is "RETIRED"', () => {
      const enclave = getEnclave({ ...enclaveResponse, status: 'RETIRED' })

      expect(enclave.isRetired()).toBe(true)
    })

    it('Should return false when status is not "RETIRED"', () => {
      const enclave = getEnclave({ ...enclaveResponse, status: 'dummy-status' })

      expect(enclave.isRetired()).toBe(false)
    })
  })

  describe('verify', () => {
    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('Should throw a VerifyEnclaveError when publicKeys is undefined', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enclave = getEnclave({ ...enclaveResponse, publicKeys: undefined as any })

      await expect(enclave.verify()).rejects.toThrow(
        new VerifyEnclaveError(VerifyEnclaveErrorCode.invalid_input, 'Invalid or missing inputs'),
      )
    })

    it('Should throw a VerifyEnclaveError when publicKeys is null', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enclave = getEnclave({ ...enclaveResponse, publicKeys: null as any })

      await expect(enclave.verify()).rejects.toThrow(
        new VerifyEnclaveError(VerifyEnclaveErrorCode.invalid_input, 'Invalid or missing inputs'),
      )
    })

    it('Should throw a VerifyEnclaveError when publicKeys is empty', async () => {
      const enclave = getEnclave({ ...enclaveResponse, publicKeys: [] })

      await expect(enclave.verify()).rejects.toThrow(
        new VerifyEnclaveError(VerifyEnclaveErrorCode.invalid_input, 'Invalid or missing inputs'),
      )
    })

    it('Should throw a VerifyEnclaveError when iasCertChain is undefined', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enclave = getEnclave({ ...enclaveResponse, iasCertChain: undefined as any })

      await expect(enclave.verify()).rejects.toThrow(
        new VerifyEnclaveError(VerifyEnclaveErrorCode.invalid_input, 'Invalid or missing inputs'),
      )
    })

    it('Should throw a VerifyEnclaveError when iasCertChain is null', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enclave = getEnclave({ ...enclaveResponse, iasCertChain: null as any })

      await expect(enclave.verify()).rejects.toThrow(
        new VerifyEnclaveError(VerifyEnclaveErrorCode.invalid_input, 'Invalid or missing inputs'),
      )
    })

    it('Should throw a VerifyEnclaveError when iasCertChain is empty', async () => {
      const enclave = getEnclave({ ...enclaveResponse, iasCertChain: '' })

      await expect(enclave.verify()).rejects.toThrow(
        new VerifyEnclaveError(VerifyEnclaveErrorCode.invalid_input, 'Invalid or missing inputs'),
      )
    })

    it('Should throw a VerifyEnclaveError when iasReport is undefined', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enclave = getEnclave({ ...enclaveResponse, iasReport: undefined as any })

      await expect(enclave.verify()).rejects.toThrow(
        new VerifyEnclaveError(VerifyEnclaveErrorCode.invalid_input, 'Invalid or missing inputs'),
      )
    })

    it('Should throw a VerifyEnclaveError when iasReport is null', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enclave = getEnclave({ ...enclaveResponse, iasReport: null as any })

      await expect(enclave.verify()).rejects.toThrow(
        new VerifyEnclaveError(VerifyEnclaveErrorCode.invalid_input, 'Invalid or missing inputs'),
      )
    })

    it('Should throw a VerifyEnclaveError when iasReport is empty', async () => {
      const enclave = getEnclave({ ...enclaveResponse, iasReport: '' })

      await expect(enclave.verify()).rejects.toThrow(
        new VerifyEnclaveError(VerifyEnclaveErrorCode.invalid_input, 'Invalid or missing inputs'),
      )
    })

    it('Should throw a VerifyEnclaveError when iasSignature is undefined', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enclave = getEnclave({ ...enclaveResponse, iasSignature: undefined as any })

      await expect(enclave.verify()).rejects.toThrow(
        new VerifyEnclaveError(VerifyEnclaveErrorCode.invalid_input, 'Invalid or missing inputs'),
      )
    })

    it('Should throw a VerifyEnclaveError when iasSignature is null', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enclave = getEnclave({ ...enclaveResponse, iasSignature: null as any })

      await expect(enclave.verify()).rejects.toThrow(
        new VerifyEnclaveError(VerifyEnclaveErrorCode.invalid_input, 'Invalid or missing inputs'),
      )
    })

    it('Should throw a VerifyEnclaveError when iasSignature is empty', async () => {
      const enclave = getEnclave({ ...enclaveResponse, iasSignature: '' })

      await expect(enclave.verify()).rejects.toThrow(
        new VerifyEnclaveError(VerifyEnclaveErrorCode.invalid_input, 'Invalid or missing inputs'),
      )
    })

    it('Should throw a default error when error in catch clause is not an Error instance', async () => {
      const verifySignatureSpy = jest.spyOn(sgx, 'verifySignature').mockRejectedValueOnce('dummy-error')

      const enclave = await getVerifiedEnclave()

      await expect(enclave.verify()).rejects.toThrow(
        new VerifyEnclaveError(VerifyEnclaveErrorCode.default, DEFAULT_ERROR_MESSAGE),
      )
      expect(verifySignatureSpy).toHaveBeenCalledTimes(1)
      expect(verifySignatureSpy).toHaveBeenCalledWith(
        enclave.data.iasCertChain,
        enclave.data.iasReport,
        enclave.data.iasSignature,
      )
    })

    it('Should throw a VerifyEnclaveError for an invalid certificate common name', async () => {
      const cert = (
        await fs.promises.readFile(path.join(__dirname, '../test/certificates/invalid-common-name-cert.pem'))
      ).toString()

      const enclave = getEnclave({ ...enclaveResponse, iasCertChain: cert })

      await expect(enclave.verify()).rejects.toThrow(
        new VerifyEnclaveError(
          VerifyEnclaveErrorCode.invalid_certificate_common_name,
          'Certificate not trusted (invalid common name)',
        ),
      )
    })

    it('Should throw a VerifyEnclaveError for an invalid certificate chain', async () => {
      const cert = (await fs.promises.readFile(path.join(__dirname, '../test/certificates/common-cert.pem'))).toString()

      const enclave = getEnclave({ ...enclaveResponse, iasCertChain: cert })

      await expect(enclave.verify()).rejects.toThrow(
        new VerifyEnclaveError(
          VerifyEnclaveErrorCode.invalid_certificate_chain,
          'Certificate not trusted (invalid certificate chain)',
        ),
      )
    })

    it('Should throw a VerifyEnclaveError for an invalid signature', async () => {
      const verifySignatureSpy = jest.spyOn(sgx, 'verifySignature').mockResolvedValueOnce(false)

      const enclave = await getVerifiedEnclave()

      await expect(enclave.verify()).rejects.toThrow(
        new VerifyEnclaveError(
          VerifyEnclaveErrorCode.invalid_signature,
          'Remote attestation report not trusted (IAS signature invalid)',
        ),
      )
      expect(verifySignatureSpy).toHaveBeenCalledTimes(1)
      expect(verifySignatureSpy).toHaveBeenCalledWith(
        enclave.data.iasCertChain,
        enclave.data.iasReport,
        enclave.data.iasSignature,
      )
    })

    it('Should throw a VerifyEnclaveError for an invalid report data', async () => {
      const verifySignatureSpy = jest.spyOn(sgx, 'verifySignature').mockResolvedValueOnce(true)
      const verifyReportDataSpy = jest.spyOn(sgx, 'verifyReportData').mockResolvedValueOnce(false)

      const enclave = await getVerifiedEnclave()

      await expect(enclave.verify()).rejects.toThrow(
        new VerifyEnclaveError(VerifyEnclaveErrorCode.invalid_report_data, 'Report data is not what we expected'),
      )
      expect(verifySignatureSpy).toHaveBeenCalledTimes(1)
      expect(verifySignatureSpy).toHaveBeenCalledWith(
        enclave.data.iasCertChain,
        enclave.data.iasReport,
        enclave.data.iasSignature,
      )
      expect(verifyReportDataSpy).toHaveBeenCalledTimes(1)
      expect(verifyReportDataSpy).toHaveBeenCalledWith(enclave.data.publicKeys, enclave.data.iasReport)
    })

    it('Should throw a VerifyEnclaveError for a not trusted enclave', async () => {
      const verifySignatureSpy = jest.spyOn(sgx, 'verifySignature').mockResolvedValueOnce(true)
      const verifyRemoteAttestationSpy = jest.spyOn(sgx, 'verifyRemoteAttestation').mockReturnValueOnce(false)

      const enclave = await getVerifiedEnclave()

      await expect(enclave.verify()).rejects.toThrow(
        new VerifyEnclaveError(VerifyEnclaveErrorCode.invalid_remote_attestation, 'Enclave not trusted'),
      )
      expect(verifySignatureSpy).toHaveBeenCalledTimes(1)
      expect(verifySignatureSpy).toHaveBeenCalledWith(
        enclave.data.iasCertChain,
        enclave.data.iasReport,
        enclave.data.iasSignature,
      )
      expect(verifyRemoteAttestationSpy).toHaveBeenCalledTimes(1)
      expect(verifyRemoteAttestationSpy).toHaveBeenCalledWith(enclave.data.iasReport)
    })

    it('Should throw a VerifyEnclaveError for an invalid MRSIGNER', async () => {
      const verifySignatureSpy = jest.spyOn(sgx, 'verifySignature').mockResolvedValueOnce(true)
      const verifyMRSignerSpy = jest.spyOn(sgx, 'verifyMRSigner').mockReturnValueOnce(false)

      const enclave = await getVerifiedEnclave()

      await expect(enclave.verify()).rejects.toThrow(
        new VerifyEnclaveError(
          VerifyEnclaveErrorCode.invalid_mr_signer,
          'Invalid MRSIGNER value in remote attestation report',
        ),
      )
      expect(verifySignatureSpy).toHaveBeenCalledTimes(1)
      expect(verifySignatureSpy).toHaveBeenCalledWith(
        enclave.data.iasCertChain,
        enclave.data.iasReport,
        enclave.data.iasSignature,
      )
      expect(verifyMRSignerSpy).toHaveBeenCalledTimes(1)
      expect(verifyMRSignerSpy).toHaveBeenCalledWith(enclave.data.iasReport, MRSIGNER)
    })

    it('Should throw a VerifyEnclaveError for an invalid MRENCLAVE', async () => {
      const verifySignatureSpy = jest.spyOn(sgx, 'verifySignature').mockResolvedValueOnce(true)
      const verifyMREnclaveSpy = jest.spyOn(sgx, 'verifyMREnclave').mockReturnValueOnce(false)

      const enclave = await getVerifiedEnclave()

      await expect(enclave.verify()).rejects.toThrow(
        new VerifyEnclaveError(
          VerifyEnclaveErrorCode.invalid_mr_enclave,
          'Invalid MRENCLAVE value in remote attestation report',
        ),
      )
      expect(verifySignatureSpy).toHaveBeenCalledTimes(1)
      expect(verifySignatureSpy).toHaveBeenCalledWith(
        enclave.data.iasCertChain,
        enclave.data.iasReport,
        enclave.data.iasSignature,
      )
      expect(verifyMREnclaveSpy).toHaveBeenCalledTimes(1)
      expect(verifyMREnclaveSpy).toHaveBeenCalledWith(enclave.data.iasReport, MRENCLAVES)
    })

    it('Should throw a VerifyEnclaveError for an enclave in debug mode', async () => {
      const verifySignatureSpy = jest.spyOn(sgx, 'verifySignature').mockResolvedValueOnce(true)
      const getEnclaveDebugModeSpy = jest.spyOn(sgx, 'getEnclaveDebugMode').mockReturnValueOnce(true)

      const enclave = await getVerifiedEnclave()

      await expect(enclave.verify()).rejects.toThrow(
        new VerifyEnclaveError(VerifyEnclaveErrorCode.invalid_enclave_mode, 'Enclave in debug mode'),
      )
      expect(verifySignatureSpy).toHaveBeenCalledTimes(1)
      expect(verifySignatureSpy).toHaveBeenCalledWith(
        enclave.data.iasCertChain,
        enclave.data.iasReport,
        enclave.data.iasSignature,
      )
      expect(getEnclaveDebugModeSpy).toHaveBeenCalledTimes(1)
      expect(getEnclaveDebugModeSpy).toHaveBeenCalledWith(enclave.data.iasReport)
    })

    it('Should return nothing for a verified enclave', async () => {
      const enclave = await getVerifiedEnclave()

      expect(await enclave.verify()).toBe(undefined)
    })
  })
})

async function getVerifiedEnclave(): Promise<EnclaveResource> {
  const iasCertChain = (
    await fs.promises.readFile(path.join(__dirname, '../test/certificates/ias-cert-chain.pem'))
  ).toString()

  const iasReportJSON = {
    nonce: '787e7f38e17640078ff472f85dc06e3e',
    id: '167557513025215145104564374667827330357',
    timestamp: '2023-03-17T11:18:00.835571',
    version: 4,
    epidPseudonym:
      'cg3KwU5kxLSnczWYILR9kGfQ30/eU3MeKvNGvJAZKZj3xuOw1qjlXdhNwXHOutqCPU8nROdBkrUxNq2A5r5ryk3H6MPSDZPaXNm0Xzj7E+kM+9ejPx8QgRs72YhgmBaHzD5BYUA+Uxf21mKGUi50gvqSAoYShXtGstX9/bB3RLw=',
    advisoryURL: 'https://security-center.intel.com',
    advisoryIDs: [ADVISORY_ID_LVI, ADVISORY_ID_MMIO],
    isvEnclaveQuoteStatus: ENCLAVE_QUOTE_STATUS_SW_HARDENING_NEEDED,
    isvEnclaveQuoteBody:
      'AgABAIAMAAANAA0AAAAAAH17SCpKogmbS3YfM613OmkAAAAAAAAAAAAAAAAAAAAAFBQLB/+ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAHAAAAAAAAALzl+3Bh/8/QtznHTdtJMySZi2YrUC+uqBtqJXA+5VtgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABGO+UXwfKS4s9aMo2GXwPny8xDVeIBSEw5/tvVVTToSQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACU3dm6Un8kLxKUAjVp4ulyvagAXoXkFqhwWIhKrKS7wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  }

  const enclave = getEnclave({
    ...enclaveResponse,
    publicKeys: [
      {
        publicKey: 'f19251c62915ecdf50d5c2d55584c7ef8cb5b05d33dc92a24f21478d968eaacc',
        algorithm: EnclavePublicKeyAlgorithm.ED25519,
        usage: EnclavePublicKeyUsage.SIGNING,
      },
      {
        publicKey: '0209b4bed85286bf73db709b76cd94f434fca32b986c904dc8e260c29a379002a4',
        algorithm: EnclavePublicKeyAlgorithm.SECP256K1,
        usage: EnclavePublicKeyUsage.SIGNING,
      },
      {
        publicKey:
          '19b10e9e009581dbfb8edc3a39dbcd00989b11b581b678870a45e0d5b082b7ad1b40be4e0a0fe020500938c687c3184d458df15179588ac0c37f4d63ea31cb6d',
        algorithm: EnclavePublicKeyAlgorithm.SECP256R1,
        usage: EnclavePublicKeyUsage.PROVISIONING,
      },
    ],
    iasCertChain,
    iasReport: encodeURIComponent(JSON.stringify(iasReportJSON)),
    iasSignature:
      'TCwxxahHR1OBeNIxSOSWIwXbR4pa/AD5pqecy2wu79iDlgKKdehqjUTgZBpczMzth6VM+FKBKYRlEV1Go69Z4O+8B6X+ShCYXqPvKvQv9wN1Aon5PzIV6IDuMfX70gEp8ety57smiSlkSaxUQkm7tgwF4mCasGC0ztnMmantyBrl7OzknSUiqqv9p7firLN77/x0/u7fh+wNuG+dH0VMi5IOZH/xAWA0JaXLWt2vMgsPeRNmHYaCFQnn1UWTS9+JhoSZMb45NHPFL3YLZnHz/w//gHQeHBxtX98n4ceK54/i7OxL/u3KW0cZYaXb1oSLv7IFNj4OkDf7SsgXOaLD6w==',
  })

  return enclave
}
