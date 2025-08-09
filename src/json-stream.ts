import { JsonAppender } from './json-appender'
import { NestedKeys, Observer, OnPropertyOptions } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class JSONStream<T = any> {
  private appender: JsonAppender
  private partialObservers: { [path: string]: Observer[] } = {}
  private propertyObservers: { [path: string]: Observer[] } = {}
  private partialObserversCount: { value: number } = { value: 0 }
  private isClosed: boolean

  constructor() {
    this.appender = new JsonAppender()
    this.propertyObservers = {}
    this.isClosed = false
  }

  onProperty(path: NestedKeys<T>, callback: Observer, options: OnPropertyOptions = {}): this {
    this.propertyObservers[path] = this.propertyObservers[path] || []
    this.propertyObservers[path].push(callback)

    if (options.partial) {
      this.partialObservers[path] = this.partialObservers[path] || []
      this.partialObservers[path].push(callback)
      this.partialObserversCount.value++
    }

    return this
  }

  object(): T {
    return this.appender.root.value as T
  }

  write(data: string) {
    if (this.isClosed) {
      throw new Error('Stream is closed')
    }

    const elements = this.appender.append(data)

    for (const { key, value } of elements) {
      const observers = this.propertyObservers[key] ?? []

      if (observers) {
        // once we use the observer, we remove it from the list for performance reasons
        delete this.propertyObservers[key]

        if (this.partialObservers[key]) {
          delete this.partialObservers[key]
          this.partialObserversCount.value--
        }
      }

      if (key.includes('[')) {
        observers.push(...(this.propertyObservers[key.replace(/\[\d+\]/, '[*]')] ?? []))
      }

      observers.forEach((observer) => observer(value, false))
    }

    if (this.partialObserversCount.value === 0) {
      return
    }

    const partial = this.appender.stack.filter(({ isCreatingKey }) => !isCreatingKey)

    for (const { key, value } of partial) {
      const observers = this.partialObservers[key] ?? []

      if (observers) {
        observers.forEach((observer) => observer(value, true))
      }
    }
  }

  close() {
    this.isClosed = true
  }
}
