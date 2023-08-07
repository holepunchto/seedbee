const SubEncoder = require('sub-encoder')
const c = require('compact-encoding')
const b4a = require('b4a')

const enc = new SubEncoder()

const contentValueEncoding = {
  preencode (state, v) {
    c.string.preencode(state, v.type)
    c.string.preencode(state, v.description)
    c.bool.preencode(state, v.seeders)
  },
  encode (state, v) {
    c.string.encode(state, v.type)
    c.string.encode(state, v.description)
    c.bool.encode(state, v.seeders)
  },
  decode (state) {
    return {
      type: c.string.decode(state),
      description: c.string.decode(state),
      seeders: c.bool.decode(state)
    }
  }
}

module.exports = {
  contentEncoding: {
    keyEncoding: enc.sub(b4a.from([0]), { keyEncoding: c.fixed32 }),
    valueEncoding: contentValueEncoding
  },
  metadataEncoding: {
    keyEncoding: enc.sub(b4a.from([1]), { keyEncoding: 'utf-8' }),
    valueEncoding: 'utf-8'
  }
}
