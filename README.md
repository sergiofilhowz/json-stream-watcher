# JSON Stream Watcher

This library helps streaming JSON in chunks and processes incoming properties in real time. You don't need to wait until the full JSON string is sent to start processing the output.

## Why JSON Stream Watcher?

This library was created to help streaming JSON that comes from Open AI and LLMs, because it sends the JSON output in chunks, and we would need to wait until the full request is processed (which can take several seconds or minutes).

With this library we can stream the chunks and put watchers whenever properties are ready to be read.

## How does this library work?

Say that you have an object that has array of data, and the array can have thousands of items, the whole JSON can take minutes to be sent. You can put watchers to get the results.

Example of a JSON output:

```typescript
type Item = {
  name: string
  intValue: number
}

type JSONOutput = {
  title: string
  items: Item[]
}
```

We can create a Stream Watcher to check whenever one of these fields are ready, here's how it works:

```typescript
const stream = new JSONStream<JSONOutput>()
const onTitle = (title: string) => console.log('Title was sent:', title)
const onItem = (item: Item) => console.log('Item was sent:', item)
const onItemName = (itemName: string) => console.log('Item name was sent:', itemName)

stream.onProperty('title', onTitle) // you can watch an object field
stream.onProperty('item', onItem) // you can watch every item in a list
stream.onProperty('item[*].name', onItemName) // you can watch every field of a list item
stream.onProperty('item[0]', onItem) // you can watch specific index of a list
stream.onProperty('item[0].name', onItemName) // you can watch specific index of a list

// example of process to write JSON to stream
const openAiStream = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Say this is a test' }],
  stream: true,
  // function call
})

for await (const chunk of openAiStream) {
  stream.write(chunk.choices[0]?.delta?.content || '')
}
```

## Benchmarks

Performance is not the top priority here, since this project was made to reduce wait time of minutes from OpenAI API to seconds. But there's one test case that processes 240kb JSON split in thousands of chunks.

It takes 90ms to process the full 240kb JSON split in thousand of chunks on a Mac M1 Ultra.

## JSON Validation

This package assumes the JSON output is valid and does not perform any validation. This may come in later versions, but for now it's as simple as possible.
