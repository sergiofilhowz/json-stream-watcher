import { JsonAppender } from './json-appender'
import { NestedKeys, Observer } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class JSONStream<T = any> {
  private appender: JsonAppender
  private propertyObservers: { [path: string]: Observer[] } = {}
  private isClosed: boolean

  constructor() {
    this.appender = new JsonAppender()
    this.propertyObservers = {}
    this.isClosed = false
  }

  onProperty(path: NestedKeys<T>, callback: Observer): this {
    this.propertyObservers[path] = this.propertyObservers[path] || []
    this.propertyObservers[path].push(callback)

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
      }

      if (key.includes('[')) {
        observers.push(...(this.propertyObservers[key.replace(/\[\d+\]/, '[*]')] ?? []))
      }

      observers.forEach((observer) => observer(value))
    }
  }

  close() {
    this.isClosed = true
  }
}
