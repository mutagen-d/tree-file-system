import Path from '@mutagen-d/path'

export class Item {
  private _name: string = ''
  private _parent?: Item

  constructor(name: string, parent?: Item) {
    this.name = name
    this.parent = parent
  }

  get name() {
    return this._name
  }
  set name(name: string) {
    if (!name || !name.trim()) {
      throw new Error('name must not be empty')
    }
    if (name.includes('/')) {
      throw new Error('name contains invalid symbol')
    }
    this._name = `${name}`
  }

  get parent() {
    return this._parent
  }
  set parent(item) {
    this._parent = item
  }

  get path(): string {
    if (this.parent instanceof RootDirectory) {
      return `/${this.name}`
    }
    if (this.parent instanceof Directory) {
      return `${this.parent.path}/${this.name}`
    }
    return this.name
  }

  getItem(name: string): Item | undefined {
    return undefined
  } 

  getItems(): Item[] {
    return []
  }

  moveTo(item: Item): boolean {
    if (item instanceof Directory || item instanceof RootDirectory) {
      return item.appendOrReplaceItem(this)
    }
    return false
  }

  remove(): boolean {
    if (this.parent instanceof Directory || this.parent instanceof RootDirectory) {
      return this.parent.removeItem(this.name)
    }
    return false
  }

  copy() {
    return new Item(this.name)
  }
}


export class File extends Item {
  private _size: number

  constructor(name: string, parent?: Item) {
    super(name, parent)
    this._size = 0
  }

  get size() {
    return this._size
  }
  set size(size) {
    this._size = size
  }

  copy() {
    const file = new File(this.name)
    file.size = this.size
    return file
  }
}



export class Directory extends Item {
  private childs: Map<string, Item>

  constructor(name: string, parent?: Directory) {
    super(name, parent)
    this.childs = new Map()
  }

  appendOrReplaceItem(item: Item) {
    const oldItem = this.getItem(item.name)
    if (oldItem) {
      oldItem.remove()
    }
    this.setItem(item)
    return !Boolean(oldItem)
  }

  getItem(name: string) {
    return this.childs.get(name)
  }

  private setItem(item: Item) {
    item.remove()
    this.childs.set(item.name, item)
    item.parent = this
  }

  appendItem(item: Item) {
    const oldItem = this.getItem(item.name)
    if (oldItem) {
      return false
    }
    this.setItem(item)
    return true
  }

  hasItem(name: string) {
    return this.childs.has(name)
  }

  replaceItem(item: Item) {
    const oldItem = this.getItem(item.name)
    if (!oldItem) {
      return false
    }
    oldItem.remove()
    this.setItem(item)
    return true
  }

  removeItem(name: string) {
    const item = this.getItem(name)
    if (!item) {
      return false
    }
    item.parent = undefined
    return this.childs.delete(name)
  }

  getItems() {
    return [...this.childs.values()]
  }

  findItemFromPath(path: string) {
    const isAbs = Path.isAbsolutePath(path)
    if (isAbs && this.parent) {
      throw new Error('path must be relative')
    }
    const names = isAbs ? Path.getNames(path).slice(1) : Path.getNames(path)
    let item: Item | undefined = this
    for (const name of names) {
      // @ts-ignore
      item = item && item.getItem(name)
    }
    return item
  }

  copy() {
    const directory = new Directory(this.name)
    for (const item of this.childs.values()) {
      directory.appendItem(item.copy())
    }
    return directory
  }
}

export class RootDirectory extends Directory {
  constructor() {
    super('root')
  }

  get path() {
    return '/'
  }
  get name() {
    return ''
  }
  set name(name) {}

  get parent() {
    return undefined
  }
  set parent(parent) {}

  copy() {
    const root = new RootDirectory()
    for (const item of this.getItems()) {
      root.appendItem(item.copy())
    }
    return root
  }
}

export default class FileSystem {
  private _root = new RootDirectory()

  copy() {
    const fileSystem = new FileSystem()
    fileSystem._root = this._root.copy() as RootDirectory
    return fileSystem
  }

  getFile(path: string) {
    const item = this.getItem(path)
    if (item instanceof File) {
      return item
    }
  }
  getDirectory(path: string) {
    const item = this.getItem(path)
    if (item instanceof Directory || item instanceof RootDirectory) {
      return item
    }
  }
  getItem(path: string) {
    if (Path.resolve(path) == '/') {
      return this._root
    }
    const item = this._root.findItemFromPath(path)
    if (item instanceof Directory || item instanceof RootDirectory) {
      return item
    }
    if (item instanceof File) {
      return item
    }
  }

  createFile(path: string) {
    const [filename, parent] = this.itemCreateValidator(path)
    const file = new File(filename)
    parent.appendItem(file)
    return file
  }
  createDirectory(path: string) {
    const [dirname, parent] = this.itemCreateValidator(path)
    const directory = new Directory(dirname)
    parent.appendItem(directory)
    return directory
  }
  private itemCreateValidator(path: string): [string, Directory] {
    const isAbsolute = Path.isAbsolutePath(Path.resolve(path))
    if (!isAbsolute) {
      throw new Error('path must be absolute, path = ' + path)
    }
    const names = Path.getNames(path)
    const itemName = names[names.length - 1]
    const parentPath = Path.join(...names.slice(0, -1))
    if (!itemName) {
      throw new Error('item name must not be empty, path = ' + path)
    }
    const parentDir = this.getDirectory(parentPath)
    if (!parentDir) {
      throw new Error('directory not found, path = ' + parentPath)
    }
    if (parentDir.hasItem(itemName)) {
      throw new Error('item already exists')
    }
    return [itemName, parentDir]
  }

  removeFile(path: string, force = false) {
    const file = this.getFile(path)
    if (file) {
      return file.remove()
    }
    if (!force) {
      throw new Error('file not found, path = ' + path)
    }
  }
  removeDirectory(path: string, force = false) {
    const directory = this.getDirectory(path)
    if (directory) {
      return directory.remove()
    }
    if (!force) {
      throw new Error('directory not found, path = ' + path)
    }
  }
  removeItem(path: string, force = false) {
    const item = this.getItem(path)
    if (item) {
      return item.remove()
    }
    if (!force) {
      throw new Error('file or directory not found, path = ' + path)
    }
  }

  removeAll() {
    this._root.getItems().forEach(item => item.remove())
  }
}
