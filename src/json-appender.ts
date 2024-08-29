type JsonElement = {
  key: string
  isCreatingKey?: boolean
  type?: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any
}

export class JsonAppender {
  public root: JsonElement
  public stack: JsonElement[] = []
  private isEscaped = false

  constructor() {
    this.root = { key: '' }
    this.stack = [this.root]
  }

  append(chunk: string): JsonElement[] {
    const results: JsonElement[] = []
    let currentElement: JsonElement | undefined = this.stack[this.stack.length - 1]

    const onComplete = (element: JsonElement) => {
      results.push(element)
      this.stack.pop()
      currentElement = this.stack.length ? this.stack[this.stack.length - 1] : undefined

      if (currentElement?.type === 'array') {
        currentElement.value.push(element.value)
      } else if (currentElement?.type === 'object') {
        const key = element.key.split('.').pop()!
        currentElement.value[key] = element.value
      }
    }

    for (let i = 0; i < chunk.length; i++) {
      const char = chunk[i]

      /* istanbul ignore next */
      if (!currentElement) {
        currentElement = { key: '' }
        this.root = currentElement
        this.stack.push(currentElement)
      }

      if (!currentElement.type) {
        if (currentElement.isCreatingKey) {
          if (char === '"' && !this.isEscaped) {
            delete currentElement.isCreatingKey
          } else if (char === '\\' && !this.isEscaped) {
            this.isEscaped = true
          } else {
            currentElement.key += char
            this.isEscaped = false
          }
        } else if (char === '{') {
          currentElement.type = 'object'
          currentElement.value = {}
        } else if (char === '[') {
          currentElement.type = 'array'
          currentElement.value = []

          currentElement = { key: `${currentElement.key}[${currentElement.value.length}]` }
          this.stack.push(currentElement)
        } else if (char === '"') {
          currentElement.type = 'string'
          currentElement.value = ''
        } else if (/[0-9]/.test(char)) {
          currentElement.type = 'number'
          currentElement.value = char
        } else if (char === 't' || char === 'f') {
          currentElement.type = 'boolean'
          currentElement.value = char
        } else if (char === 'n') {
          currentElement.type = 'null'
          currentElement.value = char
        } else if (char === ']' && /.*\[0\]$/.test(currentElement.key)) {
          this.stack.pop()
          /* istanbul ignore next */
          currentElement = this.stack.length ? this.stack[this.stack.length - 1] : undefined
          onComplete(currentElement!)
        }

        continue
      }

      if (currentElement.type === 'string') {
        if (char === '"' && !this.isEscaped) {
          onComplete(currentElement)
        } else if (char === '\\' && !this.isEscaped) {
          this.isEscaped = true
        } else if (char === 'n' && this.isEscaped) {
          currentElement.value += '\n'
          this.isEscaped = false
        } else {
          this.isEscaped = false
          currentElement.value += char
        }

        continue
      }

      if (currentElement.type === 'boolean') {
        currentElement.value += char

        if (char === 'e') {
          currentElement.value = currentElement.value === 'true'
          onComplete(currentElement)
        }

        continue
      }

      if (currentElement.type === 'null') {
        currentElement.value += char

        if (currentElement.value === 'null') {
          currentElement.value = null
          onComplete(currentElement)
        }
        continue
      }

      if (currentElement.type === 'number') {
        if (/[0-9]/.test(char)) {
          currentElement.value += char
        } else {
          currentElement.value = parseInt(currentElement.value)
          onComplete(currentElement)
        }
      }

      if (currentElement.type === 'object') {
        if (char === '"') {
          const key: string = currentElement.key ? `${currentElement.key}.` : ''
          currentElement = { key, isCreatingKey: true }
          this.stack.push(currentElement)
        } else if (char === '}') {
          onComplete(currentElement)
        }
      } else if (currentElement.type === 'array') {
        if (char === ',') {
          currentElement = { key: `${currentElement.key}[${currentElement.value.length}]` }
          this.stack.push(currentElement)
        } else if (char === ']') {
          onComplete(currentElement)
        }
      }
    }

    return results
  }
}
