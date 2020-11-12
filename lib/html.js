'use strict'

const fs = require('fs')
const Articles = require('articles')

module.exports = class HTML {
  constructor () {
  }

  build () {
    fs.readFile('tweets.txt', (err, data) => {
      if (err) {
        throw err;
      }

      let lines = data.toString().trim().split('\n');

      let body = []

      lines.reverse().forEach((line) => {

        if (/^[a|an] /.test(line)) {
          line = `I see ${line}`
        } else {
          const [head, ...rest] = line.split(' '); 
          let article = Articles.articlize(head)
          line = `I see ${article} ${rest.join(' ')}`
        }

        body.push(`<span>${line},</span> `)
      })

      body.push('<span>I see&hellip;</span>')
      body = body.join('')

      let top = '<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"><title>txtnau</title><style> body { font-size: 1.8em; line-height: 145%; font-weight: normal; margin: 3em; text-rendering: optimizeLegibility; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; } span { opacity: 0; transition: opacity 800ms ease-in-out; } span.is-visible { opacity: 1; } .Content { width: 800px; margin: auto; } </style> <script> window.onload = () => { let i = 0; document.querySelectorAll("span").forEach((item) => { i += 200; item.style.transitionDelay = `${i}ms`; item.classList.add("is-visible"); }) } </script> </head> <body> <div class="Content">'

      let bottom = '</div> </body> </html>'
      const html = `${top}${body}${bottom}`

      let fileName = 'www/index.html'
      let stream = fs.createWriteStream(fileName)

      stream.once('open', (fd) => {
        stream.end(html)
      })
    })
  }
}
