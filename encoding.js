const c = require('compact-encoding')

const keyEncoding = c.fixed32

const valueEncoding = {
  preencode (state, v) {
    c.string.preencode(state, v.type)
    c.string.preencode(state, v.description)
    c.bool.preencode(state, v.seeders)
    peersEncoding.preencode(state, v.peers)
  },
  encode (state, v) {
    c.string.encode(state, v.type)
    c.string.encode(state, v.description)
    c.bool.encode(state, v.seeders)
    peersEncoding.encode(state, v.peers)
  },
  decode (state) {
    return {
      type: c.string.decode(state),
      description: c.string.decode(state),
      seeders: c.bool.decode(state),
      peers: peersEncoding.decode(state)
    }
  }
}

const peersEncoding = c.array(c.fixed32)

module.exports = { keyEncoding, valueEncoding }
