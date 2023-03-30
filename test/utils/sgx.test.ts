import {
  ADVISORY_ID_LVI,
  ADVISORY_ID_MMIO,
  ENCLAVE_QUOTE_STATUS_OK,
  ENCLAVE_QUOTE_STATUS_SW_HARDENING_NEEDED,
} from '../../src/constants'
import { parseQuoteBody, parseReportBody, verifyRemoteAttestation } from '../../src/utils/sgx'

describe('parseQuoteBody', () => {
  it('Should parse a valid data view', () => {
    const validDataView = new DataView(new ArrayBuffer(432))
    const result = parseQuoteBody(validDataView)

    expect(result).toHaveProperty('version')
    expect(result).toHaveProperty('sign_type')
    expect(result).toHaveProperty('epid_group_id')
    expect(result).toHaveProperty('qe_svn')
    expect(result).toHaveProperty('pce_svn')
    expect(result).toHaveProperty('xeid')
    expect(result).toHaveProperty('basename')
    expect(result).toHaveProperty('report_body')
    expect(Object.keys(result).length).toBe(8)
  })

  it('Should throw an error for an invalid data view', () => {
    const invalidDataView = new DataView(new ArrayBuffer(1))

    expect(() => parseQuoteBody(invalidDataView)).toThrow()
  })

  it('Should throw an error for data view with incorrect length', () => {
    const dataView = new DataView(new ArrayBuffer(10))

    expect(() => parseQuoteBody(dataView)).toThrow()
  })
})

describe('parseReportBody', () => {
  it('Should parse a valid data view', () => {
    const validDataView = new DataView(new ArrayBuffer(384))
    const result = parseReportBody(validDataView)

    expect(result).toHaveProperty('cpu_svn')
    expect(result).toHaveProperty('misc_select')
    expect(result).toHaveProperty('isv_ext_prod_id')
    expect(result).toHaveProperty('attributes')
    expect(result).toHaveProperty('mr_enclave')
    expect(result).toHaveProperty('mr_signer')
    expect(result).toHaveProperty('config_id')
    expect(result).toHaveProperty('isv_prod_id')
    expect(result).toHaveProperty('isv_svn')
    expect(result).toHaveProperty('config_svn')
    expect(result).toHaveProperty('isv_family_id')
    expect(result).toHaveProperty('report_data')
    expect(Object.keys(result).length).toBe(12)
  })

  it('Should throw an error for an invalid data view', () => {
    const invalidDataView = new DataView(new ArrayBuffer(1))

    expect(() => parseReportBody(invalidDataView)).toThrow()
  })

  it('Should throw an error for a data view with incorrect length', () => {
    const dataView = new DataView(new ArrayBuffer(10))

    expect(() => parseReportBody(dataView)).toThrow()
  })
})

describe('verifyRemoteAttestation', () => {
  it(`Should return true when enclave quote status is "${ENCLAVE_QUOTE_STATUS_OK}"`, () => {
    const iasReportEncoded = encodeURIComponent(
      JSON.stringify({
        isvEnclaveQuoteStatus: ENCLAVE_QUOTE_STATUS_OK,
      }),
    )

    expect(verifyRemoteAttestation(iasReportEncoded)).toBe(true)
  })

  it(`Should return true when enclave quote status is "${ENCLAVE_QUOTE_STATUS_SW_HARDENING_NEEDED}" and advisory ids includes ${ADVISORY_ID_LVI} and ${ADVISORY_ID_MMIO}`, () => {
    const iasReportEncoded = encodeURIComponent(
      JSON.stringify({
        isvEnclaveQuoteStatus: ENCLAVE_QUOTE_STATUS_SW_HARDENING_NEEDED,
        advisoryIDs: [ADVISORY_ID_LVI, ADVISORY_ID_MMIO],
      }),
    )

    expect(verifyRemoteAttestation(iasReportEncoded)).toBe(true)
  })

  it(`Should return false when enclave quote status is not "${ENCLAVE_QUOTE_STATUS_OK}" and not "${ENCLAVE_QUOTE_STATUS_SW_HARDENING_NEEDED}"`, () => {
    const iasReportEncoded = encodeURIComponent(
      JSON.stringify({
        isvEnclaveQuoteStatus: 'dummy-enclave-quote-status',
        advisoryIDs: [ADVISORY_ID_LVI, ADVISORY_ID_MMIO],
      }),
    )

    expect(verifyRemoteAttestation(iasReportEncoded)).toBe(false)
  })

  it(`Should return false when enclave quote status is "${ENCLAVE_QUOTE_STATUS_SW_HARDENING_NEEDED}" but advisoryIds array does not include ${ADVISORY_ID_LVI} or ${ADVISORY_ID_MMIO}`, () => {
    const iasReportEncodedWithSA00334 = encodeURIComponent(
      JSON.stringify({
        isvEnclaveQuoteStatus: ENCLAVE_QUOTE_STATUS_SW_HARDENING_NEEDED,
        advisoryIDs: [ADVISORY_ID_LVI, 'dummy-advisoryID'],
      }),
    )

    expect(verifyRemoteAttestation(iasReportEncodedWithSA00334)).toBe(false)

    const iasReportEncodedWithSA00615 = encodeURIComponent(
      JSON.stringify({
        isvEnclaveQuoteStatus: ENCLAVE_QUOTE_STATUS_SW_HARDENING_NEEDED,
        advisoryIDs: [ADVISORY_ID_MMIO, 'dummy-advisoryID'],
      }),
    )

    expect(verifyRemoteAttestation(iasReportEncodedWithSA00615)).toBe(false)
  })

  it(`Should return false when enclave quote status is "${ENCLAVE_QUOTE_STATUS_SW_HARDENING_NEEDED}" but advisoryIds array length is greater than 2`, () => {
    const iasReportEncoded = encodeURIComponent(
      JSON.stringify({
        isvEnclaveQuoteStatus: ENCLAVE_QUOTE_STATUS_SW_HARDENING_NEEDED,
        advisoryIDs: [ADVISORY_ID_LVI, ADVISORY_ID_MMIO, 'dummy-advisoryID'],
      }),
    )

    expect(verifyRemoteAttestation(iasReportEncoded)).toBe(false)
  })
})
