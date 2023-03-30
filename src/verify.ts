import path from 'path'
import nacl from 'tweetnacl'
import { VerifyCheckError, VerifyCheckErrorCode, VerifyEnclaveError, VerifyEnclaveErrorCode } from './Error'
import { EnclavePublicKey } from './enclaves'
import { MRENCLAVES, MRSIGNER, SGX_CERTIFICATE_NAME } from './constants'
import { verifyCertificateChain, verifyCertificateCommonName } from './utils/certificate'
import {
  getEnclaveDebugMode,
  verifyMREnclave,
  verifyMRSigner,
  verifyRemoteAttestation,
  verifyReportData,
  verifySignature,
} from './utils/sgx'

export function verifyCheck(rawDataHex?: string, signatureHex?: string, signingKeyHex?: string): void {
  if (!rawDataHex || !signatureHex || !signingKeyHex) {
    throw new VerifyCheckError(VerifyCheckErrorCode.invalid_input, 'Invalid or missing inputs')
  }

  const rawDataBytes = new Uint8Array(Buffer.from(rawDataHex, 'hex'))
  const signatureBytes = new Uint8Array(Buffer.from(signatureHex, 'hex'))
  const signingKeyBytes = new Uint8Array(Buffer.from(signingKeyHex, 'hex'))

  const verified = nacl.sign.detached.verify(rawDataBytes, signatureBytes, signingKeyBytes)
  if (!verified) {
    throw new VerifyCheckError(VerifyCheckErrorCode.invalid_signature, 'Invalid signature')
  }

  return
}

export async function verifyEnclave(
  publicKeys: EnclavePublicKey[],
  iasCertChainString: string,
  iasReportEncoded: string,
  iasSignatureBase64: string,
): Promise<void> {
  if (!publicKeys || publicKeys.length === 0 || !iasCertChainString || !iasReportEncoded || !iasSignatureBase64) {
    throw new VerifyEnclaveError(VerifyEnclaveErrorCode.invalid_input, 'Invalid or missing inputs')
  }

  if (!verifyCertificateCommonName(iasCertChainString, SGX_CERTIFICATE_NAME)) {
    throw new VerifyEnclaveError(
      VerifyEnclaveErrorCode.invalid_certificate_common_name,
      'Certificate not trusted (invalid common name)',
    )
  }

  const rootCACertPath = path.join(__dirname, '../certificates/ias-root-ca-cert.pem')
  const certificateChainVerified = await verifyCertificateChain(iasCertChainString, rootCACertPath)
  if (!certificateChainVerified) {
    throw new VerifyEnclaveError(
      VerifyEnclaveErrorCode.invalid_certificate_chain,
      'Certificate not trusted (invalid certificate chain)',
    )
  }

  const signatureVerified = await verifySignature(iasCertChainString, iasReportEncoded, iasSignatureBase64)
  if (!signatureVerified) {
    throw new VerifyEnclaveError(
      VerifyEnclaveErrorCode.invalid_signature,
      'Remote attestation report not trusted (IAS signature invalid)',
    )
  }

  const reportDataVerified = await verifyReportData(publicKeys, iasReportEncoded)
  if (!reportDataVerified) {
    throw new VerifyEnclaveError(VerifyEnclaveErrorCode.invalid_report_data, 'Report data is not what we expected')
  }

  if (!verifyRemoteAttestation(iasReportEncoded)) {
    throw new VerifyEnclaveError(VerifyEnclaveErrorCode.invalid_remote_attestation, 'Enclave not trusted')
  }

  if (!verifyMRSigner(iasReportEncoded, MRSIGNER)) {
    throw new VerifyEnclaveError(
      VerifyEnclaveErrorCode.invalid_mr_signer,
      'Invalid MRSIGNER value in remote attestation report',
    )
  }

  if (!verifyMREnclave(iasReportEncoded, MRENCLAVES)) {
    throw new VerifyEnclaveError(
      VerifyEnclaveErrorCode.invalid_mr_enclave,
      'Invalid MRENCLAVE value in remote attestation report',
    )
  }

  if (getEnclaveDebugMode(iasReportEncoded)) {
    throw new VerifyEnclaveError(VerifyEnclaveErrorCode.invalid_enclave_mode, 'Enclave in debug mode')
  }

  return
}
