import fs from 'fs'
import { Certificate, CertificateChainValidationEngine, setEngine, CryptoEngine } from 'pkijs'
import * as peculiarCrypto from '@peculiar/webcrypto'
import * as asn1js from 'asn1js'
import { base64ToArrayBuffer } from './array-buffer'

export function commonName(cert: Certificate): string {
  for (const tav of cert.subject.typesAndValues) {
    if (tav.type.toString() === '2.5.4.3') {
      return tav.value.valueBlock.value
    }
  }
  throw new Error('No common name found in certificate')
}

export function isNode() {
  return typeof process !== 'undefined' && process.versions != null && process.versions.node != null
}

export function parseCertChain(pem: string): Certificate[] {
  const certs: Certificate[] = []
  const lines = pem.split('\n')
  let certBase64 = ''
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line === '') {
      // ignore
    } else if (line === '-----BEGIN CERTIFICATE-----') {
      if (certBase64 !== '') {
        throw new Error('Invalid cert chain format (begin)')
      }
      certBase64 = ''
    } else if (line === '-----END CERTIFICATE-----') {
      if (certBase64 === '') {
        throw new Error('Invalid cert chain format (end)')
      }
      const asn1 = asn1js.fromBER(base64ToArrayBuffer(certBase64))
      certs.push(new Certificate({ schema: asn1.result }))
      certBase64 = ''
    } else {
      certBase64 += line
    }
  }
  return certs
}

export function verifyCertificateCommonName(iasCertChainString: string, certificateCommonName: string): boolean {
  const iasCertChain = parseCertChain(iasCertChainString)
  return commonName(iasCertChain[0]) === certificateCommonName
}

export async function verifyCertificateChain(iasCertChainString: string, rootCACertPath: string): Promise<boolean> {
  if (isNode()) {
    const webcrypto = new peculiarCrypto.Crypto()
    const name = 'node-webcrypto'
    setEngine(name, new CryptoEngine({ name, crypto: webcrypto }))
  }

  const rootCACert = await fs.promises.readFile(rootCACertPath)

  const certChainVerificationEngine = new CertificateChainValidationEngine({
    trustedCerts: parseCertChain(rootCACert.toString()),
    certs: parseCertChain(iasCertChainString),
    crls: [],
  })
  const certChainVerificationResponse = await certChainVerificationEngine.verify()
  return certChainVerificationResponse.result
}
