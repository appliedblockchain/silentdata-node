import axios from 'axios'
import { baseUrl } from './mocks/server'
import { DEFAULT_ERROR_MESSAGE } from '../src/constants'
import { httpClient, onRejected } from '../src/http-client'

const httpClientConfig = {
  baseUrl,
  headers: { 'x-client-id': 'dummy-client-id', 'x-api-key': 'dummy-api-key' },
}

describe('httpClient', () => {
  it('Should return an axios instance with request methods', () => {
    const httpClnt = httpClient(httpClientConfig)

    expect('delete' in httpClnt).toBe(true)
    expect(typeof httpClnt.delete).toBe('function')

    expect('get' in httpClnt).toBe(true)
    expect(typeof httpClnt.get).toBe('function')

    expect('head' in httpClnt).toBe(true)
    expect(typeof httpClnt.head).toBe('function')

    expect('options' in httpClnt).toBe(true)
    expect(typeof httpClnt.options).toBe('function')

    expect('patch' in httpClnt).toBe(true)
    expect(typeof httpClnt.patch).toBe('function')

    expect('post' in httpClnt).toBe(true)
    expect(typeof httpClnt.post).toBe('function')

    expect('put' in httpClnt).toBe(true)
    expect(typeof httpClnt.put).toBe('function')

    expect('request' in httpClnt).toBe(true)
    expect(typeof httpClnt.request).toBe('function')
  })

  it('Should call "create" axios function', () => {
    const createSpy = jest.spyOn(axios, 'create')

    httpClient(httpClientConfig)

    expect(createSpy).toHaveBeenCalledTimes(1)
    expect(createSpy).toHaveBeenCalledWith({
      baseURL: httpClientConfig.baseUrl,
      headers: httpClientConfig.headers,
    })
  })

  it('Should be able to do requests', async () => {
    const httpClnt = httpClient(httpClientConfig)

    const postResponse = await httpClnt.post('/checks/dummy-type', { 'dummy-key': 'dummy-value' })
    expect(postResponse.status).toBe(200)

    const getResponse = await httpClnt.get('/checks/dummy-type')
    expect(getResponse.status).toBe(200)

    const deleteResponse = await httpClnt.delete('/checks/dummy-type/dummy-id')
    expect(deleteResponse.status).toBe(200)
  })
})

describe('onRejected', () => {
  it('Should return a rejected promise with a default message when error response is undefined', () => {
    expect(onRejected(undefined)).rejects.toThrow(new Error(DEFAULT_ERROR_MESSAGE))
  })

  it('Should return a rejected promise with a default message when error response is null', () => {
    expect(onRejected(null)).rejects.toThrow(new Error(DEFAULT_ERROR_MESSAGE))
  })

  it('Should return a rejected promise with a default message when error response object is incorrect', () => {
    expect(
      onRejected({
        response: {},
      }),
    ).rejects.toThrow(new Error(DEFAULT_ERROR_MESSAGE))

    expect(
      onRejected({
        response: { data: {} },
      }),
    ).rejects.toThrow(new Error(DEFAULT_ERROR_MESSAGE))

    expect(
      onRejected({
        response: { data: { message: '' } },
      }),
    ).rejects.toThrow(new Error(DEFAULT_ERROR_MESSAGE))
  })

  it('Should return a rejected promise with the message from the error response', () => {
    const dummyErrorMessage = 'Dummy error message'

    expect(
      onRejected({
        response: {
          data: { message: dummyErrorMessage },
        },
      }),
    ).rejects.toThrow(new Error(dummyErrorMessage))
  })
})
