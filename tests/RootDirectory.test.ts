import { Directory, RootDirectory, File } from '..'

const root = new RootDirectory()

const directory = new Directory('main')
directory.appendItem(new File('file.txt'))
root.appendItem(directory)

describe('RootDirectory', () => {
  test('path, name, parent', () => {
    expect(root.path === '/').toBe(true)
    expect(root.name === '').toBe(true)
    expect(root.parent).not.toBeTruthy()
    // @ts-ignore
    root.parent = new Directory('root')
    expect(root.parent).not.toBeTruthy()
  })

  test('sub directory path', () => {
    expect(directory.path == '/main').toBe(true)
  })
  test('findItemFromPath', () => {
    const findItem = (path: string) => {
      const item = root.findItemFromPath(path)
      expect(item).toBeTruthy()
    }
    findItem('/main')
    findItem('./main')
    findItem('/main/file.txt')
  })
})