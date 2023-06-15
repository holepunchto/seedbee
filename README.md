# seedbee

Bee for seeds

```
npm i seedbee
```

## Usage
```js
const SeedBee = require('seedbee')
const Hypercore = require('hypercore')

const core = new Hypercore('./storage')
const seed = new SeedBee(core)

const KEY = 'fbh6h7j9xgpsqeyke9rtzbcyowwobxfozhr3ukz9x64kf9zok41o'

await seed.put(KEY, { type: 'core' })
console.log('Initial', await seed.get(KEY)) // => { type, description, seeders }

for await (const entry of seed.entries()) {
  console.log('Entry', entry) // => { seq, key, value }

  await seed.edit(entry, { description: 'Some text' })
  console.log('After edited', await seed.get(KEY))
}

await seed.del(KEY)
console.log('After deleted', await seed.get(KEY)) // => null

await seed.close()
```

## API

#### `const seed = new SeedBee(core)`

Creates a Hyperbee adapted to store seeds. `core` must be a Hypercore instance.

#### `await seed.ready()`

Waits for the bee to be ready.

#### `await seed.close()`

Closes the underlying bee.

#### `await seed.put(key, options)`

Add a new seed to the list. `key` can be a Buffer or String.

Available `options`:
```js
{
  type: String, // Required as 'core', 'bee', or 'drive'
  description: String,
  seeders: Boolean
}
````

Notice that `type` is the only one required, the rest are optional.

#### `await seed.edit(entry, options)`

Modify an entry with new options. `entry` must be like `{ key, value }`.

Same `options` as `put` method.

#### `await seed.get(key, [options])`

Gets the value of a seed entry. `key` can be a Buffer or String.

Same `options` as `Hyperbee.get` method.

#### `await seed.del(key)`

Deletes a seed entry. `key` can be a Buffer or String.

#### `const iterator = await seed.entries([options])`

Read stream of entries.

Available `options`:
```js
{
  type: String // Filter by type
}
```

## License

Apache-2.0
