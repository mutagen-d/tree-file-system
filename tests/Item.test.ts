import { Item } from '..'

describe('Item', () => {
  test('name', () => {
    const item = new Item('name')
    expect(item.path).toEqual('name')
  })
  test('empty name error', () => {
    const createItemWithEmptyName = (name?: string) => {
      try {
        // @ts-ignore
        return new Item(name)
      } catch (e) {
        expect(e.message).toEqual('name must not be empty')
      }
    }
    expect.assertions(5)
    createItemWithEmptyName()
    createItemWithEmptyName('')
    createItemWithEmptyName('  ')
    // @ts-ignore
    createItemWithEmptyName(0)
    // @ts-ignore
    createItemWithEmptyName(null)
  })
  test('invalid name value', () => {
    const createItemWithInvalidName = (name: string) => {
      try {
        new Item(name)
      } catch (e) {
        expect(e.message).toEqual('name contains invalid symbol')
      }
    }
    expect.assertions(1)
    createItemWithInvalidName('name/of/item')
  })
  test('getItem[s]', () => {
    const item = new Item('name')
    expect(item.getItem('some-name')).toEqual(undefined)
    expect(item.getItem('other-name')).toEqual(undefined)

    expect(item.getItems()).toEqual([])
  })
  test('copy', () => {
    const copy = (item: Item) => {
      const copiedItem = item.copy()
      expect(copiedItem.path).toEqual(item.path)
      expect(copiedItem.name).toEqual(item.name)
    }

    copy(new Item('name'))
    copy(new Item('other-name'))
    copy(new Item('item'))
  })
})
