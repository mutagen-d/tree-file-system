import { Directory, File, Item } from '..'

const root = new Directory('root')
const templateDirectory = new Directory('main')

const files = ['file.txt', 'text.out', 'image.png']
files.forEach(name => templateDirectory.appendItem(new File(name)))

const subDir = new Directory('sub')
subDir.appendItem(new File('file.txt'))
subDir.appendItem(new Directory('sub-sub'))
subDir.appendItem(new Directory('sub-3'))

/**
 * /root/main/file.txt
 * /root/main/text.out
 * /root/main/image.png
 * /root/main/sub/file.txt
 * /root/main/sub/sub-sub/
 * /root/main/sub/sub-3
 */

templateDirectory.appendItem(subDir)

let directory: Directory

const restoreDirectory = () => {
  directory = templateDirectory.copy()
  root.appendOrReplaceItem(directory)
}

describe('Directory', () => {
  beforeEach(() => {
    restoreDirectory()
  })
  test('copy', () => {
    const dir = directory.copy()
    expect(dir.name == directory.name).toBe(true)
    expect(directory.parent).toBeTruthy()
    expect(dir.parent === directory.parent).not.toBe(true)
    const getItemNames = (item: Item) => item.getItems().map(item => item.name)
    const itemNames = getItemNames(directory)
    const copyItemNames = getItemNames(dir)
    for (const name of itemNames) {
      expect(copyItemNames).toContain(name)
    }
    const subDirCopyItemNames = getItemNames(dir.getItem('sub') as Directory)
    const subDirItemNames = getItemNames(directory.getItem('sub') as Directory)
    expect(subDirItemNames.length).toBeTruthy()
    for (const name of subDirItemNames) {
      expect(subDirCopyItemNames).toContain(name)
    }
  })
  describe('appendOrReplaceItem', () => {
    afterEach(() => {
      restoreDirectory()
    })
    test('replace existing item', () => {
      const replace = (item: Item) => {
        const res = directory.appendOrReplaceItem(item)
        expect(res).not.toBe(true)
        expect(item.parent === directory).toBe(true)
        expect(directory.getItem(item.name) === item).toBe(true)
      }

      replace(new File('file.txt'))
      replace(new Directory('sub'))
    })
    test('append new item', () => {
      const append = (item: Item) => {
        const res = directory.appendOrReplaceItem(item)
        expect(res).toBe(true)
        expect(item.parent === directory).toBe(true)
        expect(directory.getItem(item.name) == item).toBe(true)
      }

      append(new File('filename.txt'))
      append(new Directory('new-directory'))
    })
  })
  describe('appendItem', () => {
    afterEach(() => {
      restoreDirectory()
    })
    test('append existing file', () => {
      const append = (item: Item) => {
        const res = directory.appendItem(item)
        expect(res).not.toBe(true)
        expect(item === directory.getItem(item.name)).not.toBe(true)
        expect(item.parent === directory).not.toBe(true)
      }

      append(new File('file.txt'))
      append(new Directory('sub'))
    })
    test('append new item', () => {
      const append = (item: Item) => {
        const res = directory.appendItem(item)
        expect(res).toBe(true)
        expect(item === directory.getItem(item.name)).toBe(true)
        expect(item.parent === directory).toBe(true)
      }
      append(new File('filename.txt'))
      append(new Directory('new-directory'))
    })
  })
  describe('replaceItem', () => {
    afterEach(() => {
      restoreDirectory()
    })
    test('replace existing item', () => {
      const replace = (item: Item) => {
        const res = directory.replaceItem(item)
        expect(res).toBe(true)
        expect(item.parent === directory).toBe(true)
        expect(item === directory.getItem(item.name)).toBe(true)
      }
      replace(new File('file.txt'))
      replace(new Directory('sub'))
    })
    test('replace new file', () => {
      const replace = (item: Item) => {
        const res = directory.replaceItem(item)
        expect(res).not.toBe(true)
        expect(item.parent === directory).not.toBe(true)
        expect(item === directory.getItem(item.name)).not.toBe(true)
      }
      replace(new File('filename.txt'))
      replace(new Directory('new-directory'))
    })
  })
  describe('removeItem', () => {
    afterEach(() => {
      restoreDirectory()
    })
    test('remove existing item', () => {
      const remove = (name: string) => {
        const item = directory.getItem(name)
        expect(item).toBeTruthy()
        const res = directory.removeItem(item?.name as string)
        expect(res).toBe(true)
        expect(item?.parent === directory).not.toBe(true)
        expect(directory.getItem(item?.name as string) === item).not.toBe(true)
      }

      remove('file.txt')
      remove('sub')
    })
    test('remove not existing item', () => {
      const remove = (name: string) => {
        const item = directory.getItem(name)
        expect(item).toBeFalsy()
        const res = directory.removeItem(item?.name as string)
        expect(res).not.toBe(true)
      }
      remove('filename.txt')
      remove('new-directory')
    })
  })
  describe('findItemFromPath', () => {
    test('find existing item', () => {
      const findItem = (path: string) => {
        const item = directory.findItemFromPath(path)
        expect(item).toBeTruthy()
        expect(item?.parent).toBeTruthy()
        expect(item?.parent?.getItem(item.name)).toBeTruthy()
      }
      findItem('file.txt')
      findItem('./sub/file.txt')
      findItem('./sub/sub-sub/')
      findItem('./sub/sub-sub')
      findItem('./root/../sub/file.txt')
    })
    test('find not existing item', () => {
      const findItem = (path: string) => {
        const item = directory.findItemFromPath(path)
        expect(item).toBeFalsy()
      }
      findItem('filename.txt')
      findItem('./path/../to/./some/file.txt')
      findItem('path/to/directory/')
    })
    test('find item - errors', () => {
      const findItem = (path: string) => {
        try {
          const item = directory.findItemFromPath(path)
        } catch (e) {
          expect(e instanceof Error).toBe(true)
        }
      }

      const paths = [
        '/sub',
        '/sub/file.txt',
        '/sub/sub-3/file.txt',
      ]

      expect.assertions(paths.length)
      paths.forEach(path => {
        findItem(path)
      })
    })
  })
  describe('moveTo', () => {
    test('move to existing directory', () => {
      const move = (targetPath: string, destPath: string) => {
        const target = directory.findItemFromPath(targetPath) as Item
        const dest = directory.findItemFromPath(destPath) as Item
        const res = target.moveTo(dest)
        expect(res).toBe(true)
        expect(target.parent === dest).toBe(true)
        expect(dest.getItem(target.name) === target).toBe(true)
      }

      move('./file.txt', './sub/sub-3')
      move('./sub/sub-3', './')
      move('./sub/sub-sub/', './')
    })
    test('move to file path', () => {
      const move = (targetPath: string, filePath: string) => {
        const target = directory.findItemFromPath(targetPath) as Item
        const file = directory.findItemFromPath(filePath) as Item
        const res = target.moveTo(file)
        expect(res).not.toBe(true)
        expect(target.parent === file).not.toBe(true)
        expect(file.getItem(target.name) === target).not.toBe(true)
      }

      move('./sub/sub-3', './file.txt')
      move('./sub/sub-sub', './text.out')
      move('./sub', './image.png')
      move('./sub', './sub/file.txt')
    })
  })
})