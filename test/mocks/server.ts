import cbor from 'cbor'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { DEFAULT_ERROR_MESSAGE } from '../../src/constants'

export const baseUrl = 'http://dummy-url.com/api'

export const checkResponse = {
  id: 'dummy-id',
  status: 'dummy-status',
  success: false,
  date: new Date().toISOString(),
  signingKey: Buffer.from('dummy-signing-key').toString('hex'),
  signature: Buffer.from('dummy-signature').toString('hex'),
  rawData: cbor
    .encode({
      'dummy-key': 'dummy-value',
    })
    .toString('hex'),
  error: {
    code: 'dummy-error-code',
    message: 'dummy-error-message',
  },
}

export const enclaveResponse = {
  createdAt: new Date().toISOString(),
  status: 'dummy-status',
  mrenclave: Buffer.from('dummy-mrenclave').toString('hex'),
  publicKeys: [
    {
      publicKey: Buffer.from('dummy-signing-key').toString('hex'),
      algorithm: 'dummy-algorithm',
      usage: 'dummy-usage',
    },
    {
      publicKey: Buffer.from('dummy-provision-key').toString('hex'),
      algorithm: 'dummy-algorithm',
      usage: 'dummy-usage',
    },
  ],
  iasCertChain: 'dummy-ias-certchain',
  iasReport: encodeURIComponent(
    JSON.stringify({
      'dummy-key': 'dummy-value',
    }),
  ),
  iasSignature: Buffer.from('dummy-ias-signature').toString('base64'),
}

export const errorHandlers = [
  // checks
  rest.post(`${baseUrl}/checks/:type`, (req, res, ctx) => {
    return res(
      ctx.status(400),
      ctx.json({
        message: DEFAULT_ERROR_MESSAGE,
      }),
    )
  }),
  rest.get(`${baseUrl}/checks/:type`, (req, res, ctx) => {
    return res(
      ctx.status(400),
      ctx.json({
        message: DEFAULT_ERROR_MESSAGE,
      }),
    )
  }),
  rest.get(`${baseUrl}/checks/:type/:id`, (req, res, ctx) => {
    return res(
      ctx.status(400),
      ctx.json({
        message: DEFAULT_ERROR_MESSAGE,
      }),
    )
  }),
  rest.delete(`${baseUrl}/checks/:type/:id`, (req, res, ctx) => {
    return res(
      ctx.status(400),
      ctx.json({
        message: DEFAULT_ERROR_MESSAGE,
      }),
    )
  }),
  // enclaves
  rest.get(`${baseUrl}/enclaves/sig-public-key/:sigPublicKey`, (req, res, ctx) => {
    return res(
      ctx.status(400),
      ctx.json({
        message: DEFAULT_ERROR_MESSAGE,
      }),
    )
  }),
]

export const server = setupServer(
  // checks
  rest.post(`${baseUrl}/checks/:type`, (req, res, ctx) => {
    return res(
      ctx.json({
        id: 'dummy-id',
        url: 'http://dummy-url.com/',
      }),
    )
  }),
  rest.get(`${baseUrl}/checks/:type`, (req, res, ctx) => {
    return res(ctx.json([checkResponse]))
  }),
  rest.get(`${baseUrl}/checks/:type/:id`, (req, res, ctx) => {
    return res(ctx.json(checkResponse))
  }),
  rest.delete(`${baseUrl}/checks/:type/:id`, (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
      }),
    )
  }),
  // enclaves
  rest.get(`${baseUrl}/enclaves/sig-public-key/:sigPublicKey`, (req, res, ctx) => {
    return res(ctx.json(enclaveResponse))
  }),
)
