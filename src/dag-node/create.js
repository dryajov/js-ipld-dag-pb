'use strict'

const multihashing = require('multihashing-async')
const sortInplace = require('stable')
const dagPBUtil = require('../util.js')
const serialize = dagPBUtil.serialize
const dagNodeUtil = require('./util.js')
const linkSort = dagNodeUtil.linkSort
const DAGNode = require('./index.js')
const DAGLink = require('./../dag-link')

function create (data, dagLinks, hashAlg, callback) {
  if (typeof data === 'function') {
    callback = data
    data = undefined
  }
  if (typeof dagLinks === 'function') {
    callback = dagLinks
    dagLinks = []
  }
  if (typeof hashAlg === 'function') {
    callback = hashAlg
    hashAlg = undefined
  }

  if (!hashAlg) {
    hashAlg = 'sha2-256'
  }

  const links = dagLinks.map((l) => {
    if (!l.constructor && l.constructor.name !== 'DAGLink') {
      return l
    }

    const link = new DAGLink(l.name || l.Name,
                             l.size || l.Size,
                             l.hash || l.Hash || l.multihash)
    return link
  })

  sortInplace(links, linkSort)

  serialize({
    data: data,
    links: links
  }, (err, serialized) => {
    if (err) {
      return callback(err)
    }
    multihashing(serialized, hashAlg, (err, multihash) => {
      if (err) {
        return callback(err)
      }
      const dagNode = new DAGNode(data, links, serialized, multihash)
      callback(null, dagNode)
    })
  })
}

module.exports = create