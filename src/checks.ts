import cbor from 'cbor'
import { DEFAULT_ERROR_MESSAGE } from './constants'
import { VerifyCheckError, VerifyCheckErrorCode } from './Error'
import { HTTPClient } from './http-client'
import { verifyCheck } from './verify'

export enum CheckType {
  balance = 'balance',
  income = 'income',
  instagram = 'instagram',
  kyc = 'kyc',
}

export enum CheckBlockchain {
  algorand = 'ALGORAND',
  polkadot = 'POLKADOT',
  solana = 'SOLANA',
}

export enum CheckCountry {
  ca = 'CA',
  de = 'DE',
  es = 'ES',
  fr = 'FR',
  gb = 'GB',
  ie = 'IE',
  it = 'IT',
  nl = 'NL',
  us = 'US',
}

export enum CheckErrorCode {
  account_match_failed = 'ACCOUNT_MATCH_FAILED',
  account_numbers_missing = 'ACCOUNT_NUMBERS_MISSING',
  connection_error = 'CONNECTION_ERROR',
  requirements_not_met = 'REQUIREMENTS_NOT_MET',
}

type CheckCertificateData = {
  check_hash: Buffer
  id: string
  timestamp: number
  initiator_pkey: Buffer
  certificate_hash: Buffer
}

export type BalanceAndIncomeCheckCertificateData = {
  currency_code: string
  comparison_value: number
  server_timestamp: number
  server_common_name: string
} & CheckCertificateData

export type InstagramCheckCertificateData = {
  ig_username: string
  ig_account_type: string
} & CheckCertificateData

export type KYCCheckCertificateData = {
  check_timestamp: number
  subject_id: string
} & CheckCertificateData

export type CheckResource = {
  data: {
    id: string
    date: string
    signingKey?: string
    signature?: string
    rawData?: string
    error?: {
      code: CheckErrorCode
      message: string
    }
  }
  isCancelled: () => boolean
  isCompleted: () => boolean
  isError: () => boolean
  isPending: () => boolean
  isInProgress: () => boolean
  isCertified: () => boolean
  verify: () => void
  getCertificateDataAsJSON: () =>
    | BalanceAndIncomeCheckCertificateData
    | InstagramCheckCertificateData
    | KYCCheckCertificateData
    | null
}

export type CheckCreateRequestData = {
  blockchain: CheckBlockchain
  walletAddress: string
  redirectUrl?: string
  webhookUrl?: string
}

type BalanceCheckCreateRequestData = CheckCreateRequestData & {
  country: CheckCountry
  minimumBalance: number
}

type IncomeCheckCreateRequestData = CheckCreateRequestData & {
  country: CheckCountry
  minimumIncome: number
}

type BalanceCheckCreateRequest = {
  type: CheckType.balance
  data: BalanceCheckCreateRequestData
}

type IncomeCheckCreateRequest = {
  type: CheckType.income
  data: IncomeCheckCreateRequestData
}

type InstagramCheckCreateRequest = {
  type: CheckType.instagram
  data: CheckCreateRequestData
}

type KYCCheckCreateRequest = {
  type: CheckType.kyc
  data: CheckCreateRequestData
}

export type CheckCreateRequest =
  | BalanceCheckCreateRequest
  | IncomeCheckCreateRequest
  | InstagramCheckCreateRequest
  | KYCCheckCreateRequest

export type CheckCreateResponse = {
  data: {
    id: string
    url: string
  }
}

export type CheckReadRequest = {
  type: CheckType
  limit?: number
  offset?: number
}

export type CheckReadResponse = {
  data: {
    checks: CheckResource[]
  }
}

export type CheckReadByIdRequest = {
  type: CheckType
  id: string
}

export type CheckReadByIdResponse = {
  data: {
    check: CheckResource
  }
}

export type CheckDeleteRequest = {
  type: CheckType
  id: string
}

export type CheckDeleteResponse = {
  data: boolean
}

export type ChecksDefaults = {
  redirectUrl?: string
  webhookUrl?: string
}

export type Checks = {
  create({ type, data }: CheckCreateRequest): Promise<CheckCreateResponse>
  read({ type, limit, offset }: CheckReadRequest): Promise<CheckReadResponse>
  readById({ type, id }: CheckReadByIdRequest): Promise<CheckReadByIdResponse>
  delete({ type, id }: CheckDeleteRequest): Promise<CheckDeleteResponse>
}

type CheckCreateAPIResponse = {
  id: string
  url: string
}

type CheckReadAPIResponse = {
  id: string
  status: string
  success: boolean
  date: string
  signingKey?: string
  signature?: string
  rawData?: string
  error?: {
    code: string
    message: string
  }
}

type CheckDeleteAPIResponse = {
  success: boolean
}

export function getCheck({
  id,
  date,
  status,
  success,
  error,
  signingKey,
  signature,
  rawData,
}: CheckReadAPIResponse): CheckResource {
  const check: CheckResource = {
    data: {
      id,
      date,
    },
    isCancelled() {
      return status === 'CANCELLED'
    },
    isCompleted() {
      return status === 'COMPLETE'
    },
    isError() {
      return status === 'ERROR'
    },
    isInProgress() {
      return status === 'IN_PROGRESS'
    },
    isPending() {
      return status === 'PENDING'
    },
    isCertified() {
      return Boolean(success)
    },
    verify() {
      try {
        verifyCheck(rawData, signature, signingKey)
      } catch (err: unknown) {
        if (err instanceof VerifyCheckError) {
          throw err
        }
        throw new VerifyCheckError(VerifyCheckErrorCode.default, DEFAULT_ERROR_MESSAGE)
      }
    },
    getCertificateDataAsJSON() {
      return rawData ? cbor.decode(rawData) : null
    },
  }
  if (signingKey) {
    check.data.signingKey = signingKey
  }
  if (signature) {
    check.data.signature = signature
  }
  if (rawData) {
    check.data.rawData = rawData
  }
  if (error) {
    check.data.error = {
      code: error.code as CheckErrorCode,
      message: error.message,
    }
  }
  return check
}

export function getCreateData(
  data: CheckCreateRequestData | BalanceCheckCreateRequestData | IncomeCheckCreateRequestData,
  defaults?: ChecksDefaults,
): CheckCreateRequestData | BalanceCheckCreateRequestData | IncomeCheckCreateRequestData {
  return {
    ...data,
    redirectUrl: data.redirectUrl || defaults?.redirectUrl,
    webhookUrl: data.webhookUrl || defaults?.webhookUrl,
  }
}

export function checks(httpClient: HTTPClient, defaults?: ChecksDefaults): Checks {
  return {
    async create({ type, data }: CheckCreateRequest): Promise<CheckCreateResponse> {
      const response = await httpClient.post<CheckCreateAPIResponse>(`/checks/${type}`, getCreateData(data, defaults))
      const { id, url } = response.data
      return {
        data: {
          id,
          url,
        },
      }
    },
    async read({ type, limit, offset }: CheckReadRequest): Promise<CheckReadResponse> {
      const searchParams = new URLSearchParams()
      if (limit) {
        searchParams.append('limit', String(limit))
      }
      if (offset) {
        searchParams.append('offset', String(offset))
      }
      const response = await httpClient.get<CheckReadAPIResponse[]>(`/checks/${type}?${searchParams.toString()}`)
      return {
        data: {
          checks: response.data.map((checkData) => getCheck(checkData)),
        },
      }
    },
    async readById({ type, id }: CheckReadByIdRequest): Promise<CheckReadByIdResponse> {
      const response = await httpClient.get<CheckReadAPIResponse>(`/checks/${type}/${id}`)
      return {
        data: {
          check: getCheck(response.data),
        },
      }
    },
    async delete({ type, id }: CheckDeleteRequest): Promise<CheckDeleteResponse> {
      const response = await httpClient.delete<CheckDeleteAPIResponse>(`/checks/${type}/${id}`)
      const { success } = response.data
      return {
        data: success,
      }
    },
  }
}
