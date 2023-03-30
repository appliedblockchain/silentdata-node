export function arrayBuffersEqual(a: ArrayBuffer, b: ArrayBuffer): boolean {
  return dvsEqual(new DataView(a), new DataView(b))
}

export function arrayBufferFromDataView(dv: DataView, offset: number, length: number): ArrayBuffer {
  const result = new ArrayBuffer(length)
  const resultDV = new DataView(result)
  for (let i = 0; i < length; i++) {
    resultDV.setUint8(i, dv.getUint8(offset + i))
  }
  return result
}

export function arrayBufferToHex(ab: ArrayBuffer): string {
  return dataViewToHex(new DataView(ab))
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const byteString = Buffer.from(base64, 'base64').toString('binary')
  const buffer = new ArrayBuffer(byteString.length)
  const uints = new Uint8Array(buffer)
  for (let i = 0; i < byteString.length; i++) {
    uints[i] = byteString.codePointAt(i) as number
  }
  return buffer
}

export function checkLength(dv: DataView, expectedInputLength: number) {
  if (dv.byteLength !== expectedInputLength) {
    throw new Error(`SGX quote DataView length ${dv.byteLength} instead of ${expectedInputLength}`)
  }
}

export function dataViewToHex(view: DataView): string {
  const byteToHex: string[] = []
  for (let n = 0; n <= 0xff; ++n) {
    const hexOctet = n.toString(16).padStart(2, '0')
    byteToHex.push(hexOctet)
  }
  const hexOctets = []
  for (let i = 0; i < view.byteLength; i++) {
    hexOctets.push(byteToHex[view.getUint8(i)])
  }
  return hexOctets.join('')
}

export function dvsEqual(a: DataView, b: DataView): boolean {
  if (a.byteLength !== b.byteLength) {
    return false
  }
  for (let i = 0; i < a.byteLength; i++) {
    if (a.getUint8(i) !== b.getUint8(i)) {
      return false
    }
  }
  return true
}

export function hexToArrayBuffer(hex: string): ArrayBuffer {
  const uints = new Uint8Array(hex.length / 2)
  if (uints.length * 2 !== hex.length) {
    throw new Error('Lengths of buffer and hex string not compatible')
  }
  for (let i = 0; i < uints.length; i++) {
    uints[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return uints.buffer
}

export function stringToArrayBuffer(str: string): ArrayBuffer {
  const buffer = new ArrayBuffer(str.length)
  const uints = new Uint8Array(buffer)
  for (let i = 0; i < str.length; i++) {
    const val = str.codePointAt(i) as number
    if (val > 255) {
      throw new Error('This function can only deal with 8-bit characters')
    }
    uints[i] = val
  }
  return buffer
}
