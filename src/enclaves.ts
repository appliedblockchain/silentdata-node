import { DEFAULT_ERROR_MESSAGE } from './constants'
import { VerifyEnclaveError, VerifyEnclaveErrorCode } from './Error'
import { HTTPClient } from './http-client'
import { verifyEnclave } from './verify'

export enum EnclavePublicKeyAlgorithm {
  ED25519 = 'ED25519',
  SECP256K1 = 'SECP256K1',
  SECP256R1 = 'SECP256R1',
  SR25519 = 'SR25519',
  RSA = 'RSA',
}

export enum EnclavePublicKeyUsage {
  ECDH = 'ECDH',
  PROVISIONING = 'PROVISIONING',
  SIGNING = 'SIGNING',
}

export type EnclavePublicKey = {
  publicKey: string
  algorithm: EnclavePublicKeyAlgorithm
  usage: EnclavePublicKeyUsage
}

export type EnclaveResource = {
  data: {
    date: string
    mrenclave: string
    iasCertChain: string
    iasReport: string
    iasSignature: string
    publicKeys: EnclavePublicKey[]
  }
  isActive: () => boolean
  isRevoked: () => boolean
  isRetired: () => boolean
  verify: () => Promise<void>
}

export type EnclaveReadRequest = {
  signingKey: string
}

export type EnclaveReadResponse = {
  data: {
    enclave: EnclaveResource
  }
}

export type Enclaves = {
  read({ signingKey }: EnclaveReadRequest): Promise<EnclaveReadResponse>
}

type EnclaveReadAPIResponse = {
  createdAt: string
  status: string
  mrenclave: string
  iasCertChain: string
  iasReport: string
  iasSignature: string
  publicKeys: {
    publicKey: string
    algorithm: string
    usage: string
  }[]
}

export function getEnclave({
  createdAt,
  status,
  mrenclave,
  iasCertChain,
  iasReport,
  iasSignature,
  publicKeys,
}: EnclaveReadAPIResponse): EnclaveResource {
  const enclavePublicKeys = (publicKeys || []).map(({ publicKey, algorithm, usage }) => {
    return {
      publicKey,
      algorithm: algorithm as EnclavePublicKeyAlgorithm,
      usage: usage as EnclavePublicKeyUsage,
    }
  })
  const enclave: EnclaveResource = {
    data: {
      date: createdAt,
      mrenclave,
      iasCertChain,
      iasReport,
      iasSignature,
      publicKeys: enclavePublicKeys,
    },
    isActive: () => {
      return status === 'ACTIVE'
    },
    isRevoked: () => {
      return status === 'REVOKED'
    },
    isRetired: () => {
      return status === 'RETIRED'
    },
    verify: async () => {
      try {
        await verifyEnclave(enclavePublicKeys, iasCertChain, iasReport, iasSignature)
      } catch (err: unknown) {
        if (err instanceof VerifyEnclaveError) {
          throw err
        }
        throw new VerifyEnclaveError(VerifyEnclaveErrorCode.default, DEFAULT_ERROR_MESSAGE)
      }
    },
  }
  return enclave
}

export function enclaves(httpClient: HTTPClient): Enclaves {
  return {
    async read({ signingKey }: EnclaveReadRequest): Promise<EnclaveReadResponse> {
      const response = await httpClient.get<EnclaveReadAPIResponse>(`/enclaves/sig-public-key/${signingKey}`)
      return {
        data: {
          enclave: getEnclave(response.data),
        },
      }
    },
  }
}
