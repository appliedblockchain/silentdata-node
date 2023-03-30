import {
  arrayBuffersEqual,
  arrayBufferFromDataView,
  arrayBufferToHex,
  base64ToArrayBuffer,
  checkLength,
  dataViewToHex,
  dvsEqual,
  hexToArrayBuffer,
  stringToArrayBuffer,
} from '../../src/utils/array-buffer'

describe('arrayBuffersEqual', () => {
  it('Should return true for equal buffers', () => {
    const a = new Uint8Array([1, 2, 3]).buffer
    const b = new Uint8Array([1, 2, 3]).buffer

    expect(arrayBuffersEqual(a, b)).toBe(true)
  })

  it('Should return false for unequal buffers', () => {
    const a = new Uint8Array([1, 2, 3]).buffer
    const b = new Uint8Array([4, 5, 6]).buffer

    expect(arrayBuffersEqual(a, b)).toBe(false)
  })

  it('Should return true for empty buffers', () => {
    const a = new Uint8Array([]).buffer
    const b = new Uint8Array([]).buffer

    expect(arrayBuffersEqual(a, b)).toBe(true)
  })

  it('Should return false for buffers of different length', () => {
    const a = new Uint8Array([1, 2, 3]).buffer
    const b = new Uint8Array([1, 2, 3, 4]).buffer

    expect(arrayBuffersEqual(a, b)).toBe(false)
  })
})

describe('arrayBufferFromDataView', () => {
  it('Should return expected buffer for valid input', () => {
    const dv = new DataView(new Uint8Array([1, 2, 3]).buffer)
    const offset = 1
    const length = 2
    const expectedBuffer = new Uint8Array([2, 3]).buffer
    const actualBuffer = arrayBufferFromDataView(dv, offset, length)

    expect(actualBuffer).toEqual(expectedBuffer)
  })

  it('Should return empty buffer for length of zero', () => {
    const dv = new DataView(new Uint8Array([1, 2, 3]).buffer)
    const offset = 0
    const length = 0
    const expectedBuffer = new Uint8Array([]).buffer
    const actualBuffer = arrayBufferFromDataView(dv, offset, length)

    expect(actualBuffer).toEqual(expectedBuffer)
  })

  it('Should throw error for invalid input', () => {
    const dv = new DataView(new Uint8Array([1, 2, 3]).buffer)
    const offset = 1
    const length = 3

    expect(() => arrayBufferFromDataView(dv, offset, length)).toThrow()
  })
})

describe('arrayBufferToHex', () => {
  it('Should return expected hex string for valid input', () => {
    const ab = new Uint8Array([1, 2, 3]).buffer
    const expectedHex = '010203'
    const actualHex = arrayBufferToHex(ab)

    expect(actualHex).toBe(expectedHex)
  })

  it('Should return empty string for empty buffer', () => {
    const ab = new Uint8Array([]).buffer
    const expectedHex = ''
    const actualHex = arrayBufferToHex(ab)

    expect(actualHex).toBe(expectedHex)
  })
})

describe('base64ToArrayBuffer', () => {
  it('Should return expected buffer for valid base64 input', () => {
    const base64 = 'VGhpcyBpcyBhIHRlc3Q='
    const expectedBuffer = new Uint8Array([84, 104, 105, 115, 32, 105, 115, 32, 97, 32, 116, 101, 115, 116]).buffer
    const actualBuffer = base64ToArrayBuffer(base64)

    expect(actualBuffer).toEqual(expectedBuffer)
  })

  it('Should return empty buffer for empty string input', () => {
    const base64 = ''
    const expectedBuffer = new Uint8Array([]).buffer
    const actualBuffer = base64ToArrayBuffer(base64)

    expect(actualBuffer).toEqual(expectedBuffer)
  })
})

describe('checkLength', () => {
  it('Should not throw error for valid input', () => {
    const dv = new DataView(new Uint8Array([1, 2, 3]).buffer)

    expect(() => checkLength(dv, 3)).not.toThrow()
  })

  it('Should throw error for invalid input', () => {
    const dv = new DataView(new Uint8Array([1, 2, 3]).buffer)

    expect(() => checkLength(dv, 4)).toThrowError(/SGX quote DataView length/)
  })
})

describe('dataViewToHex', () => {
  it('Should return expected value for data view with two bytes', () => {
    const view = new DataView(new Uint8Array([0x12, 0x34]).buffer)
    const expectedHex = '1234'
    const actualHex = dataViewToHex(view)

    expect(actualHex).toBe(expectedHex)
  })

  it('Should return expected value for empty data view', () => {
    const view = new DataView(new ArrayBuffer(0))
    const expectedHex = ''
    const actualHex = dataViewToHex(view)

    expect(actualHex).toBe(expectedHex)
  })
})

describe('dvsEqual', () => {
  it('Should return true for equal data views', () => {
    const view1 = new DataView(new Uint8Array([0x12, 0x34]).buffer)
    const view2 = new DataView(new Uint8Array([0x12, 0x34]).buffer)

    expect(dvsEqual(view1, view2)).toBe(true)
  })

  it('Should return false for data views with different lengths', () => {
    const view1 = new DataView(new Uint8Array([0x12, 0x34]).buffer)
    const view2 = new DataView(new Uint8Array([0x12, 0x34, 0x56]).buffer)

    expect(dvsEqual(view1, view2)).toBe(false)
  })

  it('Should return false for data views with different values', () => {
    const view1 = new DataView(new Uint8Array([0x12, 0x34]).buffer)
    const view2 = new DataView(new Uint8Array([0x56, 0x78]).buffer)

    expect(dvsEqual(view1, view2)).toBe(false)
  })

  it('Should return true for empty data views', () => {
    const view1 = new DataView(new ArrayBuffer(0))
    const view2 = new DataView(new ArrayBuffer(0))

    expect(dvsEqual(view1, view2)).toBe(true)
  })
})

describe('hexToArrayBuffer', () => {
  it('Should return the expected buffer for a valid hex string', () => {
    const hex = 'deadbeef'
    const expectedBuffer = new Uint8Array([0xde, 0xad, 0xbe, 0xef]).buffer
    const result = hexToArrayBuffer(hex)

    expect(result).toEqual(expectedBuffer)
  })

  it('Should throw an error for an invalid hex string with odd length', () => {
    const hex = 'deadbeef1'

    expect(() => hexToArrayBuffer(hex)).toThrowError('Lengths of buffer and hex string not compatible')
  })

  it('Should return an empty buffer for an empty hex string', () => {
    const hex = ''
    const expectedBuffer = new Uint8Array([]).buffer
    const result = hexToArrayBuffer(hex)

    expect(result).toEqual(expectedBuffer)
  })
})

describe('stringToArrayBuffer', () => {
  it('Should return an empty buffer for an empty string', () => {
    const result = stringToArrayBuffer('')

    expect(result.byteLength).toBe(0)
  })

  it('Should return a buffer with correct length and values', () => {
    const result = stringToArrayBuffer('hello')

    expect(result.byteLength).toBe(5)

    const uints = new Uint8Array(result)

    expect(uints[0]).toBe(104) // 'h'
    expect(uints[1]).toBe(101) // 'e'
    expect(uints[2]).toBe(108) // 'l'
    expect(uints[3]).toBe(108) // 'l'
    expect(uints[4]).toBe(111) // 'o'
  })

  it('Should throw an error when given a string with a non-8-bit character', () => {
    expect(() => {
      stringToArrayBuffer('😀') // U+1F600, which requires more than 8 bits to represent
    }).toThrowError('This function can only deal with 8-bit characters')
  })
})
