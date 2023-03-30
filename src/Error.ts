export enum VerifyCheckErrorCode {
  default = 'DEFAULT',
  invalid_input = 'INVALID_INPUT',
  invalid_signature = 'INVALID_SIGNATURE',
}

export enum VerifyEnclaveErrorCode {
  default = 'DEFAULT',
  invalid_input = 'INVALID_INPUT',
  invalid_certificate_common_name = 'INVALID_CERTIFICATE_COMMON_NAME',
  invalid_certificate_chain = 'INVALID_CERTIFICATE_CHAIN',
  invalid_signature = 'INVALID_SIGNATURE',
  invalid_report_data = 'INVALID_REPORT_DATA',
  invalid_remote_attestation = 'INVALID_REMOTE_ATTESTATION',
  invalid_mr_signer = 'INVALID_MR_SIGNER',
  invalid_mr_enclave = 'INVALID_MR_ENCLAVE',
  invalid_enclave_mode = 'INVALID_ENCLAVE_MODE',
}

export class VerifyCheckError extends Error {
  code: VerifyCheckErrorCode

  constructor(code: VerifyCheckErrorCode, message?: string) {
    super(message)
    this.code = code
  }
}

export class VerifyEnclaveError extends Error {
  code: VerifyEnclaveErrorCode

  constructor(code: VerifyEnclaveErrorCode, message?: string) {
    super(message)
    this.code = code
  }
}
