export const ADVISORY_ID_LVI = 'INTEL-SA-00334'
export const ADVISORY_ID_MMIO = 'INTEL-SA-00615'
export const ENCLAVE_QUOTE_STATUS_OK = 'OK'
export const ENCLAVE_QUOTE_STATUS_SW_HARDENING_NEEDED = 'SW_HARDENING_NEEDED'
export const DEFAULT_ERROR_MESSAGE = 'Something went wrong'
export const HASH_ALGORITHM = 'SHA-256'
export const MRENCLAVES = [
  '7ad494559a91e0bac7940fbb4b5033818b0702c256e9bc7c1dfd0ee30e19915d',
  'bce5fb7061ffcfd0b739c74ddb493324998b662b502faea81b6a25703ee55b60',
]
export const MRSIGNER = '463be517c1f292e2cf5a328d865f03e7cbcc4355e201484c39fedbd55534e849'
export const SGX_FLAGS_INITTED = 0x00000001 /* If set, then the enclave is initialized */
export const SGX_FLAGS_DEBUG = 0x00000002 /* If set, then the enclave is debug */
export const SGX_FLAGS_MODE64BIT = 0x00000004 /* If set, then the enclave is 64 bit */
export const SGX_FLAGS_PROVISION_KEY = 0x00000010 /* If set, then the enclave has access to provision key */
export const SGX_FLAGS_EINITTOKEN_KEY = 0x00000020 /* If set, then the enclave has access to EINITTOKEN key */
export const SGX_FLAGS_KSS = 0x00000080 /* If set enclave uses KSS */
export const SGX_CERTIFICATE_NAME = 'Intel SGX Attestation Report Signing'
export const RSA_SIGNATURE_SCHEME = 'RSASSA-PKCS1-v1_5'
