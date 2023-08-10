const Id = require('hypercore-id-encoding')
const Hyperbee = require('hyperbee')
const ReadyResource = require('ready-resource')
const { contentEncoding, metadataEncoding } = require('./encoding.js')

const types = ['core', 'bee', 'drive']

module.exports = class SeedBee extends ReadyResource {
  constructor (core) {
    super()

    this.core = core
    this.bee = new Hyperbee(core)
  }

  _open () {
    return this.bee.ready()
  }

  _close () {
    return this.bee.close()
  }

  putProperty (key, value) {
    return this.bee.put(key, value, metadataEncoding)
  }

  async getProperty (key) {
    const entry = await this.bee.get(key, metadataEncoding)
    return entry ? entry.value : null
  }

  async put (key, opts = {}) {
    key = Id.decode(key)
    if (types.indexOf(opts.type) === -1) throw new Error('Invalid type: ' + opts.type)

    return this.bee.put(key, {
      type: opts.type,
      description: opts.description || '',
      seeders: !!opts.seeders
    }, { ...contentEncoding, cas })
  }

  async edit (prev, opts = {}) {
    return this.put(prev.key, Object.assign({}, prev.value, opts))
  }

  async get (key, opts) {
    key = Id.decode(key)
    const entry = await this.bee.get(key, { ...contentEncoding, ...opts })
    return entry ? entry.value : null
  }

  async del (key) {
    key = Id.decode(key)
    return this.bee.del(key, contentEncoding) // TODO: cas?
  }

  async * entries (opts = {}) {
    for await (const e of this.bee.createReadStream({ ...contentEncoding, ...opts })) {
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
