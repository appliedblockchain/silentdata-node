import { baseUrl } from './mocks/server'
import {
  silentdata,
  CheckType,
  CheckBlockchain,
  CheckCountry,
  CheckErrorCode,
  EnclavePublicKeyAlgorithm,
  EnclavePublicKeyUsage,
  VerifyCheckError,
  VerifyCheckErrorCode,
  VerifyEnclaveError,
  VerifyEnclaveErrorCode,
} from '../src/index'

const silentdataConfigDummy = {
  baseUrl,
  clientId: 'dummy-client-id',
  clientSecret: 'dummy-client-secret',
}

describe('index', () => {
  it('Should import main function', () => {
    const silentdataClient = silentdata(silentdataConfigDummy)

    expect(silentdataClient).toBeTruthy()
  })

  it('Should import check type enum', () => {
    expect(CheckType.balance).toBe('balance')
    expect(CheckType.income).toBe('income')
    expect(CheckType.instagram).toBe('instagram')
    expect(CheckType.kyc).toBe('kyc')
    expect(Object.keys(CheckType).length).toBe(4)
  })

  it('Should import check blockchain enum', () => {
    expect(CheckBlockchain.algorand).toBe('ALGORAND')
    expect(CheckBlockchain.polkadot).toBe('POLKADOT')
    expect(CheckBlockchain.solana).toBe('SOLANA')
    expect(Object.keys(CheckBlockchain).length).toBe(3)
  })

  it('Should import check country enum', () => {
    expect(CheckCountry.ca).toBe('CA')
    expect(CheckCountry.de).toBe('DE')
    expect(CheckCountry.es).toBe('ES')
    expect(CheckCountry.fr).toBe('FR')
    expect(CheckCountry.gb).toBe('GB')
    expect(CheckCountry.ie).toBe('IE')
    expect(CheckCountry.it).toBe('IT')
    expect(CheckCountry.nl).toBe('NL')
    expect(CheckCountry.us).toBe('US')
    expect(Object.keys(CheckCountry).length).toBe(9)
  })

  it('Should import check error enum', () => {
    expect(CheckErrorCode.account_match_failed).toBe('ACCOUNT_MATCH_FAILED')
    expect(CheckErrorCode.account_numbers_missing).toBe('ACCOUNT_NUMBERS_MISSING')
    expect(CheckErrorCode.connection_error).toBe('CONNECTION_ERROR')
    expect(CheckErrorCode.requirements_not_met).toBe('REQUIREMENTS_NOT_MET')
    expect(Object.keys(CheckErrorCode).length).toBe(4)
  })

  it('Should import enclave publicKey algorithm enum', () => {
    expect(EnclavePublicKeyAlgorithm.ED25519).toBe('ED25519')
    expect(EnclavePublicKeyAlgorithm.SECP256K1).toBe('SECP256K1')
    expect(EnclavePublicKeyAlgorithm.SECP256R1).toBe('SECP256R1')
    expect(EnclavePublicKeyAlgorithm.SR25519).toBe('SR25519')
    expect(EnclavePublicKeyAlgorithm.RSA).toBe('RSA')
    expect(Object.keys(EnclavePublicKeyAlgorithm).length).toBe(5)
  })

  it('Should import enclave publicKey usage enum', () => {
    expect(EnclavePublicKeyUsage.ECDH).toBe('ECDH')
    expect(EnclavePublicKeyUsage.PROVISIONING).toBe('PROVISIONING')
    expect(EnclavePublicKeyUsage.SIGNING).toBe('SIGNING')
    expect(Object.keys(EnclavePublicKeyUsage).length).toBe(3)
  })

  it('Should import VerifyCheckError', () => {
    const code = VerifyCheckErrorCode.default
    const message = 'dummy message'
    const err = new VerifyCheckError(code, message)

    expect(err.code).toBe(code)
    expect(err.message).toBe(message)
  })

  it('Should import VerifyEnclaveError', () => {
    const code = VerifyEnclaveErrorCode.default
    const message = 'dummy message'
    const err = new VerifyEnclaveError(code, message)

    expect(err.code).toBe(code)
    expect(err.message).toBe(message)
  })

  it('Should import verify check error enum', () => {
    expect(VerifyCheckErrorCode.default).toBe('DEFAULT')
    expect(VerifyCheckErrorCode.invalid_input).toBe('INVALID_INPUT')
    expect(VerifyCheckErrorCode.invalid_signature).toBe('INVALID_SIGNATURE')
    expect(Object.keys(VerifyCheckErrorCode).length).toBe(3)
  })

  it('Should import verify enclave error enum', () => {
    expect(VerifyEnclaveErrorCode.default).toBe('DEFAULT')
    expect(VerifyEnclaveErrorCode.invalid_input).toBe('INVALID_INPUT')
    expect(VerifyEnclaveErrorCode.invalid_certificate_common_name).toBe('INVALID_CERTIFICATE_COMMON_NAME')
    expect(VerifyEnclaveErrorCode.invalid_certificate_chain).toBe('INVALID_CERTIFICATE_CHAIN')
    expect(VerifyEnclaveErrorCode.invalid_signature).toBe('INVALID_SIGNATURE')
    expect(VerifyEnclaveErrorCode.invalid_report_data).toBe('INVALID_REPORT_DATA')
    expect(VerifyEnclaveErrorCode.invalid_remote_attestation).toBe('INVALID_REMOTE_ATTESTATION')
    expect(VerifyEnclaveErrorCode.invalid_mr_signer).toBe('INVALID_MR_SIGNER')
    expect(VerifyEnclaveErrorCode.invalid_mr_enclave).toBe('INVALID_MR_ENCLAVE')
    expect(VerifyEnclaveErrorCode.invalid_enclave_mode).toBe('INVALID_ENCLAVE_MODE')
    expect(Object.keys(VerifyEnclaveErrorCode).length).toBe(10)
  })
})
