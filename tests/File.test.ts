import { File } from '..'

describe('File', () => {
  test('copy', () => {
    const file = new File('filename.txt')
    file.size = 101
    const fileCopy = file.copy()
    expect(fileCopy !== file).toBe(true)
    expect(fileCopy.size == file.size).toBe(true)
  })
})