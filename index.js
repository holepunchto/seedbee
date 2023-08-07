const Id = require('hypercore-id-encoding')
const Hyperbee = require('hyperbee')
const ReadyResource = require('ready-resource')
const b4a = require('b4a')
const { contentKeyEncoding, contentValueEncoding } = require('./encoding.js')
const SubEncoder = require('sub-encoder')

const types = ['core', 'bee', 'drive']

const enc = new SubEncoder()
const content = enc.sub(b4a.from([0]), { keyEncoding: contentKeyEncoding })
const metadata = enc.sub(b4a.from([1]), { keyEncoding: 'utf-8' })

module.exports = class SeedBee extends ReadyResource {
  constructor (core) {
    super()

    this.core = core
    this.bee = new Hyperbee(core)
  }

  static ALLOWED_PEERS_METADATA_KEY = 'allowed-peers'

  _open () {
    return this.bee.ready()
  }

  _close () {
    return this.bee.close()
  }

  putProperty (key, value) {
    return this.bee.put(key, value, { keyEncoding: metadata, valueEncoding: 'uft-8' })
  }

  async getProperty (key) {
    const entry = await this.bee.get(key, { keyEncoding: metadata, valueEncoding: 'utf-8' })
    return entry ? entry.value : null
  }

  async put (key, opts = {}) {
    key = Id.decode(key)
    if (types.indexOf(opts.type) === -1) throw new Error('Invalid type: ' + opts.type)

    return this.bee.put(key, {
      type: opts.type,
      description: opts.description || '',
      seeders: !!opts.seeders
    }, { keyEncoding: content, valueEncoding: contentValueEncoding, cas })
  }

  async edit (prev, opts = {}) {
    return this.put(prev.key, Object.assign({}, prev.value, opts))
  }

  async get (key, opts) {
    key = Id.decode(key)
    const entry = await this.bee.get(key, { keyEncoding: content, valueEncoding: contentValueEncoding, ...opts })
    return entry ? entry.value : null
  }

  async del (key) {
    key = Id.decode(key)
    return this.bee.del(key, { keyEncoding: content }) // TODO: cas?
  }

  async * entries (opts = {}) {
    for await (const e of this.bee.createReadStream({ keyEncoding: content, valueEncoding: contentValueEncoding, ...opts })) {
      if (opts.type && opts.type !== e.value.type) continue
      yield e
    }
  }
}

function cas (prev, next) {
  if (prev.value.type !== next.value.type) return true
  if (prev.value.description !== next.value.description) return true
  if (prev.value.seeders !== next.value.seeders) return true
  return false
}
