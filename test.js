const test = require('brittle')
const SeedBee = require('./index.js')
const RAM = require('random-access-memory')
const Hypercore = require('hypercore')
const Id = require('hypercore-id-encoding')

const K = 'fbh6h7j9xgpsqeyke9rtzbcyowwobxfozhr3ukz9x64kf9zok41o'

test('basic', async function (t) {
  t.plan(6)

  const seed = new SeedBee(new Hypercore(RAM))

  t.ok(seed.core)
  t.ok(seed.bee)

  await seed.put(K, { type: 'core' })

  t.alike(await seed.get(K), {
    type: 'core',
    description: '',
    seeders: false
  })

  let entry = null
  for await (const e of seed.entries()) { // eslint-disable-line no-unreachable-loop
    entry = e
    break
  }

  t.alike(entry, {
    seq: 1,
    key: Id.decode(K),
    value: {
      type: 'core',
      description: '',
      seeders: false
    }
  })

  await seed.edit(entry, { description: 'Some text' })

  t.alike(await seed.get(K), {
    type: 'core',
    description: 'Some text',
    seeders: false
  })

  await seed.del(K)

  t.is(await seed.get(K), null)

  await seed.close()
})

test('try to repeat the same entry', async function (t) {
  t.plan(5)

  const seed = new SeedBee(new Hypercore(RAM))
  t.is(seed.bee.version, 1)

  await seed.put(K, { type: 'core' })
  t.is(seed.bee.version, 2)

  await seed.put(K, { type: 'core' })
  t.is(seed.bee.version, 2)

  await seed.put(K, { type: 'core', description: 'Updated' })
  t.is(seed.bee.version, 3)

  await seed.put(K, { type: 'core', description: 'Updated' })
  t.is(seed.bee.version, 3)

  await seed.close()
})

test('invalid key', async function (t) {
  t.plan(1)

  const seed = new SeedBee(new Hypercore(RAM))

  try {
    await seed.put('random-invalid-key')
  } catch (err) {
    t.is(err.message, 'Invalid Hypercore key')
  }

  await seed.close()
})

test('empty or invalid type', async function (t) {
  t.plan(2)

  const seed = new SeedBee(new Hypercore(RAM))

  try {
    await seed.put(K)
  } catch (err) {
    t.ok(err.message.startsWith('Invalid type'))
  }

  try {
    await seed.put(K, { type: 'seeders' })
  } catch (err) {
    t.ok(err.message.startsWith('Invalid type'))
  }

  await seed.close()
})

test('invalid encoding values', async function (t) {
  t.plan(1)

  const seed = new SeedBee(new Hypercore(RAM))

  try {
    await seed.put(K, { type: 'core', description: 123 })
  } catch (err) {
    t.is(err.code, 'ERR_INVALID_ARG_TYPE') // CompactEncoding error
  }

  await seed.close()
})

test('put/get/del metadata', async function (t) {
  t.plan(3)

  const seed = new SeedBee(new Hypercore(RAM))
  const key = 'key'
  const value = '*'

  t.is(null, await seed.metadata.get(key))

  await seed.metadata.put(key, value)
  t.is(value, await seed.metadata.get(key))

  await seed.metadata.del(key)
  t.is(null, await seed.metadata.get(key))

  await seed.close()
})
