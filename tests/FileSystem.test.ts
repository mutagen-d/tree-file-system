import FileSystem, { Directory, File, RootDirectory } from '..'
import Path from '@mutagen-d/path'

const templateFS = new FileSystem()

const root = templateFS.getDirectory('/') as RootDirectory
root.appendItem(new Directory('main'))

const main = root.getItem('main') as Directory
main.appendItem(new Directory('sub'))
main.appendItem(new File('file.txt'))
main.appendItem(new File('file2.txt'))

const sub = main.getItem('sub') as Directory
sub.appendItem(new Directory('sub2'))
sub.appendItem(new File('file2.txt'))

// templateFS.createDirectory('/main')
// templateFS.createDirectory('/main/sub')
// templateFS.createDirectory('/main/sub/sub2')
// templateFS.createFile('/main/file.txt')
// templateFS.createFile('/main/file2.txt')
// templateFS.createFile('/main/sub/file2.txt')

let filesystem: FileSystem

const restoreFS = () => {
  filesystem = templateFS.copy()
}

describe('FileSystem', () => {
  beforeAll(() => {
    restoreFS()
  })
  describe('copy', () => {
    test('copy item', () => {
      const fs = filesystem.copy()
      const compareItem = (path: string) => {
        const copyItem = fs.getItem(path)
        const item = filesystem.getItem(path)
        expect(copyItem).toBeTruthy()
        expect(item).toBeTruthy()
        expect(item?.path === copyItem?.path).toBe(true)
      }

      compareItem('/main')
      compareItem('/main/')
      compareItem('/main/file.txt')
      compareItem('/main/sub')
      compareItem('/main/sub/sub2')
      compareItem('/main/sub/file2.txt')
    })
  })
  describe('create', () => {
    afterEach(() => {
      restoreFS()
    })
    test('create file', () => {
      const createFile = (path: string) => {
        const file = filesystem.createFile(path)
        expect(file).toBeTruthy()
        expect(Path.resolve(file.path) === Path.resolve(path)).toBe(true)
      }

      createFile('/file.root.txt')
      createFile('/main/file3.txt')
      createFile('/root-dir/../main/file4.txt')
    })
    test('create directory', () => {
      const createDirectory = (path: string) => {
        const directory = filesystem.createDirectory(path)
        expect(directory).toBeTruthy()
        expect(Path.resolve(directory.path) === Path.resolve(path)).toBe(true)
      }

      createDirectory('/root/')
      createDirectory('/root/to/../sub')
      createDirectory('/main/sub/sub3/')
    })
    test('create directory - errors', () => {
      const createDirectory = (path: string) => {
        try {
          const directory = filesystem.createDirectory(path)
        } catch (e) {
          expect(e instanceof Error).toBe(true)
        }
      }

      const paths = [
        './root/to/dir-path',
        './some/directory',
      ]

      expect.assertions(paths.length)
      paths.forEach(path => {
        createDirectory(path)
      })
    })
    test('create existing file', () => {
      const createFile = (path: string) => {
        try {
          const file = filesystem.createFile(path)
        } catch (e) {
          expect(e.message).toBeTruthy()
        }
      }
      const filenames = [
        '/main/file.txt', '/main/file2.txt', '/main/sub/file2/txt',
        '/root/../main/file.txt', '/root/path/../../main/sub/file2.txt',
      ]
      expect.assertions(filenames.length)
      filenames.forEach(name => {
        createFile(name)
      })
    })
    test('create existing directory', () => {
      const createDirectory = (path: string) => {
        try {
          const directory = filesystem.createDirectory(path)
        } catch (e) {
          expect(e.message).toBeTruthy()
        }
      }
      const names = [
        '/main', '/', '/main/sub', '/root/../main/sub/foo/../sub2'
      ]
      expect.assertions(names.length)
      names.forEach(name => {
        createDirectory(name)
      })
    })
  })
  describe('get item', () => {
    afterEach(() => {
      restoreFS()
    })
    test('get existing item', () => {
      const getItem = (path: string) => {
        const item = filesystem.getItem(path)
        expect(item).toBeTruthy()
        expect(Path.resolve(item?.path as string) === Path.resolve(path)).toBe(true)
      }

      getItem('/main')
      getItem('/main/file.txt')
      getItem('/root/../')
      getItem('/')
      getItem('/root/../main/sub/file2.txt')
      getItem('/root/.././main/sub/sub2/')
    })
    test('get not existing item', () => {
      const getItem = (path: string) => {
        const item = filesystem.getItem(path)
        expect(item).toBeFalsy()
      }

      getItem('/root')
      getItem('/root/sub')
      getItem('/file.txt')
    })
  })
  describe('get file', () => {
    test('get existing file', () => {
      const getFile = (path: string) => {
        const file = filesystem.getFile(path)
        expect(file).toBeTruthy()
        expect(Path.resolve(file?.path as string) === Path.resolve(path)).toBe(true)
      }

      getFile('/main/file.txt')
      getFile('/main_dir/../main/sub/file2.txt')
    })
    test('get not existing file', () => {
      const getFile = (path: string) => {
        const file = filesystem.getFile(path)
        expect(file).toBeFalsy()
      }

      getFile('/main/file.123t.txt')
      getFile('/main/../main/sub/file.32.txt')
    })
  })
  describe('remove item', () => {
    afterEach(() => {
      restoreFS()
    })
    test('remove existing item', () => {
      const removeItem = (path: string) => {
        const res = filesystem.removeItem(path)
        expect(res).toBe(true)
        expect(filesystem.getItem(path)).toBeFalsy()
      }

      removeItem('/main/file.txt')
      removeItem('/main/sub/sub2')
      removeItem('/main/sub/file2.txt')
      removeItem('/main/sub/')
      removeItem('/main/file2.txt')
      removeItem('/main/')
    })
    test('remove not existing item', () => {
      const removeItem = (path: string) => {
        try {
          expect(filesystem.getItem(path)).toBeFalsy()
          const res = filesystem.removeItem(path)
        } catch (e) {
          expect(e.message).toBeTruthy()
        }
      }
      const paths = [
        '/main/main', '/main/../root', '/root/sub/file.txt',
      ]
      expect.assertions(paths.length * 2)
      paths.forEach(path => {
        removeItem(path)
      })
    })
    test('remove not existing item - force', () => {
      const removeItem = (path: string) => {
        expect(filesystem.getItem(path)).toBeFalsy()
        const res = filesystem.removeItem(path, true)
        expect(res).toBeFalsy()
      }

      const paths = [
        '/main/main', '/main/../root', '/root/sub/file.txt',
      ]
      paths.forEach(path => {
        removeItem(path)
      })
    })
    test('remove root', () => {
      const res = filesystem.removeItem('/')
      expect(res).toBeFalsy()
      expect(filesystem.getItem('/')).toBeTruthy()
    })
  })
  describe('remove file', () => {
    afterEach(() => {
      restoreFS()
    })
    test('remove existing file', () => {
      const removeFile = (path: string) => {
        const res = filesystem.removeFile(path)
        expect(res).toBe(true)
        expect(filesystem.getFile(path)).toBeFalsy()
      }

      removeFile('/main/file.txt')
      removeFile('/main/file2.txt')
      removeFile('/main/sub/file2.txt')
    })
    test('remove not existing file', () => {
      const removeFile = (path: string) => {
        try {
          expect(filesystem.getFile(path)).toBeFalsy()
          const res = filesystem.removeFile(path)
        } catch (e) {
          expect(e.message).toBeTruthy()
        }
      }
      const paths = [
        '/main', '/main/file3.txt', '/main/sub',
      ]
      expect.assertions(paths.length * 2)
      paths.forEach(path => {
        removeFile(path)
      })
    })
    test('remove not existing file - force', () => {
      const removeFile = (path: string) => {
        expect(filesystem.getFile(path)).toBeFalsy()
        const res = filesystem.removeFile(path, true)
        expect(res).toBeFalsy()
      }
      const paths = [
        '/main', '/main/file3.txt', '/main/sub',
      ]
      expect.assertions(paths.length * 2)
      paths.forEach(path => {
        removeFile(path)
      })
    })
    test('remove root', () => {
      expect.assertions(1)
      try {
        const res = filesystem.removeFile('/')
      } catch (e) {
        expect(e.message).toBeTruthy()
      }
    })
  })
  describe('remove directory', () => {
    afterEach(() => {
      restoreFS()
    })
    test('remove existing directory', () => {
      const removeDirectory = (path: string) => {
        const res = filesystem.removeDirectory(path)
        expect(res).toBe(true)
        expect(filesystem.getDirectory(path)).toBeFalsy()
      }

      removeDirectory('/main/sub/sub2')
      removeDirectory('/main/sub')
      removeDirectory('/main')
    })
    test('remove not existing directory', () => {
      const removeDirectory = (path: string) => {
        try {
          expect(filesystem.getDirectory(path)).toBeFalsy()
          const res = filesystem.removeDirectory(path)
        } catch (e) {
          expect(e.message).toBeTruthy()
        }
      }
      const paths = [
        '/main/sub3', '/main/s', '/main/../root/sub'
      ]
      expect.assertions(paths.length * 2)
      paths.forEach(path => {
        removeDirectory(path)
      })
    })
    test('remove not existing directory - force', () => {
      const removeDirectory = (path: string) => {
        expect(filesystem.getDirectory(path)).toBeFalsy()
        const res = filesystem.removeDirectory(path, true)
        expect(res).toBeFalsy()
      }
      const paths = [
        '/main/sub3', '/main/s', '/main/../root/sub'
      ]
      expect.assertions(paths.length * 2)
      paths.forEach(path => {
        removeDirectory(path)
      })
    })
    test('remove root', () => {
      const res = filesystem.removeDirectory('/')
      expect(res).toBeFalsy()
      expect(filesystem.getDirectory('/')).toBeTruthy()
    })
  })
  test('remove all', () => {
    filesystem.removeAll()
    expect(filesystem.getItem('/main')).toBeFalsy()
  })
})