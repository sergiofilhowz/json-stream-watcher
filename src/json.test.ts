import faker from 'faker'
import { JSONStream } from './json-stream'

const createBigArrayObject = (size: number) => {
  const arr = []
  for (let i = 0; i < size; i++) {
    arr.push({
      name: faker.name.firstName(),
      age: faker.datatype.number({ min: 10, max: 70 }),
      description: faker.lorem.paragraph(),
    })
  }

  return arr
}

describe('JSONStream performance', () => {
  const bigArray = createBigArrayObject(1000)
  const bigJson = JSON.stringify(bigArray)
  const chunks: string[] = []

  beforeAll(() => {
    //

    let index = 0

    while (index < bigJson.length) {
      const chunkSize = faker.datatype.number({ min: 10, max: 100 })
      const chunk = bigJson.slice(index, index + chunkSize)
      chunks.push(chunk)
      index += chunkSize
    }
  })

  it('should stream big object of size 240kb', () => {
    const stream = new JSONStream()
    let nameIndex = 0
    let ageIndex = 0
    let descIndex = 0
    stream.onProperty('[*].name', (name) => expect(name).toBe(bigArray[nameIndex++].name))
    stream.onProperty('[*].age', (age) => expect(age).toBe(bigArray[ageIndex++].age))
    stream.onProperty('[*].description', (desc) => expect(desc).toBe(bigArray[descIndex++].description))

    chunks.forEach((chunk) => stream.write(chunk))
    stream.close()
  })
})
