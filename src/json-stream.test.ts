import { JSONStream } from './json-stream'

describe('JSON Stream', () => {
  it('should stream correctly', () => {
    const stream = new JSONStream<{ name: string; age: number }>()
    const checkName = jest.fn((prop: string) => expect(prop).toBe('Alice'))

    stream.onProperty('name', checkName)

    stream.write('{"name')
    expect(checkName).toHaveBeenCalledTimes(0)
    stream.write('":"Alice"')
    expect(checkName).toHaveBeenCalledTimes(1)
    stream.write(',"age":30')
    stream.write('}')
    stream.close()

    expect(checkName).toHaveBeenCalledTimes(1)
  })

  it('Type Definition', () => {
    const onProp = jest.fn(() => {})

    new JSONStream<{ name: string; age: number }>() //
      .onProperty('name', onProp)

    new JSONStream<{ isEnabled: boolean }>() //
      .onProperty('isEnabled', onProp)

    new JSONStream<{ date: Date }>() //
      .onProperty('date', onProp)

    new JSONStream<Array<boolean>>() //
      .onProperty('[1]', onProp)
      .onProperty('[*]', onProp)

    new JSONStream<{ name: string; age: number; preference: { isEnabled: boolean } }>() //
      .onProperty('name', onProp)
      .onProperty('age', onProp)
      .onProperty('preference', onProp)
      .onProperty('preference.isEnabled', onProp)

    new JSONStream<{ name: string; age: number }[]>() //
      .onProperty('[0]', onProp)
      .onProperty('[*].age', onProp)
      .onProperty('[*].name', onProp)

    new JSONStream<{ users: { name: string }[] }>() //
      .onProperty('users', onProp)
      .onProperty('users[0]', onProp)
      .onProperty('users[0].name', onProp)

    new JSONStream<Array<Array<{ name: string; age: number }>>>() //
      .onProperty('[0]', onProp)
      .onProperty('[0][1].name', onProp)
      .onProperty('[0][1]', onProp)
  })

  it('should properly stream numbers', () => {
    const stream = new JSONStream<{ name: string; age: number }>()
    const checkAge = jest.fn((prop: string) => expect(prop).toBe(30))

    stream.onProperty('age', checkAge)

    stream.write('{"name')
    expect(checkAge).toHaveBeenCalledTimes(0)
    stream.write('":"Alice"')
    expect(checkAge).toHaveBeenCalledTimes(0)
    stream.write(',"age":3')
    expect(checkAge).toHaveBeenCalledTimes(0)
    stream.write('0}')
    stream.close()

    expect(checkAge).toHaveBeenCalledTimes(1)
  })

  it('should stream array', () => {
    const stream = new JSONStream<{ users: { name: string }[] }>()
    const usernames: string[] = []
    const checkUsers = jest.fn((users: any) => expect(users).toEqual([{ name: 'Alice' }, { name: 'Bob' }]))
    const checkSecondUser = jest.fn((name: any) => expect(name).toBe('Bob'))
    const checkUsernames = jest.fn((prop: string) => usernames.push(prop))

    stream.onProperty('users[*].name', checkUsernames)
    stream.onProperty('users[1].name', checkSecondUser)
    stream.onProperty('users', checkUsers)

    stream.write('{"users":[{"name')
    expect(checkUsernames).toHaveBeenCalledTimes(0)
    expect(checkSecondUser).toHaveBeenCalledTimes(0)
    expect(checkUsers).toHaveBeenCalledTimes(0)
    stream.write('":"Alice')
    expect(checkUsernames).toHaveBeenCalledTimes(0)
    expect(checkSecondUser).toHaveBeenCalledTimes(0)
    expect(checkUsers).toHaveBeenCalledTimes(0)
    expect(usernames).toEqual([])

    stream.write('"},{"na')
    expect(checkUsernames).toHaveBeenCalledTimes(1)
    expect(checkSecondUser).toHaveBeenCalledTimes(0)
    expect(checkUsers).toHaveBeenCalledTimes(0)
    expect(usernames).toEqual(['Alice'])

    stream.write('me":"Bob"')
    expect(checkUsernames).toHaveBeenCalledTimes(2)
    expect(checkSecondUser).toHaveBeenCalledTimes(1)
    expect(checkUsers).toHaveBeenCalledTimes(0)
    expect(usernames).toEqual(['Alice', 'Bob'])

    stream.write('}')
    expect(checkUsernames).toHaveBeenCalledTimes(2)
    expect(checkSecondUser).toHaveBeenCalledTimes(1)
    expect(checkUsers).toHaveBeenCalledTimes(0)
    stream.write(']')
    expect(checkUsernames).toHaveBeenCalledTimes(2)
    expect(checkSecondUser).toHaveBeenCalledTimes(1)
    expect(checkUsers).toHaveBeenCalledTimes(1)
    expect(usernames).toEqual(['Alice', 'Bob'])

    stream.write('}')
    stream.close()

    expect(checkUsernames).toHaveBeenCalledTimes(2)
    expect(checkSecondUser).toHaveBeenCalledTimes(1)
    expect(checkUsers).toHaveBeenCalledTimes(1)
  })

  it('should stream array of numbers', () => {
    const stream = new JSONStream<number[]>()
    const numbers: number[] = []
    const checkNumbers = jest.fn((prop: number) => numbers.push(prop))

    stream.onProperty('[*]', checkNumbers)

    stream.write('[1')
    expect(checkNumbers).toHaveBeenCalledTimes(0)
    stream.write('2,33')
    expect(checkNumbers).toHaveBeenCalledTimes(1)
    stream.write(']')
    expect(checkNumbers).toHaveBeenCalledTimes(2)
    stream.close()

    expect(numbers).toEqual([12, 33])
    expect(checkNumbers).toHaveBeenCalledTimes(2)
  })

  it('should stream empty array', () => {
    const stream = new JSONStream<{ list: string[] }>()
    const checkList = jest.fn((list: string[]) => expect(list).toEqual([]))

    stream.onProperty('list', checkList)

    stream.write('{"list":[')
    expect(checkList).toHaveBeenCalledTimes(0)
    stream.write(']')
    expect(checkList).toHaveBeenCalledTimes(1)
    stream.write('}')
    expect(checkList).toHaveBeenCalledTimes(1)
    stream.close()
  })

  it('should stream string escape characters in different chunks', () => {
    const stream = new JSONStream<{ name: string }>()
    const checkName = jest.fn((prop: string) => expect(prop).toBe('\\'))

    stream.onProperty('name', checkName)

    stream.write('{"name')
    expect(checkName).toHaveBeenCalledTimes(0)
    stream.write('":"\\')
    expect(checkName).toHaveBeenCalledTimes(0)
    stream.write('\\')
    expect(checkName).toHaveBeenCalledTimes(0)
    stream.write('"}')
    expect(checkName).toHaveBeenCalledTimes(1)
    stream.close()

    expect(checkName).toHaveBeenCalledTimes(1)
  })

  it('should throw error when writing closed stream', () => {
    const stream = new JSONStream<{}>()

    stream.write('{}')
    stream.close()
    expect(() => stream.write('')).toThrow('Stream is closed')
  })
})
