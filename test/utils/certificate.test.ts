import fs from 'fs'
import path from 'path'
import { Certificate } from 'pkijs'
import { SGX_CERTIFICATE_NAME } from '../../src/constants'
import { commonName, parseCertChain, verifyCertificateCommonName } from '../../src/utils/certificate'

describe('commonName', () => {
  it('Should return the common name from a certificate object', () => {
    const name = 'dummy-name'
    const cert = new Certificate()
    cert.subject = {
      typesAndValues: [
        {
          type: '2.5.4.3',
          value: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            valueBlock: {
              value: name,
            },
          },
        },
      ],
    }

    expect(commonName(cert)).toEqual(name)
  })

  it('Should throw an error when the common name is not found in the certificate', () => {
    const cert = new Certificate()

    expect(() => commonName(cert)).toThrowError('No common name found in certificate')
  })
})

describe('parseCertChain', () => {
  it('Should return an array of certificates for valid certificate chain format', async () => {
    const validCert = await fs.promises.readFile(path.join(__dirname, '../../test/certificates/common-cert.pem'))
    const certs = parseCertChain(validCert.toString())

    expect(certs.length).toBe(1)

    const cert = certs[0]

    expect(cert).toBeInstanceOf(Certificate)
    expect(cert.subject.typesAndValues.length).toBeGreaterThan(0)
    expect(cert.issuer.typesAndValues.length).toBeGreaterThan(0)
  })

  it('Should throw an error for invalid begin certificate chain format', () => {
    const invalidCert = `dummy\n-----BEGIN CERTIFICATE-----`

    expect(() => parseCertChain(invalidCert)).toThrowError('Invalid cert chain format (begin)')
  })

  it('Should throw an error for invalid end certificate chain format', () => {
    const invalidCert = `-----END CERTIFICATE-----\ndummy`

    expect(() => parseCertChain(invalidCert)).toThrowError('Invalid cert chain format (end)')
  })

  it('Should return empty array for an empty input', () => {
    const certs = parseCertChain('')

    expect(certs.length).toBe(0)
  })
})

describe('verifyCertificateCommonName', () => {
  it('Should return true when matches expected certificate common name', async () => {
    const cert = await fs.promises.readFile(path.join(__dirname, '../../test/certificates/common-cert.pem'))

    expect(verifyCertificateCommonName(cert.toString(), SGX_CERTIFICATE_NAME)).toBe(true)
  })

  it('Should return true when does not match expected certificate common name', async () => {
    const cert = await fs.promises.readFile(
      path.join(__dirname, '../../test/certificates/invalid-common-name-cert.pem'),
    )

    expect(verifyCertificateCommonName(cert.toString(), 'dummy-certificate-name')).toBe(false)
  })
})
