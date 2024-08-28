import { JsonAppender } from './json-appender'

describe('JSON Appender', () => {
  describe('Object', () => {
    it('should append properties inside object', () => {
      const appender = new JsonAppender()
      let result = appender.append('{"age')

      expect(appender.root).toEqual({ key: '', type: 'object', value: {} })
      expect(appender.stack).toEqual([
        { key: '', type: 'object', value: {} },
        { key: 'age', isCreatingKey: true },
      ])
      expect(result).toEqual([])

      result = appender.append('"')

      expect(appender.stack).toEqual([{ key: '', type: 'object', value: {} }, { key: 'age' }])
      expect(result).toEqual([])

      result = appender.append(':1')

      expect(appender.stack).toEqual([
        { key: '', type: 'object', value: {} },
        { key: 'age', type: 'number', value: '1' },
      ])
      expect(result).toEqual([])

      result = appender.append(',')
      expect(appender.stack).toEqual([{ key: '', type: 'object', value: { age: 1 } }])
      expect(result).toEqual([{ key: 'age', value: 1, type: 'number' }])
    })

    it('should stream string under object correctly', () => {
      const appender = new JsonAppender()
      let result = appender.append('{"name')

      expect(appender.root).toEqual({ key: '', type: 'object', value: {} })
      expect(appender.stack).toEqual([
        { key: '', type: 'object', value: {} },
        { key: 'name', isCreatingKey: true },
      ])
      expect(result).toEqual([])

      result = appender.append('":"Alice"')
      expect(appender.root).toEqual({ key: '', type: 'object', value: { name: 'Alice' } })
      expect(appender.stack).toEqual([{ key: '', type: 'object', value: { name: 'Alice' } }])
      expect(result).toEqual([{ key: 'name', value: 'Alice', type: 'string' }])

      result = appender.append(',"age":30')
      expect(appender.root).toEqual({ key: '', type: 'object', value: { name: 'Alice' } })
      expect(appender.stack).toEqual([
        { key: '', type: 'object', value: { name: 'Alice' } },
        { key: 'age', value: '30', type: 'number' },
      ])
      expect(result).toEqual([])

      result = appender.append('}')
      expect(appender.root).toEqual({ key: '', type: 'object', value: { name: 'Alice', age: 30 } })
      expect(appender.stack).toEqual([])
      expect(result).toEqual([
        { key: 'age', value: 30, type: 'number' },
        { key: '', value: { name: 'Alice', age: 30 }, type: 'object' },
      ])
    })

    it('should read property with escape character', () => {
      const appender = new JsonAppender()

      let result = appender.append('{"na\\"')
      expect(appender.root).toEqual({ key: '', type: 'object', value: {} })
      expect(appender.stack).toEqual([
        { key: '', type: 'object', value: {} },
        { key: 'na"', isCreatingKey: true },
      ])
      expect(result).toEqual([])

      result = appender.append('me"')
      expect(appender.root).toEqual({ key: '', type: 'object', value: {} })
      expect(appender.stack).toEqual([{ key: '', type: 'object', value: {} }, { key: 'na"me' }])
      expect(result).toEqual([])

      result = appender.append(': "Alice"')
      expect(appender.root).toEqual({ key: '', type: 'object', value: { 'na"me': 'Alice' } })
      expect(appender.stack).toEqual([{ key: '', type: 'object', value: { 'na"me': 'Alice' } }])
      expect(result).toEqual([{ key: 'na"me', type: 'string', value: 'Alice' }])
    })
  })

  describe('String', () => {
    it('should append string inside array', () => {
      const appender = new JsonAppender()

      let result = appender.append('["Al')
      expect(appender.root).toEqual({ key: '', type: 'array', value: [] })
      expect(appender.stack).toEqual([
        { key: '', type: 'array', value: [] },
        { key: '[0]', type: 'string', value: 'Al' },
      ])
      expect(result).toEqual([])

      result = appender.append('\\n')
      expect(appender.root).toEqual({ key: '', type: 'array', value: [] })
      expect(appender.stack).toEqual([
        { key: '', type: 'array', value: [] },
        { key: '[0]', type: 'string', value: 'Al\n' },
      ])
      expect(result).toEqual([])

      result = appender.append('\\"')
      expect(appender.root).toEqual({ key: '', type: 'array', value: [] })
      expect(appender.stack).toEqual([
        { key: '', type: 'array', value: [] },
        { key: '[0]', type: 'string', value: 'Al\n"' },
      ])
      expect(result).toEqual([])

      result = appender.append('ice"')
      expect(appender.root).toEqual({ key: '', type: 'array', value: ['Al\n"ice'] })
      expect(appender.stack).toEqual([{ key: '', type: 'array', value: ['Al\n"ice'] }])
      expect(result).toEqual([{ key: '[0]', type: 'string', value: 'Al\n"ice' }])
    })
  })

  describe('Boolean', () => {
    it('should append boolean', () => {
      const appender = new JsonAppender()

      let result = appender.append('tr')
      expect(appender.root).toEqual({ key: '', type: 'boolean', value: 'tr' })
      expect(appender.stack).toEqual([{ key: '', type: 'boolean', value: 'tr' }])
      expect(result).toEqual([])

      result = appender.append('ue')
      expect(appender.stack).toEqual([])
      expect(result).toEqual([{ key: '', type: 'boolean', value: true }])
    })

    it('should append boolean false', () => {
      const appender = new JsonAppender()

      let result = appender.append('fa')
      expect(appender.root).toEqual({ key: '', type: 'boolean', value: 'fa' })
      expect(appender.stack).toEqual([{ key: '', type: 'boolean', value: 'fa' }])
      expect(result).toEqual([])

      result = appender.append('lse')
      expect(appender.stack).toEqual([])
      expect(result).toEqual([{ key: '', type: 'boolean', value: false }])
    })
  })

  describe('Null', () => {
    it('should append null', () => {
      const appender = new JsonAppender()

      let result = appender.append('nu')
      expect(appender.root).toEqual({ key: '', type: 'null', value: 'nu' })
      expect(appender.stack).toEqual([{ key: '', type: 'null', value: 'nu' }])
      expect(result).toEqual([])

      result = appender.append('ll')
      expect(appender.stack).toEqual([])
      expect(result).toEqual([{ key: '', type: 'null', value: null }])
    })
  })

  describe('Array', () => {
    it('should append empty array', () => {
      const appender = new JsonAppender()

      let result = appender.append('[')
      expect(appender.root).toEqual({ key: '', type: 'array', value: [] })
      expect(appender.stack).toEqual([{ key: '', type: 'array', value: [] }, { key: '[0]' }])
      expect(result).toEqual([])

      result = appender.append(']')
      expect(appender.stack).toEqual([])
      expect(result).toEqual([{ key: '', type: 'array', value: [] }])
    })

    it('should append empty array inside object', () => {
      const appender = new JsonAppender()

      let result = appender.append('{"list":[')
      expect(appender.root).toEqual({ key: '', type: 'object', value: {} })
      expect(appender.stack).toEqual([
        { key: '', type: 'object', value: {} },
        { key: 'list', type: 'array', value: [] },
        { key: 'list[0]' },
      ])
      expect(result).toEqual([])

      result = appender.append(']')
      expect(appender.root).toEqual({ key: '', type: 'object', value: { list: [] } })
      expect(appender.stack).toEqual([{ key: '', type: 'object', value: { list: [] } }])
      expect(result).toEqual([{ key: 'list', type: 'array', value: [] }])

      result = appender.append('}')
      expect(appender.root).toEqual({ key: '', type: 'object', value: { list: [] } })
      expect(appender.stack).toEqual([])
      expect(result).toEqual([{ key: '', type: 'object', value: { list: [] } }])
    })
  })
})
