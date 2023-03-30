import { baseUrl } from './mocks/server'
import * as checksModule from '../src/checks'
import * as enclavesModule from '../src/enclaves'
import * as httpClientModule from '../src/http-client'
import { silentdata } from '../src/silentdata'

const silentdataConfigDummy = {
  baseUrl,
  clientId: 'dummy-client-id',
  clientSecret: 'dummy-client-secret',
}

const httpClientInstance = jest.fn()

describe('silentdata', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('Should return an object', () => {
    const silentdataClient = silentdata(silentdataConfigDummy)

    expect(typeof silentdataClient).toBe('object')
    expect('checks' in silentdataClient).toBe(true)
    expect('enclaves' in silentdataClient).toBe(true)
    expect(Object.keys(silentdataClient).length).toBe(2)
  })

  it('Should return an object when config is undefined', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const silentdataClient = silentdata(undefined as any)

    expect(typeof silentdataClient).toBe('object')
    expect('checks' in silentdataClient).toBe(true)
    expect('enclaves' in silentdataClient).toBe(true)
    expect(Object.keys(silentdataClient).length).toBe(2)
  })

  it('Should return an object when config is null', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const silentdataClient = silentdata(null as any)

    expect(typeof silentdataClient).toBe('object')
    expect('checks' in silentdataClient).toBe(true)
    expect('enclaves' in silentdataClient).toBe(true)
    expect(Object.keys(silentdataClient).length).toBe(2)
  })

  it('Should call "httpClient" function', () => {
    const httpClientSpy = jest.spyOn(httpClientModule, 'httpClient')

    silentdata(silentdataConfigDummy)

    expect(httpClientSpy).toHaveBeenCalledTimes(1)
    expect(httpClientSpy).toHaveBeenCalledWith({
      baseUrl: expect.any(String),
      headers: { 'x-client-id': silentdataConfigDummy.clientId, 'x-api-key': silentdataConfigDummy.clientSecret },
    })
  })

  describe('checks', () => {
    it('Should call "checks" function without defaults', () => {
      const checksSpy = jest.spyOn(checksModule, 'checks')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(httpClientModule, 'httpClient').mockReturnValue(httpClientInstance as any)

      silentdata(silentdataConfigDummy)

      expect(checksSpy).toHaveBeenCalledTimes(1)
      expect(checksSpy).toHaveBeenCalledWith(httpClientInstance, undefined)
    })

    it('Should call "checks" function with undefined defaults', () => {
      const checksSpy = jest.spyOn(checksModule, 'checks')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(httpClientModule, 'httpClient').mockReturnValue(httpClientInstance as any)

      silentdata(silentdataConfigDummy, undefined)

      expect(checksSpy).toHaveBeenCalledTimes(1)
      expect(checksSpy).toHaveBeenCalledWith(httpClientInstance, undefined)
    })

    it('Should call "checks" function with null defaults', () => {
      const checksSpy = jest.spyOn(checksModule, 'checks')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(httpClientModule, 'httpClient').mockReturnValue(httpClientInstance as any)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      silentdata(silentdataConfigDummy, null as any)

      expect(checksSpy).toHaveBeenCalledTimes(1)
      expect(checksSpy).toHaveBeenCalledWith(httpClientInstance, undefined)
    })

    it('Should call "checks" function with defaults', () => {
      const checksSpy = jest.spyOn(checksModule, 'checks')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(httpClientModule, 'httpClient').mockReturnValue(httpClientInstance as any)

      const checksDefaults = { checks: { redirectUrl: 'https://example.com/' } }

      silentdata(silentdataConfigDummy, checksDefaults)

      expect(checksSpy).toHaveBeenCalledTimes(1)
      expect(checksSpy).toHaveBeenCalledWith(httpClientInstance, checksDefaults.checks)
    })
  })

  describe('enclaves', () => {
    it('Should call "enclaves" function', () => {
      const enclavesSpy = jest.spyOn(enclavesModule, 'enclaves')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(httpClientModule, 'httpClient').mockReturnValue(httpClientInstance as any)

      silentdata(silentdataConfigDummy)

      expect(enclavesSpy).toHaveBeenCalledTimes(1)
      expect(enclavesSpy).toHaveBeenCalledWith(httpClientInstance)
    })
  })
})
