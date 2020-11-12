'use strict'

const Articles = require('articles')

module.exports = class Tools {
  constructor () {
  }

  articlice (line) {
    if (/^[a|an] /.test(line)) {
      line = `I see ${line}`
    } else {
      const [head, ...rest] = line.split(' '); 
      let article = Articles.articlize(head)
      line = `I see ${article} ${rest.join(' ')}`
    }

    return line
  }
}
