import cbor from 'cbor'
import crypto from 'crypto'
import {
  ADVISORY_ID_LVI,
  ADVISORY_ID_MMIO,
  ENCLAVE_QUOTE_STATUS_OK,
  ENCLAVE_QUOTE_STATUS_SW_HARDENING_NEEDED,
  HASH_ALGORITHM,
  RSA_SIGNATURE_SCHEME,
  SGX_FLAGS_INITTED,
  SGX_FLAGS_DEBUG,
  SGX_FLAGS_MODE64BIT,
  SGX_FLAGS_PROVISION_KEY,
  SGX_FLAGS_EINITTOKEN_KEY,
  SGX_FLAGS_KSS,
} from '../constants'
import {
  arrayBufferFromDataView,
  arrayBuffersEqual,
  base64ToArrayBuffer,
  checkLength,
  dvsEqual,
  hexToArrayBuffer,
  stringToArrayBuffer,
} from './array-buffer'
import { parseCertChain } from './certificate'
import { EnclavePublicKey } from '../enclaves'

type SGXAttributes = {
  flags: {
    INITTED: boolean
    DEBUG: boolean
    MODE64BIT: boolean
    PROVISION_KEY: boolean
    EINITTOKEN_KEY: boolean
    KSS: boolean
  }
  xfrm: number
}

type SGXReportBody = {
  cpu_svn: ArrayBuffer
  misc_select: number
  isv_ext_prod_id: ArrayBuffer
  attributes: SGXAttributes
  mr_enclave: ArrayBuffer
  mr_signer: ArrayBuffer
  config_id: ArrayBuffer
  isv_prod_id: number
  isv_svn: number
  config_svn: number
  isv_family_id: ArrayBuffer
  report_data: ArrayBuffer
}

type SGXQuoteBody = {
  version: number
  sign_type: number
  epid_group_id: ArrayBuffer
  qe_svn: number
  pce_svn: number
  xeid: number
  basename: ArrayBuffer
  report_body: SGXReportBody
}

export function getEnclaveDebugMode(iasReportEncoded: string): boolean {
  const iasReport = decodeURIComponent(iasReportEncoded)
  const raResponse = JSON.parse(iasReport)
  const quoteBodyBuf = base64ToArrayBuffer(raResponse.isvEnclaveQuoteBody)
  const quoteBody = parseQuoteBody(new DataView(quoteBodyBuf))
  return quoteBody.report_body.attributes.flags.DEBUG
}

export function parseAttributes(dv: DataView): SGXAttributes {
  const flags = dv.getUint32(0, true)
  const xfrm = dv.getUint32(8, true)
  return {
    flags: {
      INITTED: (flags & SGX_FLAGS_INITTED) > 0,
      DEBUG: (flags & SGX_FLAGS_DEBUG) > 0,
      MODE64BIT: (flags & SGX_FLAGS_MODE64BIT) > 0,
      PROVISION_KEY: (flags & SGX_FLAGS_PROVISION_KEY) > 0,
      EINITTOKEN_KEY: (flags & SGX_FLAGS_EINITTOKEN_KEY) > 0,
      KSS: (flags & SGX_FLAGS_KSS) > 0,
    },
    xfrm,
  }
}

export function parseQuoteBody(dv: DataView): SGXQuoteBody {
  checkLength(dv, 432)
  return {
    version: dv.getUint16(0, true),
    sign_type: dv.getUint16(2, true),
    epid_group_id: arrayBufferFromDataView(dv, 4, 4),
    qe_svn: dv.getUint16(8, true),
    pce_svn: dv.getUint16(10, true),
    xeid: dv.getUint32(12, true),
    basename: arrayBufferFromDataView(dv, 16, 32),
    report_body: parseReportBody(new DataView(dv.buffer, dv.byteOffset + 48, 384)),
  }
}

export function parseReportBody(dv: DataView): SGXReportBody {
  checkLength(dv, 384)
  return {
    cpu_svn: arrayBufferFromDataView(dv, 0, 16),
    misc_select: dv.getUint32(16, true),
    isv_ext_prod_id: arrayBufferFromDataView(dv, 32, 16),
    attributes: parseAttributes(new DataView(dv.buffer, dv.byteOffset + 48, 16)),
    mr_enclave: arrayBufferFromDataView(dv, 64, 32),
    mr_signer: arrayBufferFromDataView(dv, 128, 32),
    config_id: arrayBufferFromDataView(dv, 192, 64),
    isv_prod_id: dv.getUint16(256, true),
    isv_svn: dv.getUint16(258, true),
    config_svn: dv.getUint16(260, true),
    isv_family_id: arrayBufferFromDataView(dv, 304, 16),
    report_data: arrayBufferFromDataView(dv, 320, 64),
  }
}

export function verifyMREnclave(iasReportEncoded: string, mrEnclavesHex: string[]): boolean {
  const iasReport = decodeURIComponent(iasReportEncoded)
  const raResponse = JSON.parse(iasReport)
  const quoteBodyBuf = base64ToArrayBuffer(raResponse.isvEnclaveQuoteBody)
  const quoteBody = parseQuoteBody(new DataView(quoteBodyBuf))
  let mrEnclaveOK = false
  const mrEnclaves = mrEnclavesHex.map(hexToArrayBuffer)
  for (const mrEnclave of mrEnclaves) {
    if (arrayBuffersEqual(quoteBody.report_body.mr_enclave, mrEnclave)) {
      mrEnclaveOK = true
      break
    }
  }
  return mrEnclaveOK
}

export function verifyMRSigner(iasReportEncoded: string, mrSignerHex: string): boolean {
  const iasReport = decodeURIComponent(iasReportEncoded)
  const raResponse = JSON.parse(iasReport)
  const quoteBodyBuf = base64ToArrayBuffer(raResponse.isvEnclaveQuoteBody)
  const quoteBody = parseQuoteBody(new DataView(quoteBodyBuf))
  const mrSigner = hexToArrayBuffer(mrSignerHex)
  return arrayBuffersEqual(quoteBody.report_body.mr_signer, mrSigner)
}

export function verifyRemoteAttestation(iasReportEncoded: string): boolean {
  const iasReport = decodeURIComponent(iasReportEncoded)
  const raResponse = JSON.parse(iasReport)

  if (raResponse.isvEnclaveQuoteStatus !== ENCLAVE_QUOTE_STATUS_OK) {
    const swHardeningNeeded = raResponse.isvEnclaveQuoteStatus === ENCLAVE_QUOTE_STATUS_SW_HARDENING_NEEDED
    const lvi = raResponse.advisoryIDs.includes(ADVISORY_ID_LVI)
    const mmio = raResponse.advisoryIDs.includes(ADVISORY_ID_MMIO)
    const allowedStatus = swHardeningNeeded && raResponse.advisoryIDs.length === 2 && lvi && mmio
    if (!allowedStatus) {
      return false
    }
  }

  return true
}

export async function verifyReportData(publicKeys: EnclavePublicKey[], iasReportEncoded: string): Promise<boolean> {
  const iasReport = decodeURIComponent(iasReportEncoded)

  const raResponse = JSON.parse(iasReport)
  const quoteBodyBuf = base64ToArrayBuffer(raResponse.isvEnclaveQuoteBody)
  const quoteBody = parseQuoteBody(new DataView(quoteBodyBuf))

  const reportDataInputObj: Record<string, ArrayBuffer> = {}
  for (const { algorithm, usage, publicKey } of publicKeys) {
    reportDataInputObj[`${algorithm.toLowerCase()}_${usage.toLowerCase()}_pkey`] = hexToArrayBuffer(publicKey)
  }
  const reportDataInputObjKeysSorted = Object.keys(reportDataInputObj)
    .sort()
    .reduce((acc: Record<string, ArrayBuffer>, key: string) => {
      acc[key] = reportDataInputObj[key]
      return acc
    }, {})
  const reportDataInput = cbor.encode(reportDataInputObjKeysSorted)

  // The report data is the hash of the concatenation of the public keys
  const hash = await crypto.subtle.digest(HASH_ALGORITHM, reportDataInput)
  const expectedReportDataUints = new Uint8Array(64)
  const expectedReportData = new DataView(expectedReportDataUints.buffer)
  // The first half should be the hash, the second half should be empty
  expectedReportDataUints.set(new Uint8Array(hash), 0)

  return dvsEqual(new DataView(quoteBody.report_body.report_data), expectedReportData)
}

export async function verifySignature(
  iasCertChainString: string,
  iasReportEncoded: string,
  iasSignatureBase64: string,
): Promise<boolean> {
  const iasCertChain = parseCertChain(iasCertChainString)
  const iasReport = decodeURIComponent(iasReportEncoded)
  const iasSignature = base64ToArrayBuffer(iasSignatureBase64)

  // Extract IAS's public key from the certificate
  const iasPubKey = await crypto.subtle.importKey(
    'spki',
    iasCertChain[0].subjectPublicKeyInfo.toSchema().toBER(),
    {
      name: RSA_SIGNATURE_SCHEME,
      hash: HASH_ALGORITHM,
    },
    true,
    ['verify'],
  )

  // Verify the signature
  const signatureVerificationSuccess = await crypto.subtle.verify(
    RSA_SIGNATURE_SCHEME,
    iasPubKey,
    iasSignature,
    stringToArrayBuffer(iasReport),
  )
  return signatureVerificationSuccess
}
