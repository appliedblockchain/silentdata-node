import axios, { AxiosInstance } from 'axios'
import { DEFAULT_ERROR_MESSAGE } from './constants'

type HTTPClientConfig = {
  baseUrl: string
  headers: { [k: string]: string }
}

export type HTTPClient = AxiosInstance

export function onRejected(error: unknown) {
  let err: Error
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'message' in error.response.data &&
    error.response.data.message &&
    typeof error.response.data.message === 'string'
  ) {
    err = new Error(error.response.data.message)
  } else {
    err = new Error(DEFAULT_ERROR_MESSAGE)
  }
  return Promise.reject(err)
}

export function httpClient({ baseUrl, headers }: HTTPClientConfig): HTTPClient {
  const httpClnt = axios.create({
    baseURL: baseUrl,
    headers,
  })

  httpClnt.interceptors.response.use((response) => response, onRejected)

  return httpClnt
}
