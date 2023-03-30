import { httpClient } from './http-client'
import { checks, Checks, ChecksDefaults } from './checks'
import { enclaves, Enclaves } from './enclaves'

export type SilentdataConfig = {
  baseUrl: string
  clientId: string
  clientSecret: string
}

export type SilentdataDefaults = {
  checks: ChecksDefaults
}

export type Silentdata = {
  checks: Checks
  enclaves: Enclaves
}

export function silentdata(config: SilentdataConfig, defaults?: SilentdataDefaults): Silentdata {
  const httpClnt = httpClient({
    baseUrl: config?.baseUrl,
    headers: { 'x-client-id': config?.clientId, 'x-api-key': config?.clientSecret },
  })

  return {
    checks: checks(httpClnt, defaults?.checks),
    enclaves: enclaves(httpClnt),
  }
}
