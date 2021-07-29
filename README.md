# File System Tree

File system tree implementation in JavaScript

## FileSystem API

| Method              | Return type  | Description                                             |
| ------------------- | ------------ | ------------------------------------------------------- |
| `copy()`            | `FileSystem` | make copy of entire file system                         |
| `getFile()`         | `File`       | returns file if exists                                  |
| `getDirectory()`    | `Directory`  | returns directory if exists                             |
| `getItem()`         | `Item`       | returns file or directory if exists                     |
| `createFile()`      | `File`       |                                                         |
| `createDirectory()` | `Directory`  |                                                         |
| `removeFile()`      | `boolean`    | throws exception if file is not found                   |
| `removeDirectory()` | `boolean`    | throws execption if directory is not found              |
| `removeItem()`      | `boolean`    | throws exception if neither file nor directory is found |

## Directory API

| Method                  | Return type | Description                                                |
| ----------------------- | ----------- | ---------------------------------------------------------- |
| `name`                  | `string`    | directory name                                             |
| `path`                  | `string`    | absolute path of directory                                 |
| `parent`                | `Directory` | parent directory                                           |
| `copy()`                | `Directory` | make copy of directory                                     |
| `hasItem()`             | `boolean`   |                                                            |
| `getItem()`             | `Item`      |                                                            |
| `getItems()`            | `Item[]`    |                                                            |
| `appendItem()`          | `boolean`   | `true` if new item is appended                             |
| `replaceItem()`         | `boolean`   | `true` if old item is replaced                             |
| `appendOrReplaceItem()` | `boolean`   | `true` if new item is appended, otherwise item is replaced |
| `removeItem()`          | `boolean`   | `true` if item removed                                     |
| `findItemFromPath()`    | `Item`      |                                                            |
| `remove()`              | `boolean`   | removes current directory from file system                 |
| `moveTo()`              | `boolean`   | moves current directory to given item                      |

## RootDirectory API

Inherits `Directory` methods, except

| Property | Value       |
| -------- | ----------- |
| `name`   | `""`        |
| `path`   | `"/"`       |
| `parent` | `undefined` |

## File API

| Method     | Return type | Description                   |
| ---------- | ----------- | ----------------------------- |
| `name`     | `string`    | file name                     |
| `path`     | `string`    | absolute path of file         |
| `parent`   | `Directory` | parent directory              |
| `copy()`   | `File`      | returns copy of current file  |
| `remove()` | `boolean`   | removes file from file system |
| `moveTo()` | `boolean`   | moves file to given directory |
